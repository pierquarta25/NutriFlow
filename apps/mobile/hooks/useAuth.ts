// Hook personalizzato per gestire lo stato dell'autenticazione.
// Fornisce l'accesso veloce ai dettagli dell'utente e la funzione di disconnessione.

import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const utente = useAuthStore((stato) => stato.utente);
  const cliente = useAuthStore((stato) => stato.cliente);
  const sessione = useAuthStore((stato) => stato.sessione);
  const effettuaLogout = useAuthStore((stato) => stato.effettuaLogout);

  // Eseguo la disconnessione svuotando Supabase e lo store locale
  const disconnettiUtente = async () => {
    try {
      // Comunico a Supabase di chiudere la sessione
      await supabase.auth.signOut();
    } catch (errore) {
      console.error('Errore durante il logout da Supabase:', errore);
    } finally {
      // Pulisco lo store globale di Zustand in ogni caso
      effettuaLogout();
    }
  };

  // Restituisco i dati dell'utente e la funzione per uscire
  return {
    utente,
    cliente,
    sessione,
    autenticato: !!utente,
    disconnettiUtente,
  };
}
