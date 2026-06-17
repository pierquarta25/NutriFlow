'use client';

// Pagina di gestione degli alimenti.
// Permette al nutrizionista di visualizzare il database locale, creare cibi personalizzati,
// e cercare/importare cibi da Open Food Facts usando l'Edge Function "importa-alimenti".

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { Button, Card, Input } from '@nutriflow/ui';
import { Search, Plus, Info, Globe, Sparkles, PlusCircle } from 'lucide-react';

interface FoodItem {
  id?: string;
  nome: string;
  marca: string | null;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  is_custom: boolean;
  created_by?: string | null;
}

export default function PaginaAlimenti() {
  const [alimentiLocale, impostaAlimentiLocale] = useState<FoodItem[]>([]);
  const [inCaricamento, impostaInCaricamento] = useState(true);
  const [ricercaLocal, impostaRicercaLocal] = useState('');
  const [cercaOff, impostaCercaOff] = useState('');
  const [risultatiOff, impostaRisultatiOff] = useState<FoodItem[]>([]);
  const [caricamentoOff, setCaricamentoOff] = useState(false);

  // Stato form inserimento manuale
  const [formAttivo, impostaFormAttivo] = useState(false);
  const [nomeForm, impostaNomeForm] = useState('');
  const [marcaForm, impostaMarcaForm] = useState('');
  const [calForm, impostaCalForm] = useState('');
  const [protForm, impostaProtForm] = useState('');
  const [carbForm, impostaCarbForm] = useState('');
  const [grassiForm, impostaGrassiForm] = useState('');
  const [erroreForm, impostaErroreForm] = useState<string | null>(null);

  // Carico gli alimenti del database locale (condivisi o creati da questo utente)
  const caricaAlimentiLocali = async () => {
    try {
      impostaInCaricamento(true);
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      impostaAlimentiLocale(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      impostaInCaricamento(false);
    }
  };

  useEffect(() => {
    caricaAlimentiLocali();
  }, []);

  // Cerca alimenti online tramite la nostra Edge Function
  const cercaSuOpenFoodFacts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cercaOff.trim()) return;

    setCaricamentoOff(true);
    impostaRisultatiOff([]);

    try {
      // Facciamo una chiamata fetch diretta all'endpoint dell'Edge Function

      const projectRef = 'oowopbugjepysflusshm';
      const response = await fetch(
        `https://${projectRef}.supabase.co/functions/v1/importa-alimenti?query=${encodeURIComponent(cercaOff.trim())}`
      );
      const resData = await response.json();

      if (resData && resData.success) {
        impostaRisultatiOff(resData.data || []);
      } else {
        alert("Nessun alimento trovato online.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore durante la ricerca online. Verifica che la funzione sia attiva.");
    } finally {
      setCaricamentoOff(false);
    }
  };

  // Salva un alimento (sia manuale che importato da Open Food Facts) nel database locale
  const salvaAlimentoNelDB = async (item: FoodItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert('Sessione scaduta, effettua nuovamente l\'accesso.');

      const { error } = await (supabase.from('foods') as any)
        .insert({
          nome: item.nome,
          marca: item.marca || 'Generico',
          calorie: item.calorie,
          proteine: item.proteine,
          carboidrati: item.carboidrati,
          grassi: item.grassi,
          is_custom: true,
          created_by: user.id,
        });

      if (error) throw error;

      alert(`"${item.nome}" aggiunto al tuo database!`);
      caricaAlimentiLocali();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Errore nel salvataggio dell\'alimento.');
    }
  };

  // Creazione manuale tramite Form
  const gestisciCreazioneManuale = async (e: React.FormEvent) => {
    e.preventDefault();
    impostaErroreForm(null);

    if (!nomeForm || !calForm || !protForm || !carbForm || !grassiForm) {
      impostaErroreForm('Compila tutti i campi nutrizionali.');
      return;
    }

    const calorie = parseFloat(calForm);
    const proteine = parseFloat(protForm);
    const carboidrati = parseFloat(carbForm);
    const grassi = parseFloat(grassiForm);

    if (isNaN(calorie) || isNaN(proteine) || isNaN(carboidrati) || isNaN(grassi)) {
      impostaErroreForm('I valori nutrizionali devono essere numeri validi.');
      return;
    }

    const nuovoAlimento: FoodItem = {
      nome: nomeForm.trim(),
      marca: marcaForm.trim() || 'Generico',
      calorie,
      proteine,
      carboidrati,
      grassi,
      is_custom: true,
    };

    await salvaAlimentoNelDB(nuovoAlimento);

    // Resetto il form
    impostaNomeForm('');
    impostaMarcaForm('');
    impostaCalForm('');
    impostaProtForm('');
    impostaCarbForm('');
    impostaGrassiForm('');
    impostaFormAttivo(false);
  };

  // Filtro la lista locale
  const alimentiLocaliFiltrati = alimentiLocale.filter((a) =>
    a.nome.toLowerCase().includes(ricercaLocal.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Intestazione */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Database Alimenti</h2>
          <p className="text-sm text-[#6B7280]">
            Cerca nel database locale, inserisci nuovi cibi o importali direttamente da Open Food Facts.
          </p>
        </div>
        <Button
          testo={formAttivo ? "Chiudi Form" : "Nuovo Alimento"}
          variante={formAttivo ? "outline" : "primario"}
          onClick={() => impostaFormAttivo(!formAttivo)}
          className="flex items-center gap-2"
        />
      </div>

      {/* Form Creazione Manuale */}
      {formAttivo && (
        <Card paddingInterno={24} className="bg-white border border-[#E5E7EB] shadow-md max-w-2xl">
          <form onSubmit={gestisciCreazioneManuale} className="flex flex-col gap-5">
            <h3 className="text-sm font-bold text-[#111827] border-b border-[#F3F4F6] pb-2">
              Inserisci Alimento Personalizzato (Valori riferiti a 100g)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input etichetta="Nome Alimento" valore={nomeForm} onChange={impostaNomeForm} placeholder="es: Riso Basmati Integrale" />
              <Input etichetta="Marca / Produttore" valore={marcaForm} onChange={impostaMarcaForm} placeholder="es: Generico" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input etichetta="Calorie (kcal)" valore={calForm} onChange={impostaCalForm} tipo="numero" placeholder="350" />
              <Input etichetta="Proteine (g)" valore={protForm} onChange={impostaProtForm} tipo="numero" placeholder="8" />
              <Input etichetta="Carboidrati (g)" valore={carbForm} onChange={impostaCarbForm} tipo="numero" placeholder="78" />
              <Input etichetta="Grassi (g)" valore={grassiForm} onChange={impostaGrassiForm} tipo="numero" placeholder="1.2" />
            </div>

            {erroreForm && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg text-center">
                {erroreForm}
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <Button testo="Annulla" type="button" variante="outline" onClick={() => impostaFormAttivo(false)} />
              <Button testo="Aggiungi al DB" type="submit" variante="primario" />
            </div>
          </form>
        </Card>
      )}

      {/* Sezione di ricerca e split (Locale vs Online) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonna 1: Database Locale */}
        <Card paddingInterno={24} className="bg-white border border-[#E5E7EB] flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-[#111827]">Il tuo Database</h3>
            <p className="text-xs text-[#6B7280]">Alimenti già pronti per essere inseriti nei piani alimentari.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
            <input
              type="text"
              placeholder="Cerca cibi nel tuo DB..."
              value={ricercaLocal}
              onChange={(e) => impostaRicercaLocal(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#16A34A] transition-all"
            />
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[#F3F4F6] pr-1">
            {inCaricamento ? (
              <div className="text-center py-10 text-xs text-[#6B7280]">Caricamento...</div>
            ) : alimentiLocaliFiltrati.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#6B7280] italic">Nessun alimento trovato.</div>
            ) : (
              alimentiLocaliFiltrati.map((a) => (
                <div key={a.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#374151] block">{a.nome}</span>
                    <span className="text-[10px] text-[#6B7280]">{a.marca} · {a.calorie} kcal/100g</span>
                  </div>
                  <div className="flex gap-3 text-[10px] font-semibold text-[#4B5563]">
                    <span className="text-red-600">P: {a.proteine}g</span>
                    <span className="text-blue-600">C: {a.carboidrati}g</span>
                    <span className="text-green-600">G: {a.grassi}g</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Colonna 2: Ricerca Online / Importazione */}
        <Card paddingInterno={24} className="bg-white border border-[#E5E7EB] flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-1.5">
              <Globe size={18} className="text-[#16A34A]" />
              <span>Importa da Open Food Facts</span>
            </h3>
            <p className="text-xs text-[#6B7280]">Cerca cibi nel database pubblico italiano e salvali localmente in un click.</p>
          </div>

          <form onSubmit={cercaSuOpenFoodFacts} className="flex gap-2">
            <input
              type="text"
              placeholder="es: Tonno all'olio, Fette biscottate..."
              value={cercaOff}
              onChange={(e) => impostaCercaOff(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#16A34A] transition-all"
            />
            <Button
              testo={caricamentoOff ? "Ricerca..." : "Cerca Online"}
              type="submit"
              variante="secondario"
              disabilitato={caricamentoOff}
              className="text-xs h-10 shrink-0"
            />
          </form>

          <div className="max-h-96 overflow-y-auto divide-y divide-[#F3F4F6] pr-1">
            {caricamentoOff ? (
              <div className="text-center py-10 flex flex-col gap-2 items-center justify-center text-xs text-[#6B7280]">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#16A34A]"></div>
                <span>Interrogazione database in corso...</span>
              </div>
            ) : risultatiOff.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#6B7280] italic">
                Usa la barra sopra per cercare online gli alimenti.
              </div>
            ) : (
              risultatiOff.map((r, index) => (
                <div key={index} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#374151] block">{r.nome}</span>
                    <span className="text-[10px] text-[#6B7280]">{r.marca} · {r.calorie} kcal/100g</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2 text-[10px] font-semibold text-[#4B5563]">
                      <span>P: {r.proteine}g</span>
                      <span>C: {r.carboidrati}g</span>
                      <span>G: {r.grassi}g</span>
                    </div>
                    <button
                      onClick={() => salvaAlimentoNelDB(r)}
                      className="p-1 text-[#16A34A] hover:bg-[#DCFCE7] rounded-lg transition-colors"
                      title="Aggiungi al tuo Database"
                    >
                      <PlusCircle size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
