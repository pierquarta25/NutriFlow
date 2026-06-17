// Questo file contiene la definizione dei tipi del database generati (o modellati) per Supabase.
// I commenti in italiano spiegano la struttura di ogni tabella per facilitare la comprensione.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // Identificativo univoco (UUID di Supabase Auth)
          email: string; // Indirizzo email dell'utente
          full_name: string; // Nome e cognome dell'utente
          role: 'nutritionist' | 'client'; // Ruolo nel sistema: nutrizionista o cliente
          avatar_url: string | null; // URL dell'avatar/foto profilo
          created_at: string; // Data e ora di creazione
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      clients: {
        Row: {
          id: string; // UUID del profilo cliente
          nutritionist_id: string; // UUID del nutrizionista di riferimento
          height: number | null; // Altezza in cm
          weight: number | null; // Peso attuale in kg
          target: 'lose' | 'maintain' | 'gain' | null; // Obiettivo del cliente
          avatar_url: string | null; // URL foto profilo
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Row']>;
      };
      foods: {
        Row: {
          id: string; // Identificativo cibo
          nome: string; // Nome dell'alimento
          marca: string | null; // Marca dell'alimento (es. Barilla)
          calorie: number; // Kcal per 100g
          proteine: number; // Proteine per 100g
          carboidrati: number; // Carboidrati per 100g
          grassi: number; // Grassi per 100g
          is_custom: boolean; // Indica se è stato creato custom da un nutrizionista
          created_by: string | null; // Eventuale nutrizionista che ha creato il cibo
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['foods']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['foods']['Row']>;
      };
      meal_plans: {
        Row: {
          id: string;
          client_id: string;
          nome: string;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['meal_plans']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['meal_plans']['Row']>;
      };
      meal_plan_days: {
        Row: {
          id: string;
          meal_plan_id: string;
          etichetta_giorno: string; // 'lunedi', 'martedi', ecc.
        };
        Insert: Omit<Database['public']['Tables']['meal_plan_days']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['meal_plan_days']['Row']>;
      };
      meals: {
        Row: {
          id: string;
          meal_plan_day_id: string;
          nome: string; // 'Colazione', 'Pranzo', ecc.
          ordine: number; // Ordinamento nella giornata (1 per colazione, 2 per spuntino...)
        };
        Insert: Omit<Database['public']['Tables']['meals']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['meals']['Row']>;
      };
      meal_items: {
        Row: {
          id: string;
          meal_id: string;
          food_id: string;
          quantita_grammi: number; // Quantità in grammi prescritta
        };
        Insert: Omit<Database['public']['Tables']['meal_items']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['meal_items']['Row']>;
      };
      food_logs: {
        Row: {
          id: string;
          client_id: string;
          food_id: string | null;
          nome_alimento: string; // Nome al momento del log
          quantita_grammi: number;
          calorie: number; // Calorie effettivamente calcolate per la porzione
          proteine: number;
          carboidrati: number;
          grassi: number;
          pasto: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
          logged_at: string; // Data di log (formato YYYY-MM-DD o timestamp)
        };
        Insert: Omit<Database['public']['Tables']['food_logs']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['food_logs']['Row']>;
      };
      client_metrics: {
        Row: {
          id: string;
          client_id: string;
          weight: number;
          chest: number | null;
          waist: number | null; // Vita in cm
          hips: number | null; // Fianchi in cm
          arm_left: number | null; // Braccio sinistro in cm
          arm_right: number | null; // Braccio destro in cm
          measured_at: string; // Data della misurazione
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['client_metrics']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['client_metrics']['Row']>;
      };
    };
  };
}
