// Hook personalizzato per recuperare il piano alimentare del giorno corrente.
// Se l'app è online, carica i dati da Supabase, altrimenti li legge dal db locale.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ottieniPianoLocale } from '../lib/database-locale';
import { useConnessione } from './useConnessione';
import { MealPlan, MealPlanDay } from '@nutriflow/types';

export function usePianoOggi() {
  const cliente = useAuthStore((stato) => stato.cliente);
  const { isOffline } = useConnessione();

  // Definisco il nome del giorno corrente in italiano minuscolo (es: "lunedi")
  const giorniSettimana = [
    'domenica',
    'lunedi',
    'martedi',
    'mercoledi',
    'giovedi',
    'venerdi',
    'sabato',
  ];
  const etichettaGiornoOggi = giorniSettimana[new Date().getDay()];

  // Estraggo la porzione di piano specifica per oggi dal piano completo
  const estraiGiornoDalPiano = (piano: MealPlan | null): MealPlanDay | null => {
    if (!piano || !piano.days) {
      return null;
    }
    
    // Cerco la giornata corrispondente all'etichetta del giorno corrente
    const giornoTrovato = piano.days.find(
      (day) => day.etichettaGiorno === etichettaGiornoOggi
    );
    
    return giornoTrovato || null;
  };

  // Definisco la query con TanStack Query per il fetch online
  const queryPiano = useQuery({
    queryKey: ['piano-oggi', cliente?.id, etichettaGiornoOggi],
    queryFn: async () => {
      if (!cliente?.id) return null;

      // Se siamo offline, sollevo un errore per forzare l'uso della cache/locale
      if (isOffline) {
        throw new Error('Dispositivo offline');
      }

      // Chiedo a Supabase il piano completo del cliente
      const { data: pianoTrovato, error } = await supabase
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

      if (error) {
        throw error;
      }

      return (pianoTrovato as unknown as MealPlan) || null;
    },
    // Abilito la query solo se abbiamo l'ID del cliente loggato
    enabled: !!cliente?.id,
    // Considero freschi i dati per 5 minuti
    staleTime: 5 * 60 * 1000,
  });

  // Determino il piano finale leggendo dal database locale se la query fallisce o è offline
  const pianoCompleto = queryPiano.error || isOffline
    ? ottieniPianoLocale()
    : queryPiano.data || null;

  // Estraggo il giorno specifico per oggi
  const pianoOggi = estraiGiornoDalPiano(pianoCompleto);

  return {
    pianoOggi,
    inCaricamento: queryPiano.isLoading,
    isOffline,
    ricaricaPiano: queryPiano.refetch,
    haPianoAssegnato: !!pianoCompleto,
  };
}
