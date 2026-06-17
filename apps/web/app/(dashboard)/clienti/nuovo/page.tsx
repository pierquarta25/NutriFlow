'use client';

// Pagina di creazione di un nuovo cliente.
// Registra l'utente tramite un client Supabase temporaneo (per non sovrascrivere la sessione attiva)
// e poi associa il record del cliente al nutrizionista corrente.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../../lib/supabase/client';
import { Button, Input, Card } from '@nutriflow/ui';
import { ArrowLeft, UserPlus, Info } from 'lucide-react';

export default function PaginaNuovoCliente() {
  const router = useRouter();
  const [nomeCompleto, impostaNomeCompleto] = useState('');
  const [email, impostaEmail] = useState('');
  const [password, impostaPassword] = useState('');
  const [altezza, impostaAltezza] = useState('');
  const [peso, impostaPeso] = useState('');
  const [target, impostaTarget] = useState<'lose' | 'maintain' | 'gain'>('lose');
  const [inCaricamento, impostaInCaricamento] = useState(false);
  const [erroreGenerale, impostaErroreGenerale] = useState<string | null>(null);
  const [successo, impostaSuccesso] = useState(false);

  const gestisciSalvataggio = async (e: React.FormEvent) => {
    e.preventDefault();
    impostaErroreGenerale(null);

    // Validazioni base
    if (!nomeCompleto || !email || !password || !altezza || !peso) {
      impostaErroreGenerale('Tutti i campi sono obbligatori.');
      return;
    }

    const heightNum = parseFloat(altezza);
    const weightNum = parseFloat(peso);

    if (isNaN(heightNum) || heightNum <= 0) {
      impostaErroreGenerale('L\'altezza deve essere un numero valido maggiore di zero.');
      return;
    }

    if (isNaN(weightNum) || weightNum <= 0) {
      impostaErroreGenerale('Il peso deve essere un numero valido maggiore di zero.');
      return;
    }

    impostaInCaricamento(true);

    try {
      // 1. Recupero le informazioni del nutrizionista corrente
      const { data: { user: nutrizionista } } = await supabase.auth.getUser();
      if (!nutrizionista) {
        impostaErroreGenerale('Accesso non autorizzato o sessione scaduta.');
        impostaInCaricamento(false);
        return;
      }

      // 2. Creiamo un client Supabase temporaneo senza persistenza di stato (per non disconnettere il nutrizionista)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configurazioni Supabase mancanti nelle variabili d\'ambiente.');
      }

      const clientTemporaneo = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // 3. Eseguiamo la registrazione del cliente su auth.users
      const { data: authData, error: authError } = await clientTemporaneo.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: nomeCompleto.trim(),
            role: 'client',
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const nuovoUtenteId = authData.user?.id;
      if (!nuovoUtenteId) {
        throw new Error('Impossibile ottenere l\'ID del nuovo utente.');
      }

      // 4. Inseriamo i dati fisici ed associamo il cliente al nutrizionista nella tabella clients.
      // Questa query viene fatta tramite il client principale, in quanto il nutrizionista ha i permessi di scrittura.
      const { error: dbError } = await (supabase.from('clients') as any)
        .insert({
          id: nuovoUtenteId,
          nutritionist_id: nutrizionista.id,
          height: heightNum,
          weight: weightNum,
          target: target,
        });

      if (dbError) {
        throw dbError;
      }

      impostaSuccesso(true);
      setTimeout(() => {
        router.push('/clienti');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      impostaErroreGenerale(err.message || 'Si è verificato un errore durante la registrazione del cliente.');
    } finally {
      impostaInCaricamento(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Link Torna Indietro */}
      <div>
        <Link
          href="/clienti"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Torna alla lista clienti</span>
        </Link>
      </div>

      {/* Titolo */}
      <div>
        <h2 className="text-2xl font-bold text-[#111827]">Registra un nuovo Cliente</h2>
        <p className="text-sm text-[#6B7280]">
          {"Crea le credenziali d'accesso per il paziente e imposta i suoi dati fisici iniziali."}
        </p>
      </div>

      <Card paddingInterno={32} className="shadow-lg border border-[#E5E7EB]/60 bg-white">
        {successo ? (
          <div className="text-center py-12 flex flex-col gap-4 items-center">
            <div className="w-16 h-16 bg-green-50 text-[#16A34A] rounded-full flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-[#111827]">Cliente registrato con successo!</h3>
            <p className="text-sm text-[#6B7280]">
              {"Il paziente è stato aggiunto al database ed è pronto per accedere all'app mobile."}
            </p>
          </div>
        ) : (
          <form onSubmit={gestisciSalvataggio} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sezione 1: Credenziali di Accesso */}
              <div className="flex flex-col gap-5">
                <span className="text-sm font-bold text-[#111827] pb-1 border-b border-[#F3F4F6] block">
                  Dati di Accesso (App Mobile)
                </span>

                <Input
                  etichetta="Nome e Cognome"
                  valore={nomeCompleto}
                  onChange={impostaNomeCompleto}
                  placeholder="es: Matteo Bianchi"
                  tipo="testo"
                  disabled={inCaricamento}
                />

                <Input
                  etichetta="Indirizzo Email"
                  valore={email}
                  onChange={impostaEmail}
                  placeholder="es: matteo.bianchi@gmail.com"
                  tipo="email"
                  disabled={inCaricamento}
                />

                <Input
                  etichetta="Password Temporanea"
                  valore={password}
                  onChange={impostaPassword}
                  placeholder="Minimo 6 caratteri"
                  tipo="password"
                  disabled={inCaricamento}
                />

                <div className="flex gap-2.5 p-3.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-xs leading-relaxed">
                  <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    {"Il cliente utilizzerà questa **email** e **password** per effettuare l'accesso sulla propria applicazione mobile. Comunicagliele in modo sicuro."}
                  </span>
                </div>
              </div>

              {/* Sezione 2: Parametri Fisici */}
              <div className="flex flex-col gap-5">
                <span className="text-sm font-bold text-[#111827] pb-1 border-b border-[#F3F4F6] block">
                  Parametri Clinici Iniziali
                </span>

                <Input
                  etichetta="Altezza"
                  valore={altezza}
                  onChange={impostaAltezza}
                  placeholder="es: 175"
                  suffisso="cm"
                  tipo="numero"
                  disabled={inCaricamento}
                />

                <Input
                  etichetta="Peso Iniziale"
                  valore={peso}
                  onChange={impostaPeso}
                  placeholder="es: 78.5"
                  suffisso="kg"
                  tipo="numero"
                  disabled={inCaricamento}
                />

                {/* Scelta Obiettivo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B7280]">Obiettivo Principale</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'lose', etichetta: 'Dimagrire' },
                      { val: 'maintain', etichetta: 'Mantenere' },
                      { val: 'gain', etichetta: 'Aumentare Massa' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => impostaTarget(opt.val as any)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                          target === opt.val
                            ? 'bg-[#16A34A] text-white border-[#16A34A]'
                            : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {opt.etichetta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mostro errore se presente */}
            {erroreGenerale && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-medium text-center">
                {erroreGenerale}
              </div>
            )}

            {/* Pulsanti di Azione */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#F3F4F6]">
              <Link href="/clienti">
                <Button
                  testo="Annulla"
                  type="button"
                  variante="outline"
                  disabled={inCaricamento}
                />
              </Link>
              <Button
                testo="Registra Paziente"
                type="submit"
                variante="primario"
                caricamento={inCaricamento}
                disabilitato={inCaricamento}
                className="flex items-center gap-2"
              />
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
