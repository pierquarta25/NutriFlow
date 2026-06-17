'use client';

// Pagina di gestione degli appuntamenti della dashboard.
// Consente di visualizzare le visite prenotate (oggi, future, passate)
// e di fissarne di nuove associandole ai clienti del nutrizionista.

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { Button, Card, Input } from '@nutriflow/ui';
import { Calendar, Clock, Plus, Trash2, User, Info, MapPin } from 'lucide-react';

interface ClientOption {
  id: string;
  profiles: {
    full_name: string;
  };
}

interface Appointment {
  id: string;
  data_ora: string;
  tipo: 'visita' | 'follow-up' | 'online';
  note: string | null;
  client_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function PaginaAppuntamenti() {
  const [appuntamenti, impostaAppuntamenti] = useState<Appointment[]>([]);
  const [clienti, impostaClienti] = useState<ClientOption[]>([]);
  const [inCaricamento, impostaInCaricamento] = useState(true);
  const [filtroTab, impostaFiltroTab] = useState<'oggi' | 'prossimi' | 'passati'>('prossimi');

  // Stato form inserimento
  const [formAttivo, impostaFormAttivo] = useState(false);
  const [selezionaCliente, impostaSelezionaCliente] = useState('');
  const [dataGiorno, impostaDataGiorno] = useState('');
  const [oraTempo, impostaOraTempo] = useState('10:00');
  const [tipoVisita, impostaTipoVisita] = useState<'visita' | 'follow-up' | 'online'>('visita');
  const [noteVisita, impostaNoteVisita] = useState('');
  const [erroreForm, impostaErroreForm] = useState<string | null>(null);

  const caricaAppuntamenti = async () => {
    try {
      impostaInCaricamento(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Carico gli appuntamenti associando il nome del cliente
      const { data: appData, error: appErr } = await supabase
        .from('appointments')
        .select('id, data_ora, tipo, note, client_id, profiles!client_id(full_name, email)')
        .eq('nutritionist_id', user.id)
        .order('data_ora', { ascending: true });

      if (appErr) throw appErr;
      impostaAppuntamenti((appData || []) as unknown as Appointment[]);

      // 2. Carico i clienti per il selettore del form
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, profiles!id(full_name)');

      impostaClienti((clientsData || []) as unknown as ClientOption[]);

    } catch (err) {
      console.error(err);
    } finally {
      impostaInCaricamento(false);
    }
  };

  useEffect(() => {
    caricaAppuntamenti();
  }, []);

  const gestisciSalvataggio = async (e: React.FormEvent) => {
    e.preventDefault();
    impostaErroreForm(null);

    if (!selezionaCliente || !dataGiorno || !oraTempo) {
      impostaErroreForm('Compila i campi obbligatori (Cliente, Data e Ora).');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const timestamp = `${dataGiorno}T${oraTempo}:00Z`;

      const { error } = await (supabase.from('appointments') as any)
        .insert({
          nutritionist_id: user.id,
          client_id: selezionaCliente,
          data_ora: timestamp,
          tipo: tipoVisita,
          note: noteVisita.trim() || null,
        });

      if (error) throw error;

      alert('Appuntamento fissato con successo!');
      impostaFormAttivo(false);
      impostaSelezionaCliente('');
      impostaDataGiorno('');
      impostaOraTempo('10:00');
      impostaNoteVisita('');
      caricaAppuntamenti();
    } catch (err: any) {
      console.error(err);
      impostaErroreForm(err.message || 'Si è verificato un errore.');
    }
  };

  const eliminaAppuntamento = async (id: string) => {
    if (!confirm('Sei sicuro di voler annullare questo appuntamento?')) return;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      caricaAppuntamenti();
    } catch (err) {
      console.error(err);
      alert('Errore nell\'eliminazione dell\'appuntamento.');
    }
  };

  // Filtro gli appuntamenti in base alla tab attiva
  const oggiStr = new Date().toISOString().split('T')[0];

  const appuntamentiFiltrati = appuntamenti.filter((app) => {
    const dataAppStr = app.data_ora.split('T')[0];
    if (filtroTab === 'oggi') {
      return dataAppStr === oggiStr;
    } else if (filtroTab === 'prossimi') {
      return new Date(app.data_ora) >= new Date();
    } else {
      return new Date(app.data_ora) < new Date() && dataAppStr !== oggiStr;
    }
  });

  const traduciTipo = (tipo: string) => {
    switch (tipo) {
      case 'visita':
        return 'Prima Visita';
      case 'follow-up':
        return 'Visita di Controllo';
      case 'online':
        return 'Consulenza Online';
      default:
        return tipo;
    }
  };

  const coloreTipo = (tipo: string) => {
    switch (tipo) {
      case 'visita':
        return 'bg-green-50 text-green-600 border border-green-100';
      case 'follow-up':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'online':
        return 'bg-purple-50 text-purple-600 border border-purple-100';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Intestazione */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Calendario Appuntamenti</h2>
          <p className="text-sm text-[#6B7280]">
            Fissa e gestisci le visite mediche e i controlli per il tuo studio di nutrizione.
          </p>
        </div>
        <Button
          testo={formAttivo ? "Chiudi Form" : "Fissa Appuntamento"}
          variante={formAttivo ? "outline" : "primario"}
          onClick={() => impostaFormAttivo(!formAttivo)}
          className="flex items-center gap-2"
        />
      </div>

      {/* Form di Inserimento Appuntamento */}
      {formAttivo && (
        <Card paddingInterno={24} className="bg-white border border-[#E5E7EB] shadow-md max-w-2xl">
          <form onSubmit={gestisciSalvataggio} className="flex flex-col gap-5">
            <h3 className="text-sm font-bold text-[#111827] border-b border-[#F3F4F6] pb-2">
              Dettagli Prenotazione Visita
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selezione Paziente */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B7280]">Paziente *</label>
                <select
                  value={selezionaCliente}
                  onChange={(e) => impostaSelezionaCliente(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all"
                >
                  <option value="">Seleziona un paziente...</option>
                  {clienti.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.profiles?.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo Visita */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B7280]">Tipologia Visita</label>
                <select
                  value={tipoVisita}
                  onChange={(e) => impostaTipoVisita(e.target.value as any)}
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all"
                >
                  <option value="visita">Prima Visita (In Studio)</option>
                  <option value="follow-up">Visita di Controllo (In Studio)</option>
                  <option value="online">Consulenza Video Online</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input etichetta="Data Appuntamento *" valore={dataGiorno} onChange={impostaDataGiorno} tipo="testo" placeholder="AAAA-MM-GG" />
              <Input etichetta="Ora Appuntamento *" valore={oraTempo} onChange={impostaOraTempo} tipo="testo" placeholder="es: 10:30" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#6B7280]">Note cliniche / promemoria</label>
              <textarea
                value={noteVisita}
                onChange={(e) => impostaNoteVisita(e.target.value)}
                placeholder="es: Ricordare di portare gli esami del sangue..."
                rows={3}
                className="w-full p-3 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all resize-none"
              />
            </div>

            {erroreForm && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg text-center">
                {erroreForm}
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <Button testo="Annulla" type="button" variante="outline" onClick={() => impostaFormAttivo(false)} />
              <Button testo="Fissa Visita" type="submit" variante="primario" />
            </div>
          </form>
        </Card>
      )}

      {/* Tabs di Navigazione dei Periodi */}
      <div className="flex border-b border-[#E5E7EB] gap-2">
        {[
          { key: 'prossimi', label: 'Prossimi Appuntamenti' },
          { key: 'oggi', label: 'Visite di Oggi' },
          { key: 'passati', label: 'Storico Visite' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => impostaFiltroTab(tab.key as any)}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              filtroTab === tab.key
                ? 'border-[#16A34A] text-[#16A34A]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenuto Appuntamenti */}
      {inCaricamento ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#16A34A]"></div>
          <span className="text-sm text-[#6B7280]">Caricamento appuntamenti...</span>
        </div>
      ) : appuntamentiFiltrati.length === 0 ? (
        <Card paddingInterno={48} className="text-center bg-white border border-dashed border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280]">Nessun appuntamento programmato in questa sezione.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appuntamentiFiltrati.map((app) => {
            const dataOra = new Date(app.data_ora);
            const dataLeggibile = dataOra.toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const oraLeggibile = dataOra.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Card
                key={app.id}
                paddingInterno={20}
                className="bg-white border border-[#E5E7EB] flex flex-col gap-4 justify-between"
              >
                <div className="flex flex-col gap-3">
                  {/* Badge Tipo */}
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${coloreTipo(app.tipo)}`}>
                      {traduciTipo(app.tipo)}
                    </span>
                    <button
                      onClick={() => eliminaAppuntamento(app.id)}
                      className="p-1.5 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina appuntamento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Nome e Info Paziente */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center font-bold">
                      {app.profiles?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#111827] block">
                        {app.profiles?.full_name}
                      </span>
                      <span className="text-[10px] text-[#6B7280]">
                        {app.profiles?.email}
                      </span>
                    </div>
                  </div>

                  {/* Orario e Mappa */}
                  <div className="flex flex-col gap-1.5 pt-2 text-xs text-[#4B5563] border-t border-[#F3F4F6]">
                    <span className="flex items-center gap-2 font-medium">
                      <Calendar size={14} className="text-[#16A34A]" />
                      <span className="capitalize">{dataLeggibile}</span>
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <Clock size={14} className="text-[#16A34A]" />
                      <span>Ore {oraLeggibile}</span>
                    </span>
                    {app.tipo === 'online' ? (
                      <span className="flex items-center gap-2 font-medium text-purple-600">
                        <MapPin size={14} />
                        <span>Link Video Zoom/Meet nelle note</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 font-medium text-green-600">
                        <MapPin size={14} />
                        <span>Presso il tuo Studio</span>
                      </span>
                    )}
                  </div>

                  {/* Note */}
                  {app.note && (
                    <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs leading-relaxed text-[#6B7280]">
                      <span className="font-semibold text-gray-700 block mb-0.5">Note:</span>
                      {app.note}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
