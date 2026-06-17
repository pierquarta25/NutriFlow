// Componente Sidebar per la navigazione fissa desktop della dashboard (240px).
// Gestisce l'evidenziazione del percorso attivo e il logout del nutrizionista.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Apple,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Definizione dei link di navigazione della barra laterale
  const vociNavigazione = [
    {
      nome: 'Panoramica',
      href: '/',
      icona: LayoutDashboard,
    },
    {
      nome: 'Clienti',
      href: '/clienti',
      icona: Users,
    },
    {
      nome: 'Alimenti',
      href: '/alimenti',
      icona: Apple,
    },
    {
      nome: 'Appuntamenti',
      href: '/appuntamenti',
      icona: Calendar,
    },
    {
      nome: 'Impostazioni',
      href: '/impostazioni',
      icona: Settings,
    },
  ];

  // Gestisco la disconnessione del nutrizionista
  const gestisciDisconnessione = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Reindirizzo l'utente alla pagina di login
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <aside className="w-[240px] border-r border-[#E5E7EB] bg-white h-screen flex flex-col justify-between fixed left-0 top-0">
      <div className="flex flex-col gap-6 p-6">
        {/* Logo dell'applicazione */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#16A34A] tracking-wider">
            NutriFlow
          </span>
        </div>

        {/* Menu Navigazione */}
        <nav className="flex flex-col gap-1">
          {vociNavigazione.map((voce) => {
            // Verifico se il percorso corrente corrisponde al link della voce
            const isAttivo =
              pathname === voce.href ||
              (voce.href !== '/' && pathname.startsWith(voce.href));

            const Icona = voce.icona;

            return (
              <Link
                key={voce.nome}
                href={voce.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isAttivo
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
              >
                <Icona size={18} />
                {voce.nome}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer della sidebar con il pulsante Esci */}
      <div className="p-6 border-t border-[#E5E7EB] flex flex-col gap-4">
        <button
          onClick={gestisciDisconnessione}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
        >
          <LogOut size={18} />
          Esci
        </button>
      </div>
    </aside>
  );
}
