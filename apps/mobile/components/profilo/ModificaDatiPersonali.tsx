// Componente ModificaDatiPersonali.
// Consente al cliente di aggiornare peso, altezza, obiettivo e foto profilo.
// Salva su Supabase e inserisce automaticamente la metrica del peso se modificata.

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useConnessione } from '../../hooks/useConnessione';
import { aggiornaProfiloLocale, aggiungiMisurazioneLocale } from '../../lib/database-locale';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { ClientMetric } from '@nutriflow/types';

export const ModificaDatiPersonali: React.FC = () => {
  const cliente = useAuthStore((stato) => stato.cliente);
  const impostaCliente = useAuthStore((stato) => stato.impostaCliente);
  const { isOffline } = useConnessione();

  // Stati del form inizializzati con i valori correnti del cliente
  const [peso, impostaPeso] = useState(cliente?.weight ? String(cliente.weight) : '');
  const [altezza, impostaAltezza] = useState(cliente?.height ? String(cliente.height) : '');
  const [obiettivo, impostaObiettivo] = useState<'lose' | 'maintain' | 'gain'>(cliente?.target || 'maintain');
  const [urlFoto, impostaUrlFoto] = useState<string | undefined>(cliente?.avatarUrl);

  const [inSalvataggio, impostaInSalvataggio] = useState(false);
  const [inCaricamentoFoto, impostaInCaricamentoFoto] = useState(false);
  const [messaggioSuccesso, impostaMessaggioSuccesso] = useState<string | null>(null);
  const [errore, impostaErrore] = useState<string | null>(null);

  // Gestisco la selezione dell'immagine del profilo dalla galleria
  const gestisciSelezionaAvatar = async () => {
    if (isOffline) {
      alert('Non puoi aggiornare la foto del profilo in modalità offline.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permesso di accesso alla galleria negato.');
      return;
    }

    const risultato = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!risultato.canceled && risultato.assets && risultato.assets[0]) {
      const uriFoto = risultato.assets[0].uri;
      await uploadAvatar(uriFoto);
    }
  };

  // Carico l'avatar su Supabase Storage e aggiorno il profilo del cliente
  const uploadAvatar = async (uri: string) => {
    if (!cliente?.id) return;
    
    impostaInCaricamentoFoto(true);
    try {
      const risposta = await fetch(uri);
      const blob = await risposta.blob();
      
      const percorsoFile = `${cliente.id}/profile/avatar.jpg`;

      // Upload su Supabase Storage (sovrascrivo se già esistente)
      const { error } = await supabase.storage
        .from('client-photos')
        .upload(percorsoFile, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      // Recupero l'URL pubblico della foto profilo
      const { data: urlData } = supabase.storage
        .from('client-photos')
        .getPublicUrl(percorsoFile);

      // Aggiorno l'avatar in locale e su Supabase
      const urlFinale = urlData.publicUrl;
      impostaUrlFoto(urlFinale);

      // Aggiorno la colonna avatar_url nella tabella profiles
      const { error: erroreProfilo } = await supabase
        .from('profiles')
        .update({ avatar_url: urlFinale })
        .eq('id', cliente.id);

      if (erroreProfilo) throw erroreProfilo;

      // Aggiorno lo stato globale di Zustand
      impostaCliente({
        ...cliente,
        avatarUrl: urlFinale,
      });

      alert('Foto profilo aggiornata con successo! 📸');
    } catch (e) {
      alert('Impossibile caricare l\'immagine del profilo.');
    } finally {
      impostaInCaricamentoFoto(false);
    }
  };

  // Salvo le modifiche anagrafiche del form
  const gestisciSalva = async () => {
    impostaErrore(null);
    impostaMessaggioSuccesso(null);

    if (!cliente?.id) return;

    const pesoNumerico = parseFloat(peso);
    const altezzaNumerica = parseFloat(altezza);

    if (isNaN(pesoNumerico) || pesoNumerico <= 0 || isNaN(altezzaNumerica) || altezzaNumerica <= 0) {
      impostaErrore('Inserisci valori validi per peso e altezza.');
      return;
    }

    impostaInSalvataggio(true);

    try {
      const pesoPrecedente = cliente.weight;
      const pesoCambiato = pesoPrecedente !== pesoNumerico;

      if (isOffline) {
        // Se siamo offline, aggiorno il database locale e accodo il sync
        aggiornaProfiloLocale({
          height: altezzaNumerica,
          weight: pesoNumerico,
          target: obiettivo,
        });

        if (pesoCambiato) {
          // Aggiungo anche una riga di metrica locale se il peso è cambiato
          const oggiString = new Date().toISOString().split('T')[0] || '';
          const metricaLocale: ClientMetric = {
            id: Math.random().toString(36).substring(7),
            clientId: cliente.id,
            weight: pesoNumerico,
            measuredAt: oggiString,
          };
          aggiungiMisurazioneLocale(metricaLocale);
        }

        // Aggiorno Zustand
        impostaCliente({
          ...cliente,
          weight: pesoNumerico,
          height: altezzaNumerica,
          target: obiettivo,
        });

        impostaMessaggioSuccesso('Modifiche salvate localmente! Sincronizzazione in corso appena online.');
        impostaInSalvataggio(false);
        return;
      }

      // Se siamo online, aggiorno Supabase
      const { error: erroreSalvataggio } = await supabase
        .from('clients')
        .update({
          height: altezzaNumerica,
          weight: pesoNumerico,
          target: obiettivo,
        })
        .eq('id', cliente.id);

      if (erroreSalvataggio) throw erroreSalvataggio;

      // Se il peso è cambiato, inserisco una riga in client_metrics
      if (pesoCambiato) {
        const oggiString = new Date().toISOString().split('T')[0] || '';
        await supabase.from('client_metrics').insert({
          client_id: cliente.id,
          weight: pesoNumerico,
          measured_at: oggiString,
        });
      }

      // Aggiorno Zustand
      impostaCliente({
        ...cliente,
        weight: pesoNumerico,
        height: altezzaNumerica,
        target: obiettivo,
      });

      impostaMessaggioSuccesso('Dati personali aggiornati! 💪');
    } catch (e) {
      impostaErrore('Errore nel salvataggio dei dati personali.');
    } finally {
      impostaInSalvataggio(false);
    }
  };

  return (
    <Card paddingInterno={16} style={stili.card}>
      <Text style={stili.titolo}>I Miei Dati Personali</Text>

      {/* Area Caricamento Foto Profilo */}
      <View style={stili.sezioneFoto}>
        {inCaricamentoFoto ? (
          <ActivityIndicator size="small" color={Colors.PRIMARY} style={stili.avatarSpinner} />
        ) : (
          <Avatar urlFoto={urlFoto} nomeCompleto={cliente?.nome || 'Utente'} dimensione={64} />
        )}
        <TouchableOpacity
          onPress={gestisciSelezionaAvatar}
          disabled={inCaricamentoFoto || isOffline}
          style={stili.pulsanteFoto}
        >
          <Text style={stili.testoPulsanteFoto}>Cambia Foto Profilo</Text>
        </TouchableOpacity>
      </View>

      <View style={stili.form}>
        <View style={stili.rigaCampi}>
          {/* Peso */}
          <View style={stili.colonna}>
            <Input
              etichetta="Peso Attuale"
              valore={peso}
              onChange={impostaPeso}
              tipo="numero"
              suffisso="kg"
            />
          </View>
          {/* Altezza */}
          <View style={stili.colonna}>
            <Input
              etichetta="Altezza"
              valore={altezza}
              onChange={impostaAltezza}
              tipo="numero"
              suffisso="cm"
            />
          </View>
        </View>

        {/* Selezione Obiettivo */}
        <Text style={stili.labelObiettivo}>Il mio obiettivo principale</Text>
        <View style={stili.rigaObiettivi}>
          {[
            { chiave: 'lose', etichetta: 'Dimagrire' },
            { chiave: 'maintain', etichetta: 'Mantenere' },
            { chiave: 'gain', etichetta: 'Aumentare Massa' },
          ].map((item) => (
            <TouchableOpacity
              key={item.chiave}
              onPress={() => impostaObiettivo(item.chiave as any)}
              style={[
                stili.chipObiettivo,
                obiettivo === item.chiave ? stili.chipAttiva : stili.chipInattiva,
              ]}
            >
              <Text
                style={[
                  stili.testoChip,
                  obiettivo === item.chiave ? stili.testoChipAttivo : stili.testoChipInattivo,
                ]}
              >
                {item.etichetta}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {errore && <Text style={stili.testoErrore}>{errore}</Text>}
        {messaggioSuccesso && <Text style={stili.testoSuccesso}>{messaggioSuccesso}</Text>}

        <Button
          testo="Salva modifiche"
          onPress={gestisciSalva}
          variante="primario"
          caricamento={inSalvataggio}
          disabilitato={inSalvataggio}
        />
      </View>
    </Card>
  );
};

const stili = StyleSheet.create({
  card: {
    marginBottom: Layout.spacing.lg,
  },
  titolo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    marginBottom: Layout.spacing.md,
  },
  sezioneFoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: Layout.spacing.md,
  },
  avatarSpinner: {
    width: 64,
    height: 64,
    justifyContent: 'center',
  },
  pulsanteFoto: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testoPulsanteFoto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  form: {
    gap: Layout.spacing.md,
  },
  rigaCampi: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  colonna: {
    flex: 1,
  },
  labelObiettivo: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TESTO_SECONDARIO,
  },
  rigaObiettivi: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.sm,
  },
  chipObiettivo: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipAttiva: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  chipInattiva: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  testoChip: {
    fontSize: 12,
    fontWeight: '600',
  },
  testoChipAttivo: {
    color: '#FFFFFF',
  },
  testoChipInattivo: {
    color: Colors.TESTO_PRINCIPALE,
  },
  testoErrore: {
    color: Colors.PERICOLO,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  testoSuccesso: {
    color: Colors.PRIMARY,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
