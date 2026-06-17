// Componente Header fisso superiore per la dashboard.
// Mostra informazioni contestuali (breadcrumb) e widget profilo.

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, User } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function Header() {
  const pathname = usePathname();
  const [nomeNutrizionista, impostaNomeNutrizionista] = useState('Nutrizionista');

  // Recupero le informazioni del nutrizionista connesso
  useEffect(() => {
    async function caricaProfilo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = (await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()) as any;

        if (data?.full_name) {
          impostaNomeNutrizionista(data.full_name);
        }
      }
    }
    caricaProfilo();
  }, []);

  // Genero il titolo contestuale (breadcrumb semplificato) in base al percorso URL
  const ottieniTitoloCorrente = () => {
    if (pathname === '/') return 'Panoramica Generale';
    if (pathname.startsWith('/clienti')) return 'Gestione Clienti';
    if (pathname.startsWith('/alimenti')) return 'Database Alimenti';
    if (pathname.startsWith('/appuntamenti')) return 'Calendario Visite';
    if (pathname.startsWith('/impostazioni')) return 'Impostazioni Profilo';
    return 'NutriFlow';
  };

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white flex items-center justify-between px-8 sticky top-0 z-10 ml-[240px]">
      {/* Titolo breadcrumb */}
      <h1 className="text-base font-bold text-[#111827]">
        {ottieniTitoloCorrente()}
      </h1>

      {/* Widget destra (notifiche e profilo utente) */}
      <div className="flex items-center gap-4">
        {/* Pulsante Notifiche */}
        <button className="p-2 text-[#6B7280] hover:text-[#111827] rounded-full hover:bg-[#F9FAFB] transition-colors relative">
          <Bell size={20} />
          {/* Puntino rosso notifiche non lette */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
        </button>

        <div className="w-[1px] h-6 bg-[#E5E7EB]" />

        {/* Informazioni profilo utente */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-[#111827]">
              {nomeNutrizionista}
            </span>
            <span className="text-xs text-[#6B7280]">Nutrizionista</span>
          </div>

          {/* Avatar rotondo di default */}
          <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center border border-[#E5E7EB] text-[#15803D]">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
