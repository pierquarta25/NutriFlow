// Pagina principale della Dashboard (Panoramica) posizionata su /dashboard.
// Mostra statistiche, appuntamenti del giorno e grafico iscrizioni.

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar as CalendarIcon,
  FileText,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../../lib/supabase/client';
import { Card } from '@nutriflow/ui';

export default function PaginaPanoramicaDashboard() {
  const [statistiche, impostaStatistiche] = useState({
    clientiAttivi: 0,
    appuntamentiOggi: 0,
    pianiInScadenza: 2,
    questionariNonLetti: 1,
  });

  const [ultimiClienti, impostaUltimiClienti] = useState<any[]>([]);
  const [appuntamentiGiorno, impostaAppuntamentiGiorno] = useState<any[]>([]);

  const datiGraficoIscrizioni = [
    { mese: 'Gen', clienti: 4 },
    { mese: 'Feb', clienti: 6 },
    { mese: 'Mar', clienti: 8 },
    { mese: 'Apr', clienti: 5 },
    { mese: 'Mag', clienti: 10 },
    { mese: 'Giu', clienti: 12 },
  ];

  useEffect(() => {
    async function caricaDatiPanoramica() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Conteggio clienti
      const { count: conteggioClienti } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('nutritionist_id', user.id);

      // 2. Conteggio appuntamenti
      const oggi = new Date().toISOString().split('T')[0] || '';
      const { count: conteggioAppuntamenti } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('nutritionist_id', user.id)
        .gte('data_ora', `${oggi}T00:00:00Z`)
        .lte('data_ora', `${oggi}T23:59:59Z`);

      impostaStatistiche({
        clientiAttivi: conteggioClienti || 0,
        appuntamentiOggi: conteggioAppuntamenti || 0,
        pianiInScadenza: 2,
        questionariNonLetti: 1,
      });

      // 3. Ultimi 5 clienti
      const { data: clientiCaricati } = await supabase
        .from('clients')
        .select('id, profiles (full_name, email)')
        .eq('nutritionist_id', user.id)
        .limit(5);

      if (clientiCaricati) {
        impostaUltimiClienti(clientiCaricati);
      }

      // 4. Appuntamenti
      const { data: appuntamentiCaricati } = await supabase
        .from('appointments')
        .select('id, data_ora, tipo, profiles!client_id (full_name)')
        .eq('nutritionist_id', user.id)
        .gte('data_ora', `${oggi}T00:00:00Z`)
        .lte('data_ora', `${oggi}T23:59:59Z`)
        .order('data_ora', { ascending: true });

      if (appuntamentiCaricati) {
        impostaAppuntamentiGiorno(appuntamentiCaricati);
      }
    }

    caricaDatiPanoramica();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-[#111827]">Panoramica Giornaliera</h2>
        <p className="text-sm text-[#6B7280]">
          Ecco la situazione del tuo studio e le attività per oggi.
        </p>
      </div>

      {/* Grid delle Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card paddingInterno={24} className="flex items-center gap-4">
          <div className="p-3 bg-[#DCFCE7] text-[#16A34A] rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Clienti Attivi</span>
            <span className="text-2xl font-bold text-[#111827]">{statistiche.clientiAttivi}</span>
          </div>
        </Card>

        <Card paddingInterno={24} className="flex items-center gap-4">
          <div className="p-3 bg-[#DBEAFE] text-[#3B82F6] rounded-xl">
            <CalendarIcon size={24} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Appuntamenti Oggi</span>
            <span className="text-2xl font-bold text-[#111827]">{statistiche.appuntamentiOggi}</span>
          </div>
        </Card>

        <Card paddingInterno={24} className="flex items-center gap-4">
          <div className="p-3 bg-[#FEF3C7] text-[#F59E0B] rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Piani in Scadenza</span>
            <span className="text-2xl font-bold text-[#111827]">{statistiche.pianiInScadenza}</span>
          </div>
        </Card>

        <Card paddingInterno={24} className="flex items-center gap-4">
          <div className="p-3 bg-[#FEE2E2] text-[#EF4444] rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <span className="text-xs text-[#6B7280] font-medium block">Questionari Nuovi</span>
            <span className="text-2xl font-bold text-[#111827]">{statistiche.questionariNonLetti}</span>
          </div>
        </Card>
      </div>

      {/* Colonne Appuntamenti e Clienti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card paddingInterno={24} className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-[#111827]">Appuntamenti del Giorno</h3>
          <div className="flex flex-col gap-3">
            {appuntamentiGiorno.length === 0 ? (
              <p className="text-sm text-[#6B7280] font-medium italic py-4">
                Nessun appuntamento in programma per oggi.
              </p>
            ) : (
              appuntamentiGiorno.map((app) => {
                const ora = new Date(app.data_ora).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={app.id}
                    className="flex justify-between items-center p-3 hover:bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-[#111827] block">
                        {app.profiles?.full_name || 'Cliente'}
                      </span>
                      <span className="text-xs text-[#6B7280] capitalize">
                        {app.tipo}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#16A34A]">{ora}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card paddingInterno={24} className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-[#111827]">Ultimi Clienti Aggiunti</h3>
          <div className="flex flex-col gap-3">
            {ultimiClienti.length === 0 ? (
              <p className="text-sm text-[#6B7280] font-medium italic py-4">
                Non hai ancora aggiunto alcun cliente.
              </p>
            ) : (
              ultimiClienti.map((c) => (
                <Link
                  key={c.id}
                  href={`/clienti/${c.id}`}
                  className="flex justify-between items-center p-3 hover:bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] transition-colors group"
                >
                  <div>
                    <span className="text-sm font-bold text-[#111827] block group-hover:text-[#16A34A]">
                      {c.profiles?.full_name || 'Cliente'}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {c.profiles?.email}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-[#9CA3AF] group-hover:text-[#16A34A]" />
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Grafico */}
      <Card paddingInterno={24} className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#111827]">Andamento Iscrizioni Clienti</h3>
          <p className="text-xs text-[#6B7280]">Nuovi clienti acquisiti negli ultimi 6 mesi</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datiGraficoIscrizioni}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="mese" tickLine={false} axisLine={false} fontSize={12} stroke="#6B7280" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#6B7280" />
              <Tooltip cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="clienti" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
