// Hook personalizzato per gestire il diario alimentare giornaliero.
// Consente di salvare i pasti consumati in locale (offline) o su Supabase.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useConnessione } from './useConnessione';
import {
  ottieniDiarioLocale,
  aggiungiLogCiboLocale,
} from '../lib/database-locale';
import { FoodLog } from '@nutriflow/types';

export function useDiario(dataGiornoSelected: string) {
  const cliente = useAuthStore((stato) => stato.cliente);
  const { isOffline } = useConnessione();
  const queryClient = useQueryClient();

  // Query per caricare i log alimentari del giorno selezionato
  const queryDiario = useQuery({
    queryKey: ['diario-pasti', cliente?.id, dataGiornoSelected],
    queryFn: async () => {
      if (!cliente?.id) return [];

      if (isOffline) {
        throw new Error('Dispositivo offline');
      }

      // Recupero i pasti registrati per questo giorno
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('client_id', cliente.id)
        .eq('logged_at', dataGiornoSelected)
        .order('logged_at', { ascending: true });

      if (error) throw error;
      return (data as unknown as FoodLog[]) || [];
    },
    enabled: !!cliente?.id && !!dataGiornoSelected,
  });

  // Salvo una nuova voce di alimento consumato nel diario
  const registraCiboNelDiario = useMutation({
    mutationFn: async (nuovoLog: Omit<FoodLog, 'id' | 'clientId'>) => {
      if (!cliente?.id) throw new Error('Cliente non autenticato');

      const logCompleto: FoodLog = {
        ...nuovoLog,
        id: Math.random().toString(36).substring(7), // Genero ID locale
        clientId: cliente.id,
      };

      if (isOffline) {
        // Salvo localmente offline ed inserisco nella coda
        aggiungiLogCiboLocale(logCompleto);
        return logCompleto;
      }

      // Salvo su Supabase online
      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          client_id: cliente.id,
          food_id: logCompleto.foodId,
          nome_alimento: logCompleto.nomeAlimento,
          quantita_grammi: logCompleto.quantitaGrammi,
          calorie: logCompleto.calorie,
          proteine: logCompleto.proteine,
          carboidrati: logCompleto.carboidrati,
          grassi: logCompleto.grassi,
          pasto: logCompleto.pasto,
          logged_at: logCompleto.loggedAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FoodLog;
    },
    onSuccess: () => {
      // Invalido la cache per far aggiornare l'elenco dei pasti registrati
      queryClient.invalidateQueries({
        queryKey: ['diario-pasti', cliente?.id, dataGiornoSelected],
      });
    },
  });

  // Leggo i dati finali privilegiando quelli offline se non siamo connessi
  const diario = queryDiario.error || isOffline
    ? ottieniDiarioLocale(dataGiornoSelected)
    : queryDiario.data || [];

  return {
    diario,
    inCaricamento: queryDiario.isLoading,
    inserimentoInCorso: registraCiboNelDiario.isPending,
    registraCibo: registraCiboNelDiario.mutateAsync,
  };
}
