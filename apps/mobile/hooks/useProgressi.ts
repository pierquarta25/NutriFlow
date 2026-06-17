// Hook personalizzato per gestire lo storico peso, misure e foto progressi.
// Supporta il salvataggio offline delle misurazioni con sincronizzazione ritardata.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useConnessione } from './useConnessione';
import {
  ottieniMisurazioniLocali,
  aggiungiMisurazioneLocale,
} from '../lib/database-locale';
import { ClientMetric } from '@nutriflow/types';

export function useProgressi() {
  const cliente = useAuthStore((stato) => stato.cliente);
  const { isOffline } = useConnessione();
  const queryClient = useQueryClient();

  // Query per caricare lo storico delle misurazioni corporee
  const queryMisurazioni = useQuery({
    queryKey: ['misurazioni', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return [];
      
      if (isOffline) {
        throw new Error('Dispositivo offline');
      }

      const { data, error } = await supabase
        .from('client_metrics')
        .select('*')
        .eq('client_id', cliente.id)
        .order('measured_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as ClientMetric[]) || [];
    },
    enabled: !!cliente?.id,
  });

  // Salvo una nuova misurazione (peso e/o circonferenze)
  const salvaMisurazione = useMutation({
    mutationFn: async (nuovaMisurazione: Omit<ClientMetric, 'id' | 'clientId'>) => {
      if (!cliente?.id) throw new Error('Cliente non autenticato');

      const recordCompleto: ClientMetric = {
        ...nuovaMisurazione,
        id: Math.random().toString(36).substring(7), // Genero un ID locale temporaneo
        clientId: cliente.id,
      };

      if (isOffline) {
        // Se siamo offline, memorizzo localmente e metto in coda
        aggiungiMisurazioneLocale(recordCompleto);
        return recordCompleto;
      }

      // Se siamo online, carico su Supabase
      const { data, error } = await supabase
        .from('client_metrics')
        .insert({
          client_id: cliente.id,
          weight: recordCompleto.weight,
          chest: recordCompleto.chest,
          waist: recordCompleto.waist,
          hips: recordCompleto.hips,
          arm_left: recordCompleto.armLeft,
          arm_right: recordCompleto.armRight,
          measured_at: recordCompleto.measuredAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ClientMetric;
    },
    onSuccess: () => {
      // Invalido la cache per forzare l'aggiornamento della lista
      queryClient.invalidateQueries({ queryKey: ['misurazioni', cliente?.id] });
    },
  });

  // Leggo i dati finali privilegiando quelli offline se non siamo connessi
  const misurazioni = queryMisurazioni.error || isOffline
    ? ottieniMisurazioniLocali()
    : queryMisurazioni.data || [];

  return {
    misurazioni,
    inCaricamento: queryMisurazioni.isLoading,
    inserimentoInCorso: salvaMisurazione.isPending,
    salvaMisurazione: salvaMisurazione.mutateAsync,
  };
}
