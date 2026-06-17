// Schermata "Piano" settimanale dell'applicazione mobile.
// Mostra il piano alimentare completo diviso per i giorni della settimana.
// Permette di selezionare il giorno tramite la barra scorrevole superiore.

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { GiornoSelector } from '../../components/piano/GiornoSelector';
import { PastoCard } from '../../components/piano/PastoCard';
import { usePianoOggi } from '../../hooks/usePianoOggi';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { ottieniPianoLocale } from '../../lib/database-locale';
import { useConnessione } from '../../hooks/useConnessione';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { MealPlan, MealPlanDay } from '@nutriflow/types';

export default function TabPianoSettimanale() {
  const { cliente } = useAuth();
  const { isOffline } = useConnessione();

  // Definisco l'elenco dei giorni per recuperare il nome del giorno corrente
  const giorniSettimana = [
    'domenica',
    'lunedi',
    'martedi',
    'mercoledi',
    'giovedi',
    'venerdi',
    'sabato',
  ];
  const chiaveOggi = giorniSettimana[new Date().getDay()] || 'lunedi';

  // Stato per memorizzare il giorno attualmente visualizzato
  const [giornoSelezionato, impostaGiornoSelezionato] = useState<string>(chiaveOggi);
  const [pianoCompleto, impostaPianoCompleto] = useState<MealPlan | null>(null);
  const [inCaricamento, impostaInCaricamento] = useState(false);

  // Carico il piano alimentare completo
  const caricaPianoSettimanale = async () => {
    if (!cliente?.id) return;

    if (isOffline) {
      // Se offline, leggo direttamente dal database locale
      const local = ottieniPianoLocale();
      impostaPianoCompleto(local);
      return;
    }

    impostaInCaricamento(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          id,
          nome,
          meal_plan_days (
            id,
            etichetta_giorno,
            meals (
              id,
              nome,
              ordine,
              meal_items (
                id,
                quantita_grammi,
                foods (id, nome, marca, calorie, proteine, carboidrati, grassi, is_custom)
              )
            )
          )
        `)
        .eq('client_id', cliente.id)
        .maybeSingle();

      if (!error && data) {
        impostaPianoCompleto(data as unknown as MealPlan);
      } else {
        // Fallback locale in caso di errore query
        const local = ottieniPianoLocale();
        impostaPianoCompleto(local);
      }
    } catch (e) {
      // In caso di eccezione leggo il locale
      const local = ottieniPianoLocale();
      impostaPianoCompleto(local);
    } finally {
      impostaInCaricamento(false);
    }
  };

  useEffect(() => {
    caricaPianoSettimanale();
  }, [cliente?.id, isOffline]);

  // Filtro la giornata corrispondente al giorno selezionato nella barra superiore
  const ottieniGiornataSelezionata = (): MealPlanDay | null => {
    if (!pianoCompleto || !pianoCompleto.days) return null;
    
    return (
      pianoCompleto.days.find((day) => day.etichettaGiorno === giornoSelezionato) ||
      null
    );
  };

  const giornataSelezionata = ottieniGiornataSelezionata();

  return (
    <SafeAreaView style={stili.contenitoreEsterno}>
      {/* Barra superiore di selezione del giorno */}
      <GiornoSelector
        giornoSelezionato={giornoSelezionato}
        onCambiaGiorno={impostaGiornoSelezionato}
      />

      {inCaricamento ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={stili.spinner} />
      ) : !pianoCompleto ? (
        // Se non abbiamo nessun piano salvato
        <View style={stili.areaStatoVuoto}>
          <Text style={stili.emojiVuoto}>📋</Text>
          <Text style={stili.titoloVuoto}>Nessun piano disponibile</Text>
          <Text style={stili.descrizioneVuoto}>
            Non è presente alcun piano salvato. Assicurati che il tuo nutrizionista
            lo abbia caricato e connettiti a internet per scaricarlo.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={stili.scroll}>
          {/* Elenco dei pasti previsti per la giornata selezionata */}
          {giornataSelezionata && giornataSelezionata.meals && giornataSelezionata.meals.length > 0 ? (
            [...giornataSelezionata.meals]
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
            // Se non ci sono pasti configurati per questo giorno
            <View style={stili.areaNessunPasto}>
              <Text style={stili.testoNessunPasto}>
                Nessun pasto configurato per questo giorno di piano.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const stili = StyleSheet.create({
  contenitoreEsterno: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  areaStatoVuoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  emojiVuoto: {
    fontSize: 56,
  },
  titoloVuoto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  descrizioneVuoto: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    textAlign: 'center',
    lineHeight: 18,
  },
  areaNessunPasto: {
    paddingVertical: Layout.spacing.giant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testoNessunPasto: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
