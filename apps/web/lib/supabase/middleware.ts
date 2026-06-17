// Middleware Supabase per aggiornare il token di sessione ad ogni richiesta.
// Consente di rinfrescare automaticamente il cookie dell'utente prima della scadenza.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function aggiornaSessione(richiesta: NextRequest) {
  let rispostaNext = NextResponse.next({
    request: {
      headers: richiesta.headers,
    },
  });

  const supabaseClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        get(name: string) {
          return richiesta.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          richiesta.cookies.set({ name, value, ...options });
          rispostaNext = NextResponse.next({
            request: {
              headers: richiesta.headers,
            },
          });
          rispostaNext.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          richiesta.cookies.set({ name, value: '', ...options });
          rispostaNext = NextResponse.next({
            request: {
              headers: richiesta.headers,
            },
          });
          rispostaNext.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Ottengo l'utente corrente rinfrescando la sessione se scaduta
  await supabaseClient.auth.getUser();

  return rispostaNext;
}
