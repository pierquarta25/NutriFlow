'use client';

// Schermata di registrazione per il nutrizionista.
// Registra un nuovo utente su Supabase impostando il ruolo come 'nutritionist'.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase/client';
import { Button, Input, Card } from '@nutriflow/ui';

export default function PaginaRegistrazione() {
  const router = useRouter();
  const [nomeCompleto, impostaNomeCompleto] = useState('');
  const [email, impostaEmail] = useState('');
  const [password, impostaPassword] = useState('');
  const [caricamento, impostaCaricamento] = useState(false);
  const [erroreNome, impostaErroreNome] = useState('');
  const [erroreEmail, impostaErroreEmail] = useState('');
  const [errorePassword, impostaErrorePassword] = useState('');
  const [erroreGenerale, impostaErroreGenerale] = useState('');
  const [successo, impostaSuccesso] = useState(false);

  // Valido i campi del form
  const validaForm = () => {
    let valido = true;
    impostaErroreNome('');
    impostaErroreEmail('');
    impostaErrorePassword('');
    impostaErroreGenerale('');

    if (!nomeCompleto) {
      impostaErroreNome('Il nome completo è richiesto.');
      valido = false;
    } else if (nomeCompleto.trim().split(' ').length < 2) {
      impostaErroreNome('Inserisci nome e cognome.');
      valido = false;
    }

    if (!email) {
      impostaErroreEmail('L\'indirizzo email è richiesto.');
      valido = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      impostaErroreEmail('Inserisci un indirizzo email valido.');
      valido = false;
    }

    if (!password) {
      impostaErrorePassword('La password è richiesta.');
      valido = false;
    } else if (password.length < 6) {
      impostaErrorePassword('La password deve contenere almeno 6 caratteri.');
      valido = false;
    }

    return valido;
  };

  // Gestisco l'invio del form di registrazione
  const gestisciRegistrazione = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validaForm()) return;

    impostaCaricamento(true);

    try {
      // Effettuo la registrazione su Supabase.
      // Passiamo 'full_name' e 'role' nei metadati dell'utente per attivare il trigger Postgres.
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: nomeCompleto.trim(),
            role: 'nutritionist',
          },
        },
      });

      if (error) {
        impostaErroreGenerale(error.message);
        impostaCaricamento(false);
        return;
      }

      // Se ha successo, mostriamo un messaggio e dopo pochi secondi reindirizziamo al login
      impostaSuccesso(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      impostaErroreGenerale('Errore durante la registrazione. Riprova più tardi.');
      impostaCaricamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FBF7] via-white to-[#EBF5EF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Intestazione / Logo */}
        <div className="text-center mb-8 flex flex-col gap-2">
          <Link href="/" className="text-3xl font-extrabold text-[#16A34A] tracking-wider hover:opacity-90 transition-opacity">
            NutriFlow
          </Link>
          <p className="text-sm text-[#6B7280]">
            Crea il tuo account professionale da nutrizionista
          </p>
        </div>

        {/* Card della Registrazione */}
        <Card paddingInterno={32} className="shadow-xl bg-white border border-[#E5E7EB]/60 backdrop-blur-md">
          {successo ? (
            <div className="text-center flex flex-col gap-4 py-4">
              <div className="w-16 h-16 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Registrazione completata!</h3>
              <p className="text-sm text-[#6B7280]">
                Ti stiamo reindirizzando alla pagina di accesso per effettuare il login.
              </p>
            </div>
          ) : (
            <form onSubmit={gestisciRegistrazione} className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#111827] mb-2 text-center">
                Nuovo Account
              </h2>

              {/* Input Nome Completo */}
              <Input
                etichetta="Nome e Cognome"
                valore={nomeCompleto}
                onChange={impostaNomeCompleto}
                placeholder="es: Dott. Mario Rossi"
                tipo="testo"
                errore={erroreNome}
                disabled={caricamento}
                autoComplete="name"
              />

              {/* Input Email */}
              <Input
                etichetta="Indirizzo Email"
                valore={email}
                onChange={impostaEmail}
                placeholder="es: mario.rossi@nutriflow.it"
                tipo="email"
                errore={erroreEmail}
                disabled={caricamento}
                autoComplete="email"
              />

              {/* Input Password */}
              <Input
                etichetta="Password (min. 6 caratteri)"
                valore={password}
                onChange={impostaPassword}
                placeholder="Crea una password sicura"
                tipo="password"
                errore={errorePassword}
                disabled={caricamento}
                autoComplete="new-password"
              />

              {/* Errore Generale */}
              {erroreGenerale && (
                <div className="p-3 bg-[#FEE2E2] text-[#B91C1C] rounded-lg text-xs font-semibold text-center border border-[#FECACA]">
                  {erroreGenerale}
                </div>
              )}

              {/* Bottone di Invio */}
              <Button
                testo="Registrati"
                type="submit"
                variante="primario"
                caricamento={caricamento}
                disabilitato={caricamento}
                className="w-full mt-2"
              />

              {/* Link di accesso */}
              <div className="text-center mt-4 text-xs text-[#6B7280]">
                Hai già un account?{' '}
                <Link href="/login" className="font-bold text-[#16A34A] hover:underline">
                  Accedi qui
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
