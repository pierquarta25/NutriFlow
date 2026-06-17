// Schermata "Profilo" dell'applicazione mobile.
// Consente di visualizzare le impostazioni dell'account, le preferenze
// di notifica, contattare il nutrizionista ed effettuare il logout.
// Include anche il componente per modificare i dati personali.

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useConnessione } from '../../hooks/useConnessione';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ModificaDatiPersonali } from '../../components/profilo/ModificaDatiPersonali';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { supabase } from '../../lib/supabase';

export default function TabProfiloCliente() {
  const { cliente, disconnettiUtente } = useAuth();
  const { isOffline } = useConnessione();

  // Stati per le preferenze di notifica dell'utente
  const [notifichePasti, impostaNotifichePasti] = useState(true);
  const [notifichePiano, impostaNotifichePiano] = useState(true);

  // Stato per i dati del nutrizionista associato
  const [nutrizionista, impostaNutrizionista] = useState<{
    nome: string;
    specializzazione: string;
    avatarUrl?: string;
  } | null>(null);

  // Carico le informazioni del nutrizionista di riferimento da Supabase
  useEffect(() => {
    const caricaNutrizionista = async () => {
      if (!cliente?.nutritionistId || isOffline) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', cliente.nutritionistId)
          .single();

        if (!error && data) {
          impostaNutrizionista({
            nome: data.full_name,
            specializzazione: 'Nutrizionista Sportivo',
            avatarUrl: data.avatar_url || undefined,
          });
        }
      } catch (e) {
        console.error('Errore caricamento nutrizionista:', e);
      }
    };

    caricaNutrizionista();
  }, [cliente?.nutritionistId, isOffline]);

  // Gestisco la conferma di disconnessione (logout)
  const gestisciLogout = () => {
    Alert.alert(
      'Disconnessione',
      'Sei sicuro di voler uscire da NutriFlow?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            await disconnettiUtente();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={stili.contenitoreEsterno}>
      {/* Banner giallo visibile quando offline */}
      {isOffline && (
        <View style={stili.bannerOffline}>
          <Text style={stili.testoOffline}>
            Profilo in modalità offline — alcune impostazioni non sono modificabili
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={stili.scroll}>
        {/* Intestazione profilo con Avatar grande */}
        <View style={stili.headerAccount}>
          <Avatar
            urlFoto={cliente?.avatarUrl}
            nomeCompleto={cliente?.nome || 'Utente'}
            dimensione={80}
          />
          <View style={stili.datiAccount}>
            <Text style={stili.nomeUtente}>{cliente?.nome}</Text>
            <Text style={stili.emailUtente}>{cliente?.email}</Text>
          </View>
        </View>

        {/* 1. SEZIONE IL MIO NUTRIZIONISTA */}
        {nutrizionista && (
          <Card paddingInterno={12} style={stili.cardNutrizionista}>
            <Text style={stili.labelSezione}>Il mio Nutrizionista</Text>
            <View style={stili.rigaNutrizionista}>
              <Avatar
                urlFoto={nutrizionista.avatarUrl}
                nomeCompleto={nutrizionista.nome}
                dimensione={44}
              />
              <View style={stili.infoNutrizionista}>
                <Text style={stili.nomeNutrizionista}>{nutrizionista.nome}</Text>
                <Text style={stili.specializzazione}>{nutrizionista.specializzazione}</Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Contatta', 'Funzionalità di chat in arrivo!')}
                style={stili.pulsanteMessaggio}
              >
                <Text style={stili.testoMessaggio}>Scrivi</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* 2. SEZIONE MODIFICA DATI PERSONALI */}
        <ModificaDatiPersonali />

        {/* 3. SEZIONE IMPOSTAZIONI NOTIFICHE & LINGUA */}
        <Card paddingInterno={16} style={stili.cardImpostazioni}>
          <Text style={stili.labelSezione}>Impostazioni App</Text>

          {/* Toggle Notifiche Promemoria Pasti */}
          <View style={stili.rigaImpostazione}>
            <View style={stili.infoImpostazione}>
              <Text style={stili.titoloImpostazione}>Promemoria Pasti</Text>
              <Text style={stili.descrizioneImpostazione}>
                Ricevi notifiche all'orario dei pasti prescritti
              </Text>
            </View>
            <Switch
              value={notifichePasti}
              onValueChange={impostaNotifichePasti}
              trackColor={{ false: '#D1D5DB', true: Colors.ACCENTO }}
              thumbColor={notifichePasti ? Colors.PRIMARY : '#F3F4F6'}
            />
          </View>

          {/* Toggle Notifiche Aggiornamento Piano */}
          <View style={[stili.rigaImpostazione, stili.bordoSuperiore]}>
            <View style={stili.infoImpostazione}>
              <Text style={stili.titoloImpostazione}>Aggiornamenti Piano</Text>
              <Text style={stili.descrizioneImpostazione}>
                Notificami quando il nutrizionista aggiorna il mio piano
              </Text>
            </View>
            <Switch
              value={notifichePiano}
              onValueChange={impostaNotifichePiano}
              trackColor={{ false: '#D1D5DB', true: Colors.ACCENTO }}
              thumbColor={notifichePiano ? Colors.PRIMARY : '#F3F4F6'}
            />
          </View>

          {/* Opzione Lingua */}
          <View style={[stili.rigaImpostazione, stili.bordoSuperiore]}>
            <View style={stili.infoImpostazione}>
              <Text style={stili.titoloImpostazione}>Lingua Applicazione</Text>
              <Text style={stili.descrizioneImpostazione}>Italiano</Text>
            </View>
            <Text style={stili.valoreFisso}>IT</Text>
          </View>
        </Card>

        {/* Pulsante di Disconnessione */}
        <Button
          testo="Esci"
          onPress={gestisciLogout}
          variante="outline"
          style={stili.pulsanteLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const stili = StyleSheet.create({
  contenitoreEsterno: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  bannerOffline: {
    backgroundColor: Colors.AVVISO,
    padding: Layout.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testoOffline: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scroll: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  headerAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    backgroundColor: '#FFFFFF',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.card,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  datiAccount: {
    gap: 4,
    flex: 1,
  },
  nomeUtente: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  emailUtente: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
  },
  cardNutrizionista: {
    marginBottom: Layout.spacing.lg,
  },
  labelSezione: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    marginBottom: Layout.spacing.md,
  },
  rigaNutrizionista: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  infoNutrizionista: {
    flex: 1,
    gap: 2,
  },
  nomeNutrizionista: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  specializzazione: {
    fontSize: 11,
    color: Colors.TESTO_SECONDARIO,
  },
  pulsanteMessaggio: {
    backgroundColor: Colors.ACCENTO,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testoMessaggio: {
    color: Colors.PRIMARY,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardImpostazioni: {
    marginBottom: Layout.spacing.lg,
  },
  rigaImpostazione: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
  },
  infoImpostazione: {
    flex: 1,
    gap: 2,
    paddingRight: Layout.spacing.md,
  },
  titoloImpostazione: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TESTO_PRINCIPALE,
  },
  descrizioneImpostazione: {
    fontSize: 11,
    color: Colors.TESTO_SECONDARIO,
  },
  bordoSuperiore: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  valoreFisso: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.TESTO_SECONDARIO,
    paddingRight: 6,
  },
  pulsanteLogout: {
    borderColor: Colors.PERICOLO,
    marginTop: Layout.spacing.xs,
  },
});
