// Schermata di login per il cliente.
// Gestisce l'inserimento dell'indirizzo email e della password
// ed effettua l'accesso su Supabase.

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export default function SchermataLogin() {
  const [email, impostaEmail] = useState('');
  const [password, impostaPassword] = useState('');
  const [inCaricamento, impostaInCaricamento] = useState(false);
  const [erroreGenerale, impostaErroreGenerale] = useState<string | null>(null);

  // Eseguo il login chiamando l'autenticazione Supabase
  const gestisciLogin = async () => {
    // Svuoto eventuali errori precedenti
    impostaErroreGenerale(null);

    // Valido i campi prima di procedere
    if (!email || !password) {
      impostaErroreGenerale('Compila tutti i campi richiesti.');
      return;
    }

    impostaInCaricamento(true);

    try {
      // Effettuo l'accesso tramite Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Gestisco le varie tipologie di errore restituite da Supabase
        if (error.message.includes('Invalid login credentials')) {
          impostaErroreGenerale('Email o password non corretti. Riprova.');
        } else if (error.message.includes('network')) {
          impostaErroreGenerale(
            'Nessuna connessione. Controlla internet e riprova.'
          );
        } else {
          impostaErroreGenerale('Si è verificato un errore durante l\'accesso.');
        }
      }
    } catch (e) {
      impostaErroreGenerale('Connessione fallita. Controlla la rete.');
    } finally {
      impostaInCaricamento(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={stili.contenitore}
    >
      <ScrollView contentContainerStyle={stili.scrollContenitore}>
        <View style={stili.areaLogo}>
          {/* Logo testuale di NutriFlow */}
          <Text style={stili.testoLogo}>NutriFlow</Text>
          <Text style={stili.sottoTitolo}>
            Il portale per i tuoi piani nutrizionali
          </Text>
        </View>

        <View style={stili.areaForm}>
          {/* Campo inserimento email */}
          <Input
            etichetta="Email"
            valore={email}
            onChange={impostaEmail}
            placeholder="inserisci la tua email"
            tipo="email"
            autoCapitalize="none"
          />

          {/* Campo inserimento password */}
          <Input
            etichetta="Password"
            valore={password}
            onChange={impostaPassword}
            placeholder="inserisci la tua password"
            tipo="password"
            autoCapitalize="none"
          />

          {/* Se presente, mostro l'errore del login */}
          {erroreGenerale && (
            <Text style={stili.testoErrore}>{erroreGenerale}</Text>
          )}

          {/* Bottone per inviare il login */}
          <Button
            testo="Accedi"
            onPress={gestisciLogin}
            variante="primario"
            caricamento={inCaricamento}
            disabilitato={inCaricamento}
            style={stili.bottone}
          />

          {/* Link per recupero password */}
          <TouchableOpacity style={stili.linkRecupero}>
            <Text style={stili.testoRecupero}>
              Hai dimenticato la password?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const stili = StyleSheet.create({
  contenitore: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollContenitore: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.spacing.xl,
  },
  areaLogo: {
    alignItems: 'center',
    marginBottom: Layout.spacing.giant,
  },
  testoLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    letterSpacing: 1,
  },
  sottoTitolo: {
    fontSize: 14,
    color: Colors.TESTO_SECONDARIO,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  areaForm: {
    gap: Layout.spacing.lg,
  },
  bottone: {
    marginTop: Layout.spacing.sm,
  },
  testoErrore: {
    color: Colors.PERICOLO,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  linkRecupero: {
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  testoRecupero: {
    color: Colors.TESTO_SECONDARIO,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
