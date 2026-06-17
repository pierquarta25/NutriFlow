// Schermata "Diario" dell'applicazione mobile.
// Permette al cliente di monitorare e registrare gli alimenti effettivamente
// consumati durante il giorno, calcolando i macro effettivi vs i target.

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDiario } from '../../hooks/useDiario';
import { usePianoOggi } from '../../hooks/usePianoOggi';
import { useConnessione } from '../../hooks/useConnessione';
import { RiepilogoDiario } from '../../components/diario/RiepilogoDiario';
import { DiarioGiornaliero } from '../../components/diario/DiarioGiornaliero';
import { AggiuntaAlimentoDiario } from '../../components/diario/AggiuntaAlimentoDiario';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { supabase } from '../../lib/supabase';
import { sincronizzaDaSupabaseALocale } from '../../lib/sync';

export default function TabDiarioAlimentare() {
  const { cliente } = useAuth();
  const { isOffline } = useConnessione();
  const { pianoOggi } = usePianoOggi();

  // Definisco la data odierna come data di riferimento YYYY-MM-DD
  const oggiString = new Date().toISOString().split('T')[0] || '';
  const [dataSelezionata, impostaDataSelezionata] = useState(oggiString);
  const [rinfresco, impostaRinfresco] = useState(false);

  // Stato per gestire l'apertura del modal di aggiunta alimento
  const [modalAggiungiVisibile, impostaModalAggiungiVisibile] = useState(false);

  // Utilizzo l'hook del diario per caricare i pasti registrati per la data scelta
  const { diario: logsGiornalieri, registraCibo, inCaricamento } = useDiario(dataSelezionata);

  // Ricarico il diario sincronizzandolo con Supabase
  const gestisciRinfresco = async () => {
    if (!cliente?.id || isOffline) return;
    
    impostaRinfresco(true);
    await sincronizzaDaSupabaseALocale(cliente.id);
    impostaRinfresco(false);
  };

  // Funzione per eliminare una riga dal diario alimentare
  const gestisciRimuoviLog = async (idLog: string) => {
    try {
      if (isOffline) {
        // La rimozione offline in v1 la gestiamo rimuovendola direttamente
        alert('Connettiti a internet per eliminare i cibi registrati.');
        return;
      }

      // Elimino la riga su Supabase
      const { error } = await supabase.from('food_logs').delete().eq('id', idLog);
      
      if (error) throw error;
      
      // Sincronizzo nuovamente locale
      if (cliente?.id) {
        await sincronizzaDaSupabaseALocale(cliente.id);
      }
    } catch (e) {
      alert('Impossibile eliminare l\'alimento.');
    }
  };

  // Calcolo i macro totali consumati oggi (somma dei log)
  const calorieConsumate = logsGiornalieri.reduce((t, l) => t + l.calorie, 0);
  const proteineConsumate = logsGiornalieri.reduce((t, l) => t + l.proteine, 0);
  const carboConsumati = logsGiornalieri.reduce((t, l) => t + l.carboidrati, 0);
  const grassiConsumati = logsGiornalieri.reduce((t, l) => t + l.grassi, 0);

  // Calcolo i target giornalieri prescritti nel piano per visualizzarli nel riepilogo
  const calcolaTargetMacroPiano = () => {
    const target = { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 };
    
    if (!pianoOggi || !pianoOggi.meals) {
      return { calorie: 2000, proteine: 130, carboidrati: 220, grassi: 65 }; // Default medi
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

  const targetMacro = calcolaTargetMacroPiano();

  return (
    <SafeAreaView style={stili.contenitoreEsterno}>
      {/* Banner giallo visibile quando offline */}
      {isOffline && (
        <View style={stili.bannerOffline}>
          <Text style={stili.testoOffline}>
            Diario in modalità offline — i nuovi log verranno sincronizzati online
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={stili.scroll}
        refreshControl={
          <RefreshControl refreshing={rinfresco} onRefresh={gestisciRinfresco} />
        }
      >
        <View style={stili.header}>
          <View>
            <Text style={stili.titolo}>Il mio Diario</Text>
            <Text style={stili.sottoTitolo}>Registra e monitora i tuoi pasti</Text>
          </View>
          
          {/* Bottone per aggiungere un alimento al diario */}
          <TouchableOpacity
            onPress={() => impostaModalAggiungiVisibile(true)}
            style={stili.pulsanteRegistra}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={stili.testoRegistra}>Aggiungi cibo</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Componente Riepilogo Macro Consumati vs Target */}
        <RiepilogoDiario
          calorieConsumate={calorieConsumate}
          calorieTarget={targetMacro.calorie}
          proteineConsumate={proteineConsumate}
          proteineTarget={targetMacro.proteine}
          carboConsumati={carboConsumati}
          carboTarget={targetMacro.carboidrati}
          grassiConsumati={grassiConsumati}
          grassiTarget={targetMacro.grassi}
        />

        {/* 2. Componente con la lista dei pasti registrati */}
        <Text style={stili.titoloSezione}>I Pasti Registrati di Oggi</Text>
        <DiarioGiornaliero
          logs={logsGiornalieri}
          onRimuoviAlimento={gestisciRimuoviLog}
        />
      </ScrollView>

      {/* Modal di aggiunta alimento */}
      <AggiuntaAlimentoDiario
        visibile={modalAggiungiVisibile}
        onChiudi={() => impostaModalAggiungiVisibile(false)}
        dataSelezionata={dataSelezionata}
        onSalvaAlimento={async (nuovoLog) => {
          await registraCibo(nuovoLog);
        }}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  titolo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  sottoTitolo: {
    fontSize: 12,
    color: Colors.TESTO_SECONDARIO,
    marginTop: 2,
  },
  pulsanteRegistra: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testoRegistra: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titoloSezione: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.xs,
  },
});
