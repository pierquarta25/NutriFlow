// Middleware di Next.js per la protezione dei percorsi (Route Protection).
// Controlla ad ogni richiesta se l'utente è autenticato e gestisce i redirect.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(richiesta: NextRequest) {
  let rispostaNext = NextResponse.next({
    request: {
      headers: richiesta.headers,
    },
  });

  // Creo il client Supabase specifico per il middleware
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

  // Verifico lo stato di autenticazione dell'utente
  const { data: { user } } = await supabaseClient.auth.getUser();

  const percorsoRichiesto = richiesta.nextUrl.pathname;
  const isSchermataAuth = percorsoRichiesto === '/login' || percorsoRichiesto === '/register';

  // Se l'utente non è autenticato e prova ad accedere all'area riservata, lo mando al login
  if (!user && !isSchermataAuth && percorsoRichiesto !== '/') {
    return NextResponse.redirect(new URL('/login', richiesta.url));
  }

  // Se l'utente è già loggato e prova ad andare sul login/registrazione, lo rimando alla dashboard
  if (user && isSchermataAuth) {
    return NextResponse.redirect(new URL('/', richiesta.url));
  }

  return rispostaNext;
}

// Configuro i percorsi su cui attivare questo middleware
export const config = {
  matcher: [
    /*
     * Intercetto tutti i percorsi tranne:
     * - api (chiamate api interne)
     * - _next/static (file statici generati da Next)
     * - _next/image (servizio di ottimizzazione immagini)
     * - favicon.ico (icona del sito)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
