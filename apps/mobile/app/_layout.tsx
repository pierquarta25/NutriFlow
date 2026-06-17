// Root Layout dell'applicazione mobile.
// Inizializza tutti i provider: QueryClient (TanStack Query) e la gestione
// dello stato di autenticazione con il client Supabase.

import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { sincronizzaDaSupabaseALocale } from '../lib/sync';

// Creo un'istanza globale di QueryClient per gestire la cache delle query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Imposto il tempo di validità della cache a 5 minuti per i piani
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Componente principale che avvolge l'app con i provider necessari
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppConNavigazione />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// Componente interno per gestire la logica di autenticazione e reindirizzamento
function AppConNavigazione() {
  const router = useRouter();
  const segmenti = useSegments();
  const utente = useAuthStore((stato) => stato.utente);
  const impostaUtente = useAuthStore((stato) => stato.impostaUtente);
  const impostaSessione = useAuthStore((stato) => stato.impostaSessione);
  const impostaCliente = useAuthStore((stato) => stato.impostaCliente);

  // Ascolto i cambiamenti dello stato di autenticazione di Supabase
  useEffect(() => {
    // Controllo la sessione iniziale all'avvio
    supabase.auth.getSession().then(({ data: { session } }) => {
      impostaSessione(session);
      impostaUtente(session?.user ?? null);
      
      if (session?.user) {
        // Carico i dati personali del cliente associati
        caricaDatiCliente(session.user.id);
      }
    });

    // Mi iscrivo ai futuri cambiamenti di stato (login, logout, token scaduto)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (evento, sessione) => {
        impostaSessione(sessione);
        impostaUtente(sessione?.user ?? null);

        if (sessione?.user) {
          await caricaDatiCliente(sessione.user.id);
        } else {
          impostaCliente(null);
        }
      }
    );

    return () => {
      // Cancello la sottoscrizione all'unmount del componente
      subscription.unsubscribe();
    };
  }, []);

  // Funzione ausiliaria per recuperare il profilo del cliente da Supabase
  async function caricaDatiCliente(idUtente: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, height, weight, target, nutritionist_id')
      .eq('id', idUtente)
      .single();

    if (!error && data) {
      // Ricavo i dati anagrafici dal profilo pubblico
      const { data: profilo } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', idUtente)
        .single();

      impostaCliente({
        id: data.id,
        nome: profilo?.full_name || 'Cliente',
        email: profilo?.email || '',
        nutritionistId: data.nutritionist_id || '',
        height: Number(data.height) || undefined,
        weight: Number(data.weight) || undefined,
        target: (data.target as 'lose' | 'maintain' | 'gain') || undefined,
      });

      // Avvio la sincronizzazione dei dati per l'offline
      sincronizzaDaSupabaseALocale(data.id);
    }
  }

  // Gestisco il routing automatico in base allo stato di accesso dell'utente
  useEffect(() => {
    // Verifico se l'utente si trova nelle schermate di autenticazione (auth)
    const nellaSchermataAuth = segmenti[0] === '(auth)';

    if (!utente && !nellaSchermataAuth) {
      // Se l'utente non è loggato e non è in auth, lo mando al login
      router.replace('/(auth)/login');
    } else if (utente && nellaSchermataAuth) {
      // Se l'utente è loggato e si trova in auth, lo porto alla home (tabs)
      router.replace('/(tabs)');
    }
  }, [utente, segmenti]);

  // Ritorno il componente slot per caricare la schermata corretta
  return <Slot />;
}
