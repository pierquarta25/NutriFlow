-- Migrazione per i piani alimentari.
-- Definisce i piani assegnati ai clienti, suddivisi in giorni, pasti e singoli alimenti.

-- Tabella principale dei piani alimentari
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabella delle giornate del piano (es. lunedì, martedì...)
CREATE TABLE public.meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  etichetta_giorno TEXT NOT NULL CHECK (etichetta_giorno IN ('lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica')),
  UNIQUE(meal_plan_id, etichetta_giorno)
);

-- Tabella dei pasti della giornata (es. colazione, pranzo...)
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id UUID REFERENCES public.meal_plan_days(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  ordine INTEGER NOT NULL CHECK (ordine >= 0)
);

-- Tabella degli alimenti all'interno di ciascun pasto
CREATE TABLE public.meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.foods(id) ON DELETE RESTRICT NOT NULL,
  quantita_grammi NUMERIC NOT NULL CHECK (quantita_grammi > 0)
);

-- Abilito RLS per tutte le tabelle dei piani alimentari
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
