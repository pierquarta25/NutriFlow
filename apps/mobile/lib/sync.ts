// Logica di sincronizzazione bidirezionale tra Supabase (cloud) e database locale.
// Si occupa di scaricare gli ultimi dati del cliente e caricare le modifiche offline.

import { supabase } from './supabase';
import { databaseLocale$ } from './database-locale';
import { MealPlan, Food, ClientMetric, FoodLog } from '@nutriflow/types';

// Scarico tutti i dati da Supabase e li salvo nell'observable locale del dispositivo.
export async function sincronizzaDaSupabaseALocale(
  clienteId: string
): Promise<boolean> {
  try {
    // 1. Scarico il piano alimentare attivo
    const giornoOggi = new Date()
      .toLocaleDateString('it-IT', { weekday: 'long' })
      .toLowerCase();

    const { data: pianoTrovato, error: errorePiano } = await supabase
      .from('meal_plans')
      .select(`
        id,
        nome,
        meal_plan_days (
          id,
          etichetta_giorno,
          meals (
            id,
            nome,
            ordine,
            meal_items (
              id,
              quantita_grammi,
              foods (id, nome, marca, calorie, proteine, carboidrati, grassi, is_custom)
            )
          )
        )
      `)
      .eq('client_id', clienteId)
      .maybeSingle();

    if (!errorePiano && pianoTrovato) {
      // Trasformo i dati ricevuti nel tipo MealPlan e li salvo localmente
      const pianoFormattato = pianoTrovato as unknown as MealPlan;
      databaseLocale$.pianoAlimentare.set(pianoFormattato);
    }

    // 2. Scarico il database degli alimenti generici
    const { data: cibiTrovati, error: erroreCibi } = await supabase
      .from('foods')
      .select('*')
      .eq('is_custom', false);

    if (!erroreCibi && cibiTrovati) {
      databaseLocale$.alimenti.set(cibiTrovati as unknown as Food[]);
    }

    // 3. Scarico lo storico delle misurazioni corporee
    const { data: metricsTrovate, error: erroreMetrics } = await supabase
      .from('client_metrics')
      .select('*')
      .eq('client_id', clienteId)
      .order('measured_at', { ascending: false });

    if (!erroreMetrics && metricsTrovate) {
      databaseLocale$.misurazioni.set(metricsTrovate as unknown as ClientMetric[]);
    }

    // 4. Scarico il diario dei log alimentari
    const { data: logTrovati, error: erroreLog } = await supabase
      .from('food_logs')
      .select('*')
      .eq('client_id', clienteId)
      .order('logged_at', { ascending: false });

    if (!erroreLog && logTrovati) {
      databaseLocale$.diarioAlimentare.set(logTrovati as unknown as FoodLog[]);
    }

    // Ritorno true per confermare che la sincronizzazione ha avuto successo
    return true;
  } catch (erroreGenerico) {
    console.error('Errore durante la sincronizzazione locale:', erroreGenerico);
    return false;
  }
}

// Invio a Supabase le modifiche accumulate offline e svuoto la coda locale.
export async function sincronizzaModificheLocaliVersoSupabase(
  clienteId: string
): Promise<void> {
  const codaModifiche = databaseLocale$.codaModificheOffline.get() || [];

  // Se la coda è vuota, esco immediatamente
  if (codaModifiche.length === 0) {
    return;
  }

  // Eseguo ogni operazione accumulata una dopo l'altra
  for (const modifica of codaModifiche) {
    try {
      if (modifica.tabella === 'client_metrics' && modifica.tipoOperazione === 'INSERT') {
        // Inserisco la nuova misurazione su Supabase
        const { error } = await supabase.from('client_metrics').insert({
          client_id: clienteId,
          weight: modifica.dati.weight,
          chest: modifica.dati.chest,
          waist: modifica.dati.waist,
          hips: modifica.dati.hips,
          arm_left: modifica.dati.armLeft,
          arm_right: modifica.dati.armRight,
          measured_at: modifica.dati.measuredAt,
        });

        if (error) throw error;
      }

      if (modifica.tabella === 'food_logs' && modifica.tipoOperazione === 'INSERT') {
        // Inserisco il log del pasto su Supabase
        const { error } = await supabase.from('food_logs').insert({
          client_id: clienteId,
          food_id: modifica.dati.foodId,
          nome_alimento: modifica.dati.nomeAlimento,
          quantita_grammi: modifica.dati.quantitaGrammi,
          calorie: modifica.dati.calorie,
          proteine: modifica.dati.proteine,
          carboidrati: modifica.dati.carboidrati,
          grassi: modifica.dati.grassi,
          pasto: modifica.dati.pasto,
          logged_at: modifica.dati.loggedAt,
        });

        if (error) throw error;
      }

      if (modifica.tabella === 'clients' && modifica.tipoOperazione === 'UPDATE') {
        // Aggiorno i dati del profilo del cliente
        const { error } = await supabase
          .from('clients')
          .update({
            height: modifica.dati.height,
            weight: modifica.dati.weight,
            target: modifica.dati.target,
          })
          .eq('id', clienteId);

        if (error) throw error;
      }
    } catch (erroreInvio) {
      // Se l'invio fallisce per questo record, interrompo il loop per riprovare più tardi
      console.error(`Errore nel sincronizzare ${modifica.tabella}:`, erroreInvio);
      return;
    }
  }

  // Se tutte le modifiche sono state salvate con successo, svuoto la coda locale
  databaseLocale$.codaModificheOffline.set([]);
}
