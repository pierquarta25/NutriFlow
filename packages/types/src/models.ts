// Definizioni dei modelli di business per l'applicazione NutriFlow.
// Vengono usati sia nel web che nel mobile per garantire la consistenza dei dati.

export interface Profile {
  // Identificativo dell'utente
  id: string;
  // Email dell'utente
  email: string;
  // Nome completo dell'utente
  fullName: string;
  // Ruolo dell'utente (nutrizionista o cliente)
  role: 'nutritionist' | 'client';
  // URL dell'avatar
  avatarUrl?: string;
}

export interface Client {
  // Identificativo univoco del cliente (uguale all'id del profilo)
  id: string;
  // Nome completo recuperato dal profilo
  nome: string;
  // Email recuperata dal profilo
  email: string;
  // ID del nutrizionista associato
  nutritionistId: string;
  // Altezza in centimetri
  height?: number;
  // Peso attuale in chilogrammi
  weight?: number;
  // Obiettivo (Dimagrire, Mantenere, Aumentare massa)
  target?: 'lose' | 'maintain' | 'gain';
  // URL dell'immagine del profilo
  avatarUrl?: string;
}

export interface Food {
  // ID univoco del cibo
  id: string;
  // Nome dell'alimento (es. "Pasta di semola")
  nome: string;
  // Produttore o marca dell'alimento
  marca?: string;
  // Calorie per 100 grammi di prodotto
  calorie: number;
  // Quantità di proteine in grammi per 100g
  proteine: number;
  // Quantità di carboidrati in grammi per 100g
  carboidrati: number;
  // Quantità di grassi in grammi per 100g
  grassi: number;
  // Flag che indica se il cibo è custom
  isCustom: boolean;
}

export interface MealItem {
  // ID della riga del pasto
  id: string;
  // Quantità in grammi prescritta
  quantitaGrammi: number;
  // Dettaglio alimento associato
  food: Food;
}

export interface Meal {
  // ID univoco del pasto
  id: string;
  // Nome del pasto (es. Colazione, Pranzo)
  nome: string;
  // Ordine di visualizzazione del pasto nella giornata (es. 1, 2, 3...)
  ordine: number;
  // Lista degli alimenti che compongono il pasto
  mealItems: MealItem[];
}

export interface MealPlanDay {
  // ID della giornata del piano
  id: string;
  // Giorno della settimana (es. "lunedi", "martedi"...)
  etichettaGiorno: string;
  // Lista dei pasti previsti per questo giorno
  meals: Meal[];
}

export interface MealPlan {
  // ID univoco del piano alimentare
  id: string;
  // Nome descrittivo del piano (es. "Piano Ipercalorico Definizione")
  nome: string;
  // Data di inizio validità del piano
  startDate?: string;
  // Data di fine validità del piano
  endDate?: string;
  // Le giornate che compongono questo piano alimentare
  days?: MealPlanDay[];
}

export interface FoodLog {
  // ID univoco del log cibo
  id: string;
  // ID del cliente che ha registrato il cibo
  clientId: string;
  // ID del cibo (opzionale se inserito a mano libera)
  foodId?: string;
  // Nome dell'alimento inserito
  nomeAlimento: string;
  // Peso in grammi inserito dall'utente
  quantitaGrammi: number;
  // Calorie totali calcolate per questa porzione
  calorie: number;
  // Proteine totali calcolate per questa porzione
  proteine: number;
  // Carboidrati totali calcolate per questa porzione
  carboidrati: number;
  // Grassi totali calcolate per questa porzione
  grassi: number;
  // Tipo di pasto
  pasto: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  // Data della registrazione (formato YYYY-MM-DD o timestamp)
  loggedAt: string;
}

export interface ClientMetric {
  // ID univoco della misurazione
  id: string;
  // ID del cliente associato
  clientId: string;
  // Peso registrato in kg
  weight: number;
  // Misura del torace (opzionale)
  chest?: number;
  // Misura della vita in cm (opzionale)
  waist?: number;
  // Misura dei fianchi in cm (opzionale)
  hips?: number;
  // Misura del braccio sinistro in cm (opzionale)
  armLeft?: number;
  // Misura del braccio destro in cm (opzionale)
  armRight?: number;
  // Data in cui è stata presa la misurazione
  measuredAt: string;
}
