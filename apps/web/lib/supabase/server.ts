// Configurazione del client Supabase per la parte server-side (Server Components) di Next.js.
// Utilizzo createServerClient leggendo e impostando i cookie di sessione.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@nutriflow/types';

// Inizializzo il client per l'ambiente server (Server Components ed API)
export function creaClientServer() {
  const gestoreCookie = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        // Leggo il valore del cookie richiesto
        get(name: string) {
          return gestoreCookie.get(name)?.value;
        },
        // Imposto un nuovo cookie per salvare la sessione
        set(name: string, value: string, options: CookieOptions) {
          try {
            gestoreCookie.set({ name, value, ...options });
          } catch (error) {
            // Ignoro l'errore se chiamato in un Server Component dove non si possono modificare i cookie
          }
        },
        // Rimuovo un cookie (es: al logout)
        remove(name: string, options: CookieOptions) {
          try {
            gestoreCookie.set({ name, value: '', ...options });
          } catch (error) {
            // Ignoro l'errore
          }
        },
      },
    }
  );
}
