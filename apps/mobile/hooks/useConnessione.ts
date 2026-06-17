// Hook personalizzato per monitorare lo stato della connessione di rete.
// Esegue il caricamento automatico dei dati locali non appena si torna online.

import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '../store/authStore';
import { sincronizzaModificheLocaliVersoSupabase } from '../lib/sync';

export function useConnessione() {
  const [connesso, impostaConnesso] = useState<boolean>(true);
  const cliente = useAuthStore((stato) => stato.cliente);

  useEffect(() => {
    // Sottoscrivo il listener per i cambiamenti di stato di rete
    const rimuoviSottoscrizione = NetInfo.addEventListener((statoRete) => {
      // Verifico se il dispositivo è connesso a internet
      const connessioneAttiva = !!statoRete.isConnected && !!statoRete.isInternetReachable;
      
      impostaConnesso(connessioneAttiva);

      if (connessioneAttiva && cliente?.id) {
        // Se si torna online, avvio la sincronizzazione dei dati offline
        sincronizzaModificheLocaliVersoSupabase(cliente.id);
      }
    });

    return () => {
      // Rimuovo il listener quando il componente viene smontato
      rimuoviSottoscrizione();
    };
  }, [cliente?.id]);

  return {
    isConnected: connesso,
    isOffline: !connesso,
  };
}
