// Schermata di benvenuto/onboarding in 3 passi per il cliente.
// Viene mostrata dopo il primo accesso per spiegare come funziona l'app.

import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export default function SchermataBenvenuto() {
  const router = useRouter();
  const [passoCorrente, impostaPassoCorrente] = useState(1);

  // Avanzo al passo successivo o concludo l'onboarding
  const gestisciAvanti = () => {
    if (passoCorrente < 3) {
      impostaPassoCorrente(passoCorrente + 1);
    } else {
      // Concludo l'onboarding e reindirizzo alla schermata principale
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={stili.contenitore}>
      <View style={stili.areaContenuto}>
        {/* Mostro l'indicatore dei passi in alto */}
        <View style={stili.areaPassi}>
          <View style={[stili.pallino, passoCorrente >= 1 && stili.pallinoAttivo]} />
          <View style={[stili.pallino, passoCorrente >= 2 && stili.pallinoAttivo]} />
          <View style={[stili.pallino, passoCorrente >= 3 && stili.pallinoAttivo]} />
        </View>

        {/* Renderizzo il contenuto specifico del passo attuale */}
        {passoCorrente === 1 && (
          <View style={stili.passo}>
            <Text style={stili.emoji}>👋</Text>
            <Text style={stili.titolo}>Benvenuto su NutriFlow</Text>
            <Text style={stili.descrizione}>
              La tua salute è in buone mani. NutriFlow ti aiuta a seguire il piano
              alimentare prescritto dal tuo nutrizionista in modo semplice.
            </Text>
          </View>
        )}

        {passoCorrente === 2 && (
          <View style={stili.passo}>
            <Text style={stili.emoji}>📋</Text>
            <Text style={stili.titolo}>Consulta e Traccia</Text>
            <Text style={stili.descrizione}>
              Potrai consultare i pasti consigliati giorno per giorno e registrare
              i cibi consumati direttamente nel tuo diario alimentare integrato.
            </Text>
          </View>
        )}

        {passoCorrente === 3 && (
          <View style={stili.passo}>
            <Text style={stili.emoji}>💪</Text>
            <Text style={stili.titolo}>Monitora i Progressi</Text>
            <Text style={stili.descrizione}>
              Inserisci periodicamente il tuo peso e le tue misure corporee per
              vedere graficamente i tuoi miglioramenti e inviarli al nutrizionista.
            </Text>
          </View>
        )}
      </View>

      {/* Bottone di azione in basso */}
      <View style={stili.areaBottoni}>
        <Button
          testo={passoCorrente === 3 ? "Iniziamo!" : "Avanti"}
          onPress={gestisciAvanti}
          variante="primario"
        />
      </View>
    </SafeAreaView>
  );
}

const stili = StyleSheet.create({
  contenitore: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  areaContenuto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  areaPassi: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    position: 'absolute',
    top: Layout.spacing.xl,
  },
  pallino: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  pallinoAttivo: {
    backgroundColor: Colors.PRIMARY,
    width: 24,
  },
  passo: {
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Layout.spacing.md,
  },
  titolo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    textAlign: 'center',
  },
  descrizione: {
    fontSize: 15,
    color: Colors.TESTO_SECONDARIO,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Layout.spacing.md,
  },
  areaBottoni: {
    padding: Layout.spacing.xl,
  },
});
