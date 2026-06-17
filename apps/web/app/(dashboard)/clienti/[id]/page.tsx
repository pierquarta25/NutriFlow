'use client';

// Pagina di dettaglio cliente per la dashboard del nutrizionista.
// Fornisce un centro clinico completo suddiviso in tab:
// 1. Panoramica (dati fisici, calcolatore BMR/TDEE, grafico del peso)
// 2. Piano Alimentare (creazione e modifica dei piani nutrizionali)
// 3. Diario Alimentare (lettura di cosa mangia il paziente in tempo reale)
// 4. Questionari (risposte fornite dal paziente via app)

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase/client';
import { Button, Card, Input } from '@nutriflow/ui';
import {
  ArrowLeft,
  User,
  Activity,
  Plus,
  Scale,
  Trash2,
  Calendar,
  Sparkles,
  BookOpen,
  PieChart,
} from 'lucide-react';
import { calcolaMetabolismoBasale, calcolaTDEE, LivelloAttivita } from '@nutriflow/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ClientDetail {
  id: string;
  height: number;
  weight: number;
  target: 'lose' | 'maintain' | 'gain';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Metric {
  id: string;
  weight: number;
  measured_at: string;
}

interface FoodLog {
  id: string;
  nome_alimento: string;
  quantita_grammi: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  pasto: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  logged_at: string;
}

interface MealPlan {
  id: string;
  nome: string;
  start_date: string;
  end_date: string;
}

interface FoodItemDB {
  id: string;
  nome: string;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
}

