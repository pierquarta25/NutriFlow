'use client';

// Schermata di login per il nutrizionista.
// Consente l'accesso tramite email e password utilizzando il client Supabase.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase/client';
import { Button, Input, Card } from '@nutriflow/ui';

export default function PaginaLogin() {
  const router = useRouter();
  const [email, impostaEmail] = useState('');
  const [password, impostaPassword] = useState('');
  const [caricamento, impostaCaricamento] = useState(false);
  const [erroreEmail, impostaErroreEmail] = useState('');
  const [errorePassword, impostaErrorePassword] = useState('');
  const [erroreGenerale, impostaErroreGenerale] = useState('');

  // Valido i campi del form
  const validaForm = () => {
    let valido = true;
    impostaErroreEmail('');
    impostaErrorePassword('');
    impostaErroreGenerale('');

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

  // Gestisco l'accesso
  const gestisciAccesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validaForm()) return;

    impostaCaricamento(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          impostaErroreGenerale('Email o password non corretti.');
        } else {
          impostaErroreGenerale(error.message);
        }
        impostaCaricamento(false);
        return;
      }

      // Se l'accesso ha successo, reindirizzo alla dashboard.
      // Il middleware si occuperà di verificare la validità della sessione.
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      impostaErroreGenerale('Errore durante il tentativo di accesso. Riprova più tardi.');
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
            Accedi allo studio professionale dei nutrizionisti
          </p>
        </div>

        {/* Card del Login */}
        <Card paddingInterno={32} className="shadow-xl bg-white border border-[#E5E7EB]/60 backdrop-blur-md">
          <form onSubmit={gestisciAccesso} className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-[#111827] mb-2 text-center">
              Bentornato
            </h2>

            {/* Input Email */}
            <Input
              etichetta="Indirizzo Email"
              valore={email}
              onChange={impostaEmail}
              placeholder="es: dottore@nutriflow.it"
              tipo="email"
              errore={erroreEmail}
              disabled={caricamento}
              autoComplete="email"
            />

            {/* Input Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <Input
                etichetta="Password"
                valore={password}
                onChange={impostaPassword}
                placeholder="Inserisci la tua password"
                tipo="password"
                errore={errorePassword}
                disabled={caricamento}
                autoComplete="current-password"
              />
            </div>

            {/* Errore Generale */}
            {erroreGenerale && (
              <div className="p-3 bg-[#FEE2E2] text-[#B91C1C] rounded-lg text-xs font-semibold text-center border border-[#FECACA]">
                {erroreGenerale}
              </div>
            )}

            {/* Bottone di Invio */}
            <Button
              testo="Accedi"
              type="submit"
              variante="primario"
              caricamento={caricamento}
              disabilitato={caricamento}
              className="w-full mt-2"
            />

            {/* Link di registrazione */}
            <div className="text-center mt-4 text-xs text-[#6B7280]">
              Non hai ancora un account?{' '}
              <Link href="/register" className="font-bold text-[#16A34A] hover:underline">
                Registrati gratis
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
