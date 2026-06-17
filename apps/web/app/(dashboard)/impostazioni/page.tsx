'use client';

// Pagina delle impostazioni del nutrizionista.
// Gestisce l'aggiornamento del profilo, la configurazione dello studio,
// e permette di disconnettere la sessione.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import { Button, Card, Input } from '@nutriflow/ui';
import { User, Shield, CreditCard, LogOut, Settings } from 'lucide-react';

export default function PaginaImpostazioni() {
  const router = useRouter();
  const [nomeCompleto, impostaNomeCompleto] = useState('');
  const [email, impostaEmail] = useState('');
  const [avatarUrl, impostaAvatarUrl] = useState('');
  const [prezzoVisita, impostaPrezzoVisita] = useState('80');
  const [prezzoControllo, impostaPrezzoControllo] = useState('50');
  const [inCaricamento, impostaInCaricamento] = useState(true);
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);

  useEffect(() => {
    async function caricaDatiProfilo() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        impostaEmail(user.email || '');

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const profilo = data as any;
        if (profilo) {
          impostaNomeCompleto(profilo.full_name || '');
          impostaAvatarUrl(profilo.avatar_url || '');
        }
      } catch (err) {
        console.error('Errore caricamento profilo:', err);
      } finally {
        impostaInCaricamento(false);
      }
    }

    caricaDatiProfilo();
  }, []);

  const gestisciAggiornamentoProfilo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto.trim()) return alert('Il nome completo è obbligatorio.');

    setSalvataggioInCorso(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase.from('profiles') as any)
        .update({
          full_name: nomeCompleto.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Profilo aggiornato con successo!');
    } catch (err) {
      console.error(err);
      alert('Impossibile aggiornare il profilo.');
    } finally {
      setSalvataggioInCorso(false);
    }
  };

  const gestisciLogout = async () => {
    if (!confirm('Sei sicuro di voler uscire dal tuo account?')) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Errore durante il logout:', err);
    }
  };

  if (inCaricamento) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#16A34A]"></div>
        <span className="text-sm text-[#6B7280]">Caricamento impostazioni...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Intestazione */}
      <div>
        <h2 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <Settings size={24} className="text-[#16A34A]" />
          <span>Impostazioni Profilo e Studio</span>
        </h2>
        <p className="text-sm text-[#6B7280]">
          Aggiorna i tuoi dati personali, configura il listino prezzi e gestisci il tuo account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonna Sinistra: Profilo Personale */}
        <Card paddingInterno={24} className="md:col-span-2 bg-white border border-[#E5E7EB] flex flex-col gap-5">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 border-b border-[#F3F4F6] pb-2">
            <User size={18} className="text-[#16A34A]" />
            <span>Informazioni Personali</span>
          </h3>

          <form onSubmit={gestisciAggiornamentoProfilo} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                etichetta="Nome Completo"
                valore={nomeCompleto}
                onChange={impostaNomeCompleto}
                placeholder="es: Dott.ssa Rossi"
                disabled={salvataggioInCorso}
              />
              <Input
                etichetta="Indirizzo Email (Non modificabile)"
                valore={email}
                onChange={() => {}}
                tipo="email"
                disabilitato={true}
              />
            </div>

            <Input
              etichetta="URL Foto Profilo / Avatar (Opzionale)"
              valore={avatarUrl}
              onChange={impostaAvatarUrl}
              placeholder="https://esempio.com/foto.jpg"
              disabled={salvataggioInCorso}
            />

            <div className="flex justify-end pt-2">
              <Button
                testo="Salva Modifiche"
                type="submit"
                variante="primario"
                caricamento={salvataggioInCorso}
                disabilitato={salvataggioInCorso}
              />
            </div>
          </form>
        </Card>

        {/* Colonna Destra: Listino Prezzi & Account */}
        <div className="flex flex-col gap-6">
          {/* Prezzi Visite */}
          <Card paddingInterno={20} className="bg-white border border-[#E5E7EB] flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 border-b border-[#F3F4F6] pb-1.5">
              <CreditCard size={16} className="text-[#16A34A]" />
              <span>Listino Prezzi Visite</span>
            </h3>

            <div className="flex flex-col gap-3">
              <Input
                etichetta="Prima Visita"
                valore={prezzoVisita}
                onChange={impostaPrezzoVisita}
                tipo="numero"
                suffisso="€"
              />
              <Input
                etichetta="Controllo"
                valore={prezzoControllo}
                onChange={impostaPrezzoControllo}
                tipo="numero"
                suffisso="€"
              />
            </div>

            <Button
              testo="Salva Listino"
              variante="secondario"
              className="text-xs w-full mt-1"
              onClick={() => alert('Listino prezzi salvato!')}
            />
          </Card>

          {/* Account e Logout */}
          <Card paddingInterno={20} className="bg-white border border-[#E5E7EB] flex flex-col gap-4">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2 border-b border-[#F3F4F6] pb-1.5">
              <Shield size={16} className="text-red-500" />
              <span>Gestione Account</span>
            </h3>

            <p className="text-xs text-[#6B7280]">
              Disconnetti la sessione attiva da questo browser in modo sicuro.
            </p>

            <Button
              testo="Esci dall'Account"
              variante="pericolo"
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold"
              onClick={gestisciLogout}
            >
              <LogOut size={14} />
              <span>{"Esci dall'Account"}</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
