// Componente InserisciMisurazione.
// Form di inserimento dati corporei: peso e circonferenze.
// Esegue la validazione e resetta i campi dopo il salvataggio.

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Layout } from '../../constants/Layout';
import { Colors } from '../../constants/Colors';
import { ClientMetric } from '@nutriflow/types';

interface InserisciProps {
  // Callback richiamata quando l'utente clicca su Salva con dati validi
  onSalva: (dati: Omit<ClientMetric, 'id' | 'clientId'>) => Promise<void>;
}

export const InserisciMisurazione: React.FC<InserisciProps> = ({ onSalva }) => {
  const [peso, impostaPeso] = useState('');
  const [vita, impostaVita] = useState('');
  const [fianchi, impostaFianchi] = useState('');
  const [braccioSinistro, impostaBraccioSinistro] = useState('');
  const [braccioDestro, impostaBraccioDestro] = useState('');

  // Imposto la data di oggi come formato predefinito YYYY-MM-DD
  const oggiString = new Date().toISOString().split('T')[0] || '';
  const [dataMisurazione, impostaDataMisurazione] = useState(oggiString);

  // Stati per la gestione degli errori e del caricamento
  const [errorePeso, impostaErrorePeso] = useState<string | undefined>(undefined);
  const [messaggioSuccesso, impostaMessaggioSuccesso] = useState<string | null>(null);
  const [inSalvataggio, impostaInSalvataggio] = useState(false);

  // Eseguo la validazione e invio i dati
  const gestisciSalva = async () => {
    impostaErrorePeso(undefined);
    impostaMessaggioSuccesso(null);

    // Il peso è obbligatorio
    if (!peso) {
      impostaErrorePeso('Il peso è obbligatorio.');
      return;
    }

    const pesoNumerico = parseFloat(peso);
    // Verifico che il peso sia un numero valido maggiore di zero
    if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
      impostaErrorePeso('Inserisci un peso valido maggiore di zero.');
      return;
    }

    impostaInSalvataggio(true);

    try {
      // Creo l'oggetto misurazione pronto per il salvataggio
      await onSalva({
        weight: pesoNumerico,
        waist: vita ? parseFloat(vita) : null,
        hips: fianchi ? parseFloat(fianchi) : null,
        arm_left: braccioSinistro ? parseFloat(braccioSinistro) : null,
        arm_right: braccioDestro ? parseFloat(braccioDestro) : null,
        chest: null, // Campo non utilizzato in questo form
        measuredAt: dataMisurazione,
      });

      // Mostro il feedback positivo e svuoto i campi del form
      impostaMessaggioSuccesso('Misurazione salvata! 💪');
      impostaPeso('');
      impostaVita('');
      impostaFianchi('');
      impostaBraccioSinistro('');
      impostaBraccioDestro('');
      impostaDataMisurazione(oggiString);
    } catch (errore) {
      impostaErrorePeso('Errore nel salvataggio. Riprova.');
    } finally {
      impostaInSalvataggio(false);
    }
  };

  return (
    <Card paddingInterno={16}>
      <Text style={stili.titoloCard}>Inserisci Misurazione</Text>
      
      <View style={stili.form}>
        <View style={stili.rigaDueCampi}>
          {/* Campo Peso (obbligatorio) */}
          <View style={stili.colonna}>
            <Input
              etichetta="Peso *"
              valore={peso}
              onChange={impostaPeso}
              placeholder="es: 72.5"
              tipo="numero"
              suffisso="kg"
              errore={errorePeso}
            />
          </View>
          {/* Campo Data */}
          <View style={stili.colonna}>
            <Input
              etichetta="Data"
              valore={dataMisurazione}
              onChange={impostaDataMisurazione}
              placeholder="AAAA-MM-GG"
              tipo="testo"
            />
          </View>
        </View>

        <Text style={stili.sezioneMisure}>Circonferenze Corporee (Opzionali)</Text>

        <View style={stili.rigaDueCampi}>
          {/* Circonferenza Vita */}
          <View style={stili.colonna}>
            <Input
              etichetta="Vita"
              valore={vita}
              onChange={impostaVita}
              placeholder="es: 80"
              tipo="numero"
              suffisso="cm"
            />
          </View>
          {/* Circonferenza Fianchi */}
          <View style={stili.colonna}>
            <Input
              etichetta="Fianchi"
              valore={fianchi}
              onChange={impostaFianchi}
              placeholder="es: 95"
              tipo="numero"
              suffisso="cm"
            />
          </View>
        </View>

        <View style={stili.rigaDueCampi}>
          {/* Braccio Sinistro */}
          <View style={stili.colonna}>
            <Input
              etichetta="Braccio Sinistro"
              valore={braccioSinistro}
              onChange={impostaBraccioSinistro}
              placeholder="es: 32"
              tipo="numero"
              suffisso="cm"
            />
          </View>
          {/* Braccio Destro */}
          <View style={stili.colonna}>
            <Input
              etichetta="Braccio Destro"
              valore={braccioDestro}
              onChange={impostaBraccioDestro}
              placeholder="es: 32.5"
              tipo="numero"
              suffisso="cm"
            />
          </View>
        </View>

        {/* Feedback di successo */}
        {messaggioSuccesso && (
          <Text style={stili.testoSuccesso}>{messaggioSuccesso}</Text>
        )}

        {/* Bottone di inserimento */}
        <Button
          testo="Salva misurazione"
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
  titoloCard: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    marginBottom: Layout.spacing.md,
  },
  form: {
    gap: Layout.spacing.md,
  },
  rigaDueCampi: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  colonna: {
    flex: 1,
  },
  sezioneMisure: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.TESTO_SECONDARIO,
    marginTop: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 4,
  },
  testoSuccesso: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 4,
  },
});
