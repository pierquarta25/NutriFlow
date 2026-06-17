'use client';

// Pagina elenco clienti per il nutrizionista.
// Mostra la lista di tutti i pazienti associati con statistiche, filtri e ricerca.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase/client';
import { Button, Card, Input } from '@nutriflow/ui';
import { Search, Plus, Users, Target, ArrowRight, User } from 'lucide-react';

interface ClienteConProfilo {
  id: string;
  nutritionist_id: string;
  height: number;
  weight: number;
  target: 'lose' | 'maintain' | 'gain';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function PaginaClienti() {
  const [clienti, impostaClienti] = useState<ClienteConProfilo[]>([]);
  const [inCaricamento, impostaInCaricamento] = useState(true);
  const [ricerca, impostaRicerca] = useState('');
  const [filtroTarget, impostaFiltroTarget] = useState<string>('tutti');

  useEffect(() => {
    async function caricaClienti() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Recupero i clienti e i rispettivi profili
        const { data, error } = await supabase
          .from('clients')
          .select('id, nutritionist_id, height, weight, target, created_at, profiles!id(full_name, email, avatar_url)')
          .eq('nutritionist_id', user.id);

        if (error) throw error;

        impostaClienti((data || []) as unknown as ClienteConProfilo[]);
      } catch (err) {
        console.error('Errore nel caricamento dei clienti:', err);
      } finally {
        impostaInCaricamento(false);
      }
    }

    caricaClienti();
  }, []);

  // Filtro i clienti in base alla ricerca ed all'obiettivo selezionato
  const clientiFiltrati = clienti.filter((c) => {
    const corrispondeRicerca =
      c.profiles?.full_name?.toLowerCase().includes(ricerca.toLowerCase()) ||
      c.profiles?.email?.toLowerCase().includes(ricerca.toLowerCase());

    const corrispondeTarget =
      filtroTarget === 'tutti' || c.target === filtroTarget;

    return corrispondeRicerca && corrispondeTarget;
  });

  // Calcolo le statistiche generali
  const statTotale = clienti.length;
  const statPerdita = clienti.filter((c) => c.target === 'lose').length;
  const statMantenimento = clienti.filter((c) => c.target === 'maintain').length;
  const statGuadagno = clienti.filter((c) => c.target === 'gain').length;

  const traduciTarget = (target: string) => {
    switch (target) {
      case 'lose':
        return 'Perdita Peso';
      case 'maintain':
        return 'Mantenimento';
      case 'gain':
        return 'Aumento Massa';
      default:
        return target;
    }
  };

  const coloreTarget = (target: string) => {
    switch (target) {
      case 'lose':
        return 'bg-red-50 text-red-600 border border-red-100';
      case 'maintain':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'gain':
        return 'bg-green-50 text-green-600 border border-green-100';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Intestazione */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">I tuoi Clienti</h2>
          <p className="text-sm text-[#6B7280]">
            Gestisci i pazienti del tuo studio e monitora le loro schede.
          </p>
        </div>
        <div>
          <Link href="/clienti/nuovo">
            <Button
              testo="Nuovo Cliente"
              variante="primario"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Nuovo Cliente</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Sezione Statistiche Rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card paddingInterno={20} className="flex items-center gap-4">
          <div className="p-3 bg-green-50 text-[#16A34A] rounded-xl border border-green-100">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Clienti Totali</span>
            <span className="text-xl font-extrabold text-[#111827]">{statTotale}</span>
          </div>
        </Card>

        <Card paddingInterno={20} className="flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <Target size={20} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Perdita Peso</span>
            <span className="text-xl font-extrabold text-[#111827]">{statPerdita}</span>
          </div>
        </Card>

        <Card paddingInterno={20} className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Target size={20} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Mantenimento</span>
            <span className="text-xl font-extrabold text-[#111827]">{statMantenimento}</span>
          </div>
        </Card>

        <Card paddingInterno={20} className="flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100">
            <Target size={20} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Aumento Massa</span>
            <span className="text-xl font-extrabold text-[#111827]">{statGuadagno}</span>
          </div>
        </Card>
      </div>

      {/* Barra di Ricerca e Filtri */}
      <Card paddingInterno={20} className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
          <input
            type="text"
            placeholder="Cerca per nome o email..."
            value={ricerca}
            onChange={(e) => impostaRicerca(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-lg border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto self-start md:self-auto pb-1 md:pb-0">
          {['tutti', 'lose', 'maintain', 'gain'].map((t) => (
            <button
              key={t}
              onClick={() => impostaFiltroTarget(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                filtroTarget === t
                  ? 'bg-[#16A34A] text-white border-[#16A34A]'
                  : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F9FAFB]'
              }`}
            >
              {t === 'tutti' ? 'Tutti gli Obiettivi' : traduciTarget(t)}
            </button>
          ))}
        </div>
      </Card>

      {/* Tabella o Grid Clienti */}
      {inCaricamento ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#16A34A]"></div>
          <span className="text-sm text-[#6B7280]">Caricamento clienti in corso...</span>
        </div>
      ) : clientiFiltrati.length === 0 ? (
        <Card paddingInterno={48} className="text-center">
          <div className="max-w-md mx-auto flex flex-col gap-4 items-center">
            <div className="p-4 bg-[#F3F4F6] text-[#6B7280] rounded-full">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">Nessun cliente trovato</h3>
            <p className="text-sm text-[#6B7280]">
              {ricerca || filtroTarget !== 'tutti'
                ? 'Prova a modificare i filtri o la query di ricerca.'
                : 'Non hai ancora inserito nessun cliente nel tuo database. Inizia subito creandone uno nuovo!'}
            </p>
            {!ricerca && filtroTarget === 'tutti' && (
              <Link href="/clienti/nuovo" className="mt-2">
                <Button testo="Aggiungi il primo cliente" variante="primario" />
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-bold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-4 px-6">Paziente</th>
                  <th className="py-4 px-6">Altezza</th>
                  <th className="py-4 px-6">Peso Partenza</th>
                  <th className="py-4 px-6">Obiettivo</th>
                  <th className="py-4 px-6">Registrato il</th>
                  <th className="py-4 px-6 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {clientiFiltrati.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group text-sm text-[#111827]"
                  >
                    <td className="py-4 px-6">
                      <Link href={`/clienti/${c.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center font-bold">
                          {c.profiles?.full_name?.charAt(0).toUpperCase() || <User size={16} />}
                        </div>
                        <div>
                          <span className="font-bold text-[#111827] block group-hover:text-[#16A34A] transition-colors">
                            {c.profiles?.full_name || 'N/A'}
                          </span>
                          <span className="text-xs text-[#6B7280] block font-normal">
                            {c.profiles?.email}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-medium">{c.height} cm</td>
                    <td className="py-4 px-6 font-medium">{c.weight} kg</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${coloreTarget(c.target)}`}>
                        {traduciTarget(c.target)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#6B7280]">
                      {new Date(c.created_at).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/clienti/${c.id}`}>
                        <button className="p-2 hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#16A34A] rounded-lg transition-colors">
                          <ArrowRight size={18} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
