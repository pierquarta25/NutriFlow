// Configurazione del client Supabase per la parte client-side (Browser) di Next.js.
// Utilizzo createBrowserClient per gestire sessioni e chiamate asincrone sul browser.

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@nutriflow/types';

// Inizializzo il client per l'ambiente browser
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);
