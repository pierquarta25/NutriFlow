// Configurazione del database locale persistente per la modalità offline.
// Utilizzo @legendapp/state con AsyncStorage per memorizzare i dati sul dispositivo
// ed eseguire letture/scritture anche in assenza di connessione.

import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealPlan, Food, ClientMetric, FoodLog } from '@nutriflow/types';

// Interfaccia per la struttura dei dati salvati localmente sul dispositivo
export interface StatoDatabaseLocale {
  // Il piano alimentare completo sincronizzato
  pianoAlimentare: MealPlan | null;
  // Il database completo degli alimenti base
  alimenti: Food[];
  // Lo storico delle misurazioni fisiche del cliente
  misurazioni: ClientMetric[];
  // Il diario alimentare (i log dei pasti inseriti dall'utente)
  diarioAlimentare: FoodLog[];
  // Coda delle modifiche effettuate offline da inviare al server appena torna online
  codaModificheOffline: Array<{
    tabella: 'client_metrics' | 'food_logs' | 'clients';
    tipoOperazione: 'INSERT' | 'UPDATE' | 'DELETE';
    dati: any;
    idLocale: string;
  }>;
}

// Configuro la persistenza globale di Legend State per usare AsyncStorage
persistObservable(AsyncStorage, {
  // Configuro la modalità di caricamento dei dati
  adjustSavedData: (data) => data,
});

// Inizializzo l'observable per il database locale con valori iniziali vuoti
export const databaseLocale$ = observable<StatoDatabaseLocale>({
  pianoAlimentare: null,
  alimenti: [],
  misurazioni: [],
  diarioAlimentare: [],
  codaModificheOffline: [],
});

// Attivo la sincronizzazione automatica persistente dell'observable con la chiave 'nutriflow_local_db'
persistObservable(databaseLocale$, {
  local: 'nutriflow_local_db',
  pluginLocal: ObservablePersistAsyncStorage,
});

// =========================================================================
// FUNZIONI DI LETTURA LOCALE (USATE QUANDO L'APP È OFFLINE)
// =========================================================================

// Leggo il piano alimentare memorizzato sul dispositivo.
export function ottieniPianoLocale(): MealPlan | null {
  // Ritorno il valore corrente contenuto nell'observable
  return databaseLocale$.pianoAlimentare.get();
}

// Leggo la lista di tutti gli alimenti memorizzati localmente.
export function ottieniAlimentiLocali(): Food[] {
  // Ritorno l'array degli alimenti
  return databaseLocale$.alimenti.get() || [];
}

// Leggo lo storico completo delle misurazioni del peso.
export function ottieniMisurazioniLocali(): ClientMetric[] {
  // Ritorno l'elenco delle misurazioni
  return databaseLocale$.misurazioni.get() || [];
}

// Leggo il diario dei cibi registrati per un giorno specifico.
export function ottieniDiarioLocale(dataGiorno: string): FoodLog[] {
  const tuttiILog = databaseLocale$.diarioAlimentare.get() || [];
  
  // Filtro i log dei pasti mantenendo solo quelli del giorno richiesto
  return tuttiILog.filter((log) => {
    // Verifico se la data del log corrisponde a quella selezionata
    return log.loggedAt.startsWith(dataGiorno);
  });
}

// =========================================================================
// FUNZIONI DI SCRITTURA LOCALE (SALVANO SUBITO ED INSERISCONO NELLA CODA SYNC)
// =========================================================================

// Salvo una nuova misurazione corporea in locale.
export function aggiungiMisurazioneLocale(misurazione: ClientMetric): void {
  // Aggiungo la misurazione all'inizio dell'elenco locale
  databaseLocale$.misurazioni.unshift(misurazione);

  // Aggiungo l'azione alla coda di sincronizzazione per il server Supabase
  databaseLocale$.codaModificheOffline.push({
    tabella: 'client_metrics',
    tipoOperazione: 'INSERT',
    dati: misurazione,
    idLocale: misurazione.id,
  });
}

// Salvo una nuova voce nel diario alimentare locale.
export function aggiungiLogCiboLocale(logCibo: FoodLog): void {
  // Aggiungo il pasto registrato all'inizio del diario locale
  databaseLocale$.diarioAlimentare.unshift(logCibo);

  // Aggiungo l'inserimento alla coda per il sync futuro
  databaseLocale$.codaModificheOffline.push({
    tabella: 'food_logs',
    tipoOperazione: 'INSERT',
    dati: logCibo,
    idLocale: logCibo.id,
  });
}

// Aggiorno i dati personali del profilo in locale.
export function aggiornaProfiloLocale(datiProfilo: {
  height?: number;
  weight?: number;
  target?: 'lose' | 'maintain' | 'gain';
}): void {
  // Recupero la coda corrente ed aggiungo la modifica del profilo
  databaseLocale$.codaModificheOffline.push({
    tabella: 'clients',
    tipoOperazione: 'UPDATE',
    dati: datiProfilo,
    idLocale: 'profilo_utente',
  });
}
