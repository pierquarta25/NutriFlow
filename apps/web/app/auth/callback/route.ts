import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Questo endpoint gestisce il callback dell'autenticazione di Supabase.
// Quando un utente clicca sul link di conferma email o effettua il login social,
// Supabase rimanda a questo percorso con un parametro ?code=...
// Scambiamo questo codice temporaneo con una sessione utente persistita nei cookie.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Se presente, prendo la rotta di reindirizzamento successiva, altrimenti vado alla dashboard
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = cookies();
    
    // Inizializzo il client Supabase specifico per il server di Next.js
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Eseguo lo scambio del codice con i cookie di sessione
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Reindirizzo l'utente loggato all'area riservata
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // In caso di errore di autenticazione, rimando alla pagina di login con errore
  return NextResponse.redirect(`${origin}/login?error=Errore durante la conferma dell'account`);
}
