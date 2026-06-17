// Zustand store per la gestione globale dello stato di autenticazione.
// Memorizza le informazioni dell'utente, del cliente e la sessione attiva.

import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { Client as Cliente } from '@nutriflow/types';

// Definizione dell'interfaccia dello stato di autenticazione
interface StatoAutenticazione {
  // L'utente Supabase con email e ID
  utente: User | null;
  // Il profilo cliente con altezza, peso e ID nutrizionista
  cliente: Cliente | null;
  // La sessione attiva (contiene il token JWT di accesso)
  sessione: Session | null;
  // Azione per impostare l'utente attivo
  impostaUtente: (utente: User | null) => void;
  // Azione per impostare i dati del cliente
  impostaCliente: (cliente: Cliente | null) => void;
  // Azione per impostare la sessione attiva
  impostaSessione: (sessione: Session | null) => void;
  // Azione per effettuare il logout svuotando lo stato
  effettuaLogout: () => void;
}

// Creo lo store Zustand globale
export const useAuthStore = create<StatoAutenticazione>((set) => ({
  utente: null,
  cliente: null,
  sessione: null,

  // Aggiorno l'utente Supabase nello store
  impostaUtente: (utente) => set({ utente }),

  // Aggiorno i dettagli personali del cliente
  impostaCliente: (cliente) => set({ cliente }),

  // Aggiorno la sessione attiva
  impostaSessione: (sessione) => set({ sessione }),

  // Resetto completamente lo store allo stato iniziale
  effettuaLogout: () => set({ utente: null, cliente: null, sessione: null }),
}));