export default function DettaglioCliente({ params }: { params: { id: string } }) {
  const { id: clientId } = params;
  const [cliente, impostaCliente] = useState<ClientDetail | null>(null);
  const [misurazioni, impostaMisurazioni] = useState<Metric[]>([]);
  const [diario, impostaDiario] = useState<FoodLog[]>([]);
  const [piani, impostaPiani] = useState<MealPlan[]>([]);
  const [tabAttivo, impostaTabAttivo] = useState<'panoramica' | 'piani' | 'diario' | 'questionari'>('panoramica');
  const [inCaricamento, impostaInCaricamento] = useState(true);

  // Stati per il calcolatore BMR/TDEE Live
  const [genere, impostaGenere] = useState<'male' | 'female'>('male');
  const [eta, impostaEta] = useState('30');
  const [attivita, impostaAttivita] = useState<LivelloAttivita>('moderately_active');
  const [bmrCalcolato, impostaBmrCalcolato] = useState<number | null>(null);
  const [tdeeCalcolato, impostaTdeeCalcolato] = useState<number | null>(null);

  // Stati per creazione Piano Alimentare
  const [creazionePiano, impostaCreazionePiano] = useState(false);
  const [nomePiano, impostaNomePiano] = useState('');
  const [dataInizio, impostaDataInizio] = useState('');
  const [dataFine, impostaDataFine] = useState('');
  const [giorniPiano, impostaGiorniPiano] = useState<Record<string, { pasto: string; cibi: { id_cibo: string; nome: string; grammi: number; cal: number }[] }[]>>({});
  const [cibiDisponibili, impostaCibiDisponibili] = useState<FoodItemDB[]>([]);
  const [cercaCibo, impostaCercaCibo] = useState('');
  const [selezionaGiorno, impostaSelezionaGiorno] = useState('lunedi');
  const [selezionaPasto, impostaSelezionaPasto] = useState('Colazione');
  const [pesoGrammi, impostaPesoGrammi] = useState('100');

  useEffect(() => {
    async function caricaTutto() {
      try {
        // 1. Dati del cliente
        const { data: clientData, error: clientErr } = await supabase
          .from('clients')
          .select('id, height, weight, target, created_at, profiles!id(full_name, email)')
          .eq('id', clientId)
          .single();

        if (clientErr) throw clientErr;
        impostaCliente(clientData as unknown as ClientDetail);

        // 2. Misurazioni peso
        const { data: metricsData } = await supabase
          .from('client_metrics')
          .select('id, weight, measured_at')
          .eq('client_id', clientId)
          .order('measured_at', { ascending: true });

        impostaMisurazioni(metricsData || []);

        // 3. Diario alimentare
        const { data: logsData } = await supabase
          .from('food_logs')
          .select('*')
          .eq('client_id', clientId)
          .order('logged_at', { ascending: false });

        impostaDiario(logsData || []);

        // 4. Piani alimentari
        const { data: plansData } = await supabase
          .from('meal_plans')
          .select('id, nome, start_date, end_date')
          .eq('client_id', clientId);

        impostaPiani(plansData || []);

        // 5. Cibi per il form
        const { data: foodsData } = await supabase
          .from('foods')
          .select('id, nome, calorie, proteine, carboidrati, grassi')
          .limit(100);
        impostaCibiDisponibili(foodsData || []);

      } catch (err) {
        console.error('Errore nel caricamento dei dati clinici:', err);
      } finally {
        impostaInCaricamento(false);
      }
    }

    caricaTutto();
  }, [clientId]);

  // Calcolo BMR/TDEE Live in base agli input dello schermo
  useEffect(() => {
    if (!cliente) return;
    const pesoCorrente = misurazioni.length > 0 ? misurazioni[misurazioni.length - 1].weight : cliente.weight;
    const bmr = calcolaMetabolismoBasale(pesoCorrente, cliente.height, parseInt(eta) || 30, genere, 'mifflin-st-jeor');
    const tdee = calcolaTDEE(bmr, attivita);
    impostaBmrCalcolato(bmr);
    impostaTdeeCalcolato(tdee);
  }, [cliente, misurazioni, genere, eta, attivita]);

  // Gestione aggiunta cibo temporaneo nel form del piano alimentare
  const aggiungiCiboAlPiano = (cibo: FoodItemDB) => {
    const grammiVal = parseFloat(pesoGrammi) || 100;
    const calcolate = Math.round((cibo.calorie * grammiVal) / 100);

    const pastoCorrente = giorniPiano[selezionaGiorno] || [];
    const pastoEsistenteIndex = pastoCorrente.findIndex((p) => p.pasto === selezionaPasto);

    const nuovoCibo = {
      id_cibo: cibo.id,
      nome: cibo.nome,
      grammi: grammiVal,
      cal: calcolate,
    };

    if (pastoEsistenteIndex > -1) {
      pastoCorrente[pastoEsistenteIndex].cibi.push(nuovoCibo);
    } else {
      pastoCorrente.push({
        pasto: selezionaPasto,
        cibi: [nuovoCibo],
      });
    }

    impostaGiorniPiano({
      ...giorniPiano,
      [selezionaGiorno]: [...pastoCorrente],
    });
  };

  const rimuoviCiboDalPiano = (giorno: string, pastoNome: string, ciboIndex: number) => {
    const pastoCorrente = giorniPiano[giorno] || [];
    const pastoIndex = pastoCorrente.findIndex((p) => p.pasto === pastoNome);
    if (pastoIndex === -1) return;

    pastoCorrente[pastoIndex].cibi.splice(ciboIndex, 1);
    if (pastoCorrente[pastoIndex].cibi.length === 0) {
      pastoCorrente.splice(pastoIndex, 1);
    }

    impostaGiorniPiano({
      ...giorniPiano,
      [giorno]: [...pastoCorrente],
    });
  };

  // Salvataggio effettivo del piano nel DB Supabase
  const salvaNuovoPiano = async () => {
    if (!nomePiano) return alert('Inserisci il nome del piano');
    try {
      // 1. Inserisco il record in meal_plans
      const { data: mpData, error: mpErr } = await (supabase.from('meal_plans') as any)
        .insert({
          client_id: clientId,
          nome: nomePiano,
          start_date: dataInizio || null,
          end_date: dataFine || null,
        })
        .select()
        .single();

      if (mpErr) throw mpErr;

      // 2. Ciclo sui giorni inseriti
      for (const giorno of Object.keys(giorniPiano)) {
        const { data: dayData, error: dayErr } = await (supabase.from('meal_plan_days') as any)
          .insert({
            meal_plan_id: mpData.id,
            etichetta_giorno: giorno,
          })
          .select()
          .single();

        if (dayErr) throw dayErr;

        // 3. Ciclo sui pasti
        const pasti = giorniPiano[giorno];
        for (let i = 0; i < pasti.length; i++) {
          const pasto = pasti[i];
          const { data: mealData, error: mealErr } = await (supabase.from('meals') as any)
            .insert({
              meal_plan_day_id: dayData.id,
              nome: pasto.pasto,
              ordine: i,
            })
            .select()
            .single();

          if (mealErr) throw mealErr;

          // 4. Ciclo sui singoli cibi
          for (const cibo of pasto.cibi) {
            const { error: itemErr } = await (supabase.from('meal_items') as any)
              .insert({
                meal_id: mealData.id,
                food_id: cibo.id_cibo,
                quantita_grammi: cibo.grammi,
              });
            if (itemErr) throw itemErr;
          }
        }
      }

      alert('Piano Alimentare salvato con successo!');
      impostaCreazionePiano(false);
      impostaNomePiano('');
      impostaGiorniPiano({});
      // Ricarico i piani alimentari
      const { data: plansData } = await supabase
        .from('meal_plans')
        .select('id, nome, start_date, end_date')
        .eq('client_id', clientId);
      impostaPiani(plansData || []);
    } catch (err) {
      console.error(err);
      alert('Si è verificato un errore nel salvataggio.');
    }
  };

  if (inCaricamento) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#16A34A]"></div>
        <span className="text-sm text-[#6B7280]">Caricamento scheda paziente...</span>
      </div>
    );
  }

  if (!cliente) {
    return (
      <Card paddingInterno={24} className="text-center py-10">
        <h3 className="text-lg font-bold text-red-600">Cliente non trovato</h3>
        <Link href="/clienti" className="text-sm text-[#16A34A] underline mt-2 inline-block">
          Torna alla lista clienti
        </Link>
      </Card>
    );
  }

  // Preparo i dati per il grafico del peso
  const datiGraficoPeso = misurazioni.map((m) => ({
    data: new Date(m.measured_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
    peso: m.weight,
  }));

  const cibiFiltrati = cibiDisponibili.filter((c) =>
    c.nome.toLowerCase().includes(cercaCibo.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Back Link */}
      <div>
        <Link href="/clienti" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-all">
          <ArrowLeft size={16} />
          <span>Torna alla lista pazienti</span>
        </Link>
      </div>

      {/* Profilo Paziente - Header Card */}
      <Card paddingInterno={24} className="bg-white border border-[#E5E7EB] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center text-xl font-bold border border-[#16A34A]/20">
            {cliente.profiles?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">{cliente.profiles?.full_name}</h2>
            <span className="text-sm text-[#6B7280] font-medium">{cliente.profiles?.email}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-left sm:text-right">
            <span className="text-xs text-[#6B7280] font-medium block">Altezza</span>
            <span className="text-sm font-bold text-[#111827]">{cliente.height} cm</span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-[#6B7280] font-medium block">Peso Iniziale</span>
            <span className="text-sm font-bold text-[#111827]">{cliente.weight} kg</span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-[#6B7280] font-medium block">Obiettivo</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
              cliente.target === 'lose' ? 'bg-red-50 text-red-600 border border-red-100' :
              cliente.target === 'maintain' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
              'bg-green-50 text-green-600 border border-green-100'
            }`}>
              {cliente.target === 'lose' ? 'Dimagrimento' : cliente.target === 'maintain' ? 'Mantenimento' : 'Aumento Massa'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tab bar */}
      <div className="flex border-b border-[#E5E7EB] gap-2 overflow-x-auto">
        {[
          { key: 'panoramica', label: 'Panoramica Clinica' },
          { key: 'piani', label: 'Piani Alimentari' },
          { key: 'diario', label: 'Diario Alimentare' },
          { key: 'questionari', label: 'Questionari & Note' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              impostaTabAttivo(tab.key as any);
              impostaCreazionePiano(false);
            }}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              tabAttivo === tab.key
                ? 'border-[#16A34A] text-[#16A34A]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenuto delle Tab */}
      <div className="min-h-[400px]">
        {/* TAB 1: PANORAMICA CLINICA */}
        {tabAttivo === 'panoramica' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Peso e Grafico */}
            <Card paddingInterno={24} className="lg:col-span-2 flex flex-col gap-6 bg-white">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Andamento del Peso</h3>
                <p className="text-xs text-[#6B7280]">Storico delle misurazioni registrate dal paziente o studio</p>
              </div>

              <div className="h-64 w-full">
                {datiGraficoPeso.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datiGraficoPeso}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="data" fontSize={11} stroke="#6B7280" tickLine={false} />
                      <YAxis domain={['dataMin - 3', 'dataMax + 3']} fontSize={11} stroke="#6B7280" tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="peso" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border border-dashed border-[#E5E7EB] rounded-xl text-sm text-[#6B7280]">
                    Nessuna misurazione di peso ancora registrata.
                  </div>
                )}
              </div>
            </Card>

            {/* Calcolatore Calorie Smart */}
            <Card paddingInterno={24} className="flex flex-col gap-5 bg-white">
              <div>
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#16A34A]" />
                  <span>Stima Fabbisogno Calorico</span>
                </h3>
                <p className="text-xs text-[#6B7280]">Calcola il metabolismo basale e consumo energetico giornaliero.</p>
              </div>

              {/* Input calcolatore */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#6B7280]">Sesso</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => impostaGenere('male')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                        genere === 'male' ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      Uomo
                    </button>
                    <button
                      onClick={() => impostaGenere('female')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                        genere === 'female' ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      Donna
                    </button>
                  </div>
                </div>

                <Input
                  etichetta="Età del Paziente"
                  valore={eta}
                  onChange={impostaEta}
                  tipo="numero"
                  placeholder="es: 30"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B7280]">Livello di Attività</label>
                  <select
                    value={attivita}
                    onChange={(e) => impostaAttivita(e.target.value as LivelloAttivita)}
                    className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs focus:outline-none focus:border-[#16A34A]"
                  >
                    <option value="sedentary">Sedentario (Ufficio)</option>
                    <option value="lightly_active">Attività Leggera (1-3 gg/sett)</option>
                    <option value="moderately_active">Attività Moderata (3-5 gg/sett)</option>
                    <option value="very_active">Attivo (6-7 gg/sett)</option>
                    <option value="extremely_active">Atleta Professionista</option>
                  </select>
                </div>
              </div>

              {/* Risultati Calcolo */}
              {bmrCalcolato && tdeeCalcolato && (
                <div className="mt-2 p-4 bg-[#F4FBF7] border border-[#DCFCE7] rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm font-semibold text-[#374151]">
                    <span>Metabolismo Basale (BMR):</span>
                    <span className="font-extrabold text-[#15803D]">{bmrCalcolato} kcal</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-[#374151] pt-2 border-t border-[#DCFCE7]">
                    <span>Fabbisogno (TDEE):</span>
                    <span className="font-extrabold text-[#15803D]">{tdeeCalcolato} kcal</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: PIANI ALIMENTARI */}
        {tabAttivo === 'piani' && (
          <div className="flex flex-col gap-6">
            {!creazionePiano ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-[#111827]">Piani Alimentari Creati</h3>
                  <Button
                    testo="Crea Nuovo Piano"
                    variante="primario"
                    className="flex items-center gap-2"
                    onClick={() => impostaCreazionePiano(true)}
                  >
                    <Plus size={16} />
                    <span>Crea Nuovo Piano</span>
                  </Button>
                </div>

                {piani.length === 0 ? (
                  <Card paddingInterno={48} className="text-center bg-white border border-dashed border-[#E5E7EB]">
                    <p className="text-sm text-[#6B7280]">Nessun piano alimentare ancora configurato per questo paziente.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {piani.map((p) => (
                      <Card key={p.id} paddingInterno={20} className="bg-white flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-[#111827] text-base">{p.nome}</h4>
                          <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1">
                            <Calendar size={14} />
                            {p.start_date ? new Date(p.start_date).toLocaleDateString('it-IT') : 'Subito'} - {p.end_date ? new Date(p.end_date).toLocaleDateString('it-IT') : 'N/D'}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* BUILDER NUOVO PIANO ALIMENTARE */
              <Card paddingInterno={24} className="bg-white flex flex-col gap-6 border border-[#E5E7EB]">
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Nuovo Piano Alimentare</h3>
                  <p className="text-xs text-[#6B7280]">Configura pasti e alimenti personalizzati per il tuo paziente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input etichetta="Nome del Piano" valore={nomePiano} onChange={impostaNomePiano} placeholder="es: Dieta Iperproteica Autunno" />
                  <Input etichetta="Data Inizio" valore={dataInizio} onChange={impostaDataInizio} tipo="testo" placeholder="AAAA-MM-GG" />
                  <Input etichetta="Data Fine" valore={dataFine} onChange={impostaDataFine} tipo="testo" placeholder="AAAA-MM-GG" />
                </div>

                {/* Form Selettore Alimento */}
                <div className="border-t border-[#F3F4F6] pt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ricerca e Inserimento */}
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block">1. Aggiungi Alimento</span>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#6B7280]">Giorno</label>
                      <select
                        value={selezionaGiorno}
                        onChange={(e) => impostaSelezionaGiorno(e.target.value)}
                        className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="lunedi">Lunedì</option>
                        <option value="martedi">Martedì</option>
                        <option value="mercoledi">Mercoledì</option>
                        <option value="giovedi">Giovedì</option>
                        <option value="venerdi">Venerdì</option>
                        <option value="sabato">Sabato</option>
                        <option value="domenica">Domenica</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#6B7280]">Pasto</label>
                      <select
                        value={selezionaPasto}
                        onChange={(e) => impostaSelezionaPasto(e.target.value)}
                        className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="Colazione">Colazione</option>
                        <option value="Pranzo">Pranzo</option>
                        <option value="Cena">Cena</option>
                        <option value="Spuntino">Spuntino</option>
                      </select>
                    </div>

                    <Input etichetta="Grammi" valore={pesoGrammi} onChange={impostaPesoGrammi} tipo="numero" placeholder="100" />

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[#6B7280]">Cerca Cibo</label>
                      <input
                        type="text"
                        placeholder="Filtra cibi dal database..."
                        value={cercaCibo}
                        onChange={(e) => impostaCercaCibo(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-xs focus:outline-none"
                      />
                      <div className="max-h-40 overflow-y-auto border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                        {cibiFiltrati.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => aggiungiCiboAlPiano(c)}
                            className="p-2 text-xs hover:bg-[#F9FAFB] cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-semibold text-[#374151]">{c.nome}</span>
                            <span className="text-[10px] text-[#6B7280]">{c.calorie} kcal/100g</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Anteprima Piano Nutrizionale Corrente */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block">2. Anteprima Giorni</span>
                    <div className="border border-[#E5E7EB] rounded-xl p-4 divide-y divide-[#F3F4F6] max-h-96 overflow-y-auto bg-gray-50">
                      {['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'].map((g) => {
                        const pastiGiorno = giorniPiano[g] || [];
                        if (pastiGiorno.length === 0) return null;
                        return (
                          <div key={g} className="py-3 first:pt-0 last:pb-0">
                            <span className="text-xs font-extrabold text-[#16A34A] capitalize block mb-2">{g}</span>
                            <div className="flex flex-col gap-2.5">
                              {pastiGiorno.map((p) => (
                                <div key={p.pasto} className="pl-3 border-l-2 border-gray-200">
                                  <span className="text-xs font-bold text-[#374151] block mb-1">{p.pasto}</span>
                                  <div className="flex flex-col gap-1.5">
                                    {p.cibi.map((c, i) => (
                                      <div key={i} className="flex justify-between items-center text-xs text-[#4B5563]">
                                        <span>{c.nome} ({c.grammi}g)</span>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-700">{c.cal} kcal</span>
                                          <button
                                            type="button"
                                            onClick={() => rimuoviCiboDalPiano(g, p.pasto, i)}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(giorniPiano).length === 0 && (
                        <p className="text-center text-xs text-[#9CA3AF] py-10 italic">Nessun alimento ancora aggiunto al piano. Seleziona un cibo a sinistra per iniziare.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Builder */}
                <div className="flex justify-end gap-3 border-t border-[#F3F4F6] pt-4">
                  <Button
                    testo="Annulla"
                    type="button"
                    variante="outline"
                    onClick={() => impostaCreazionePiano(false)}
                  />
                  <Button
                    testo="Salva Piano"
                    type="button"
                    variante="primario"
                    onClick={salvaNuovoPiano}
                    disabilitato={Object.keys(giorniPiano).length === 0}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: DIARIO ALIMENTARE */}
        {tabAttivo === 'diario' && (
          <div className="flex flex-col gap-4 bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div>
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <BookOpen size={18} className="text-[#16A34A]" />
                <span>Diario Alimentare Paziente</span>
              </h3>
              <p className="text-xs text-[#6B7280]">{"Logs inviati quotidianamente dal paziente dall'app mobile."}</p>
            </div>

            {diario.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#6B7280] italic">
                Nessun pasto registrato nel diario dal paziente.
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                {/* Raggruppo il diario per data */}
                {Array.from(new Set(diario.map((d) => d.logged_at))).map((dataStr) => {
                  const logsDellaGiornata = diario.filter((d) => d.logged_at === dataStr);
                  const totaliCalorie = logsDellaGiornata.reduce((acc, curr) => acc + curr.calorie, 0);

                  return (
                    <div key={dataStr} className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-2">
                        <span className="text-sm font-bold text-[#111827] flex items-center gap-2">
                          <Calendar size={16} className="text-[#16A34A]" />
                          {new Date(dataStr).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                          {totaliCalorie} kcal totali
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {['colazione', 'pranzo', 'cena', 'spuntino'].map((pastoNome) => {
                          const logsPasto = logsDellaGiornata.filter((l) => l.pasto === pastoNome);
                          return (
                            <div key={pastoNome} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-2">
                              <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider capitalize">{pastoNome}</span>
                              <div className="flex flex-col gap-1.5">
                                {logsPasto.length === 0 ? (
                                  <span className="text-[11px] text-[#9CA3AF] italic">Nessun cibo loggato</span>
                                ) : (
                                  logsPasto.map((log) => (
                                    <div key={log.id} className="text-xs text-[#374151]">
                                      <span className="font-semibold block">{log.nome_alimento}</span>
                                      <span className="text-[10px] text-[#6B7280]">{log.quantita_grammi}g · {log.calorie} kcal</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUESTIONARI & NOTE */}
        {tabAttivo === 'questionari' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card paddingInterno={24} className="md:col-span-2 flex flex-col gap-4 bg-white border border-[#E5E7EB]">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Questionari di Feedback</h3>
                <p className="text-xs text-[#6B7280]">Visualizza le risposte fornite dal paziente per valutare aderenza ed energia.</p>
              </div>

              <div className="text-center py-12 text-sm text-[#6B7280] border border-dashed border-[#E5E7EB] rounded-xl italic">
                Nessun questionario sottomesso da questo cliente.
              </div>
            </Card>

            <Card paddingInterno={24} className="flex flex-col gap-4 bg-white border border-[#E5E7EB]">
              <div>
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <PieChart size={18} className="text-[#16A34A]" />
                  <span>Note Cliniche</span>
                </h3>
                <p className="text-xs text-[#6B7280]">Memo e appunti del nutrizionista non visibili al paziente.</p>
              </div>

              <textarea
                placeholder="Aggiungi appunti clinici su questo paziente (es: allergie, preferenze, infortuni...)"
                rows={8}
                className="w-full p-3 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all resize-none"
              />
              <Button testo="Salva Note" variante="outline" className="w-full text-xs" />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
