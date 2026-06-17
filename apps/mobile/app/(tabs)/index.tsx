// Schermata principale "Oggi".
// Mostra il piano alimentare consigliato per oggi con le calorie consumate
// calcolate in tempo reale (diario) vs l'obiettivo prefissato.

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { usePianoOggi } from '../../hooks/usePianoOggi';
import { useDiario } from '../../hooks/useDiario';
import { MacroCircle } from '../../components/piano/MacroCircle';
import { PastoCard } from '../../components/piano/PastoCard';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export default function TabOggi() {
  const { cliente } = useAuth();
  const { pianoOggi, inCaricamento, isOffline, ricaricaPiano, haPianoAssegnato } = usePianoOggi();
  const [rinfresco, impostaRinfresco] = useState(false);

  // Ricavo la data odierna in formato YYYY-MM-DD
  const oggiString = new Date().toISOString().split('T')[0] || '';

  // Recupero i pasti registrati oggi nel diario alimentare
  const { diario: logsOggi } = useDiario(oggiString);

  // Formatto la data odierna in italiano (es. "Martedì 17 giugno")
  const ottieniDataItaliano = () => {
    const opzioni: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    const dataFormattata = new Date().toLocaleDateString('it-IT', opzioni);
    
    // Ritorno la data con la prima lettera maiuscola
    return dataFormattata.charAt(0).toUpperCase() + dataFormattata.slice(1);
  };

  // Eseguo il pull-to-refresh ricaricando i dati da Supabase
  const gestisciRinfresco = async () => {
    impostaRinfresco(true);
    await ricaricaPiano();
    impostaRinfresco(false);
  };

  // Calcolo i macro totali consumati oggi (sommo i log del diario)
  const calorieConsumate = logsOggi.reduce((tot, l) => tot + l.calorie, 0);
  const proteineConsumate = logsOggi.reduce((tot, l) => tot + l.proteine, 0);
  const carboConsumati = logsOggi.reduce((tot, l) => tot + l.carboidrati, 0);
  const grassiConsumati = logsOggi.reduce((tot, l) => tot + l.grassi, 0);

  // Calcolo i macro target consigliati nel piano di oggi
  const calcolaTargetMacroGiornata = () => {
    const target = { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 };
    
    if (!pianoOggi || !pianoOggi.meals) {
      return target;
    }

    pianoOggi.meals.forEach((pasto) => {
      pasto.mealItems.forEach((elemento) => {
        const fattore = elemento.quantitaGrammi / 100;
        target.calorie += (elemento.food.calorie || 0) * fattore;
        target.proteine += (elemento.food.proteine || 0) * fattore;
        target.carboidrati += (elemento.food.carboidrati || 0) * fattore;
        target.grassi += (elemento.food.grassi || 0) * fattore;
      });
    });

    return {
      calorie: Math.round(target.calorie),
      proteine: Math.round(target.proteine),
      carboidrati: Math.round(target.carboidrati),
      grassi: Math.round(target.grassi),
    };
  };

  const targetMacro = calcolaTargetMacroGiornata();

  return (
    <SafeAreaView style={stili.contenitoreEsterno}>
      {/* Banner giallo visibile quando il dispositivo è offline */}
      {isOffline && (
        <View style={stili.bannerOffline}>
          <Text style={stili.testoOffline}>
            Modalità offline — le modifiche verranno sincronizzate appena online
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={stili.scroll}
        refreshControl={
          <RefreshControl refreshing={rinfresco} onRefresh={gestisciRinfresco} />
        }
      >
        {/* Intestazione */}
        <View style={stili.header}>
          <Text style={stili.saluto}>Buongiorno, {cliente?.nome} 👋</Text>
          <Text style={stili.data}>{ottieniDataItaliano()}</Text>
        </View>

        {!haPianoAssegnato && !inCaricamento ? (
          // Stato vuoto se non c'è alcun piano alimentare assegnato dal nutrizionista
          <View style={stili.areaStatoVuoto}>
            <Text style={stili.emojiVuoto}>📋</Text>
            <Text style={stili.titoloVuoto}>Nessun piano assegnato</Text>
            <Text style={stili.descrizioneVuoto}>
              Il tuo nutrizionista non ha ancora caricato un piano per te.
              Contattalo per iniziare!
            </Text>
          </View>
        ) : (
          <>
            {/* Cerchi Macro real-time */}
            <Card paddingInterno={12} style={stili.cardMacro}>
              <Text style={stili.titoloSezione}>I tuoi macro di oggi</Text>
              <View style={stili.rigaCerchi}>
                <MacroCircle
                  etichetta="Calorie"
                  valore={calorieConsumate}
                  obiettivo={targetMacro.calorie}
                  unita="kcal"
                  colore={Colors.PRIMARY}
                />
                <MacroCircle
                  etichetta="Carbo"
                  valore={carboConsumati}
                  obiettivo={targetMacro.carboidrati}
                  unita="g"
                  colore="#3B82F6"
                />
                <MacroCircle
                  etichetta="Proteine"
                  valore={proteineConsumate}
                  obiettivo={targetMacro.proteine}
                  unita="g"
                  colore="#EF4444"
                />
                <MacroCircle
                  etichetta="Grassi"
                  valore={grassiConsumati}
                  obiettivo={targetMacro.grassi}
                  unita="g"
                  colore="#F59E0B"
                />
              </View>
            </Card>

            {/* Lista dei pasti consigliati oggi */}
            <Text style={stili.titoloSezionePasti}>I Pasti del Giorno</Text>
            {pianoOggi && pianoOggi.meals ? (
              // Ordino i pasti per ordine e li renderizzo
              [...pianoOggi.meals]
                .sort((a, b) => a.ordine - b.ordine)
                .map((pasto) => {
                  const caloriePasto = Math.round(
                    pasto.mealItems.reduce(
                      (tot, item) =>
                        tot + (item.quantitaGrammi * item.food.calorie) / 100,
                      0
                    )
                  );
                  return (
                    <PastoCard
                      key={pasto.id}
                      nomePasto={pasto.nome}
                      totalCalorie={caloriePasto}
                      listaAlimenti={pasto.mealItems}
                    />
                  );
                })
            ) : (
              <Text style={stili.testoNessunPasto}>Nessun pasto previsto per oggi.</Text>
            )}
          </>
        )}
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
  header: {
    marginBottom: Layout.spacing.lg,
  },
  saluto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  data: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    marginTop: 2,
  },
  cardMacro: {
    marginBottom: Layout.spacing.lg,
  },
  titoloSezione: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    marginBottom: Layout.spacing.md,
  },
  rigaCerchi: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titoloSezionePasti: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.xs,
  },
  testoNessunPasto: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
  areaStatoVuoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.giant,
    gap: Layout.spacing.md,
  },
  emojiVuoto: {
    fontSize: 64,
  },
  titoloVuoto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  descrizioneVuoto: {
    fontSize: 14,
    color: Colors.TESTO_SECONDARIO,
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.xl,
    lineHeight: 20,
  },
});
