// Configurazione del client Supabase per l'applicazione mobile.
// Includo il polyfill per gestire correttamente le URL in React Native.
// Utilizzo AsyncStorage per salvare la sessione di accesso sul dispositivo.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@nutriflow/types';

// Definisco l'URL e la chiave anonima prendendoli dalle variabili d'ambiente
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Creo il client Supabase con la persistenza della sessione attiva
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Indico ad Auth di memorizzare i dati di sessione in AsyncStorage
    storage: AsyncStorage,
    // Attivo il refresh automatico del token JWT scaduto
    autoRefreshToken: true,
    // Permetto di salvare la sessione per non dover rifare il login ogni volta
    persistSession: true,
    // Disabilito la ricerca della sessione nei parametri URL (non serve in React Native)
    detectSessionInUrl: false,
  },
});
