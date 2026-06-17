-- =========================================================================
-- PULIZIA COMPLETA DEL DATABASE (DROP TABLES)
-- =========================================================================
DROP TRIGGER IF EXISTS trigger_creazione_profilo ON auth.users;
DROP FUNCTION IF EXISTS public.gestisci_nuovo_utente() CASCADE;

DROP TABLE IF EXISTS public.questionnaire_submissions CASCADE;
DROP TABLE IF EXISTS public.questionnaires CASCADE;
DROP TABLE IF EXISTS public.client_metrics CASCADE;
DROP TABLE IF EXISTS public.food_logs CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.meal_items CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.meal_plan_days CASCADE;
DROP TABLE IF EXISTS public.meal_plans CASCADE;
DROP TABLE IF EXISTS public.activity_plans CASCADE;
DROP TABLE IF EXISTS public.recipe_items CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.foods CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =========================================================================
-- CREAZIONE TABELLE E STRUTTURE (MIGRAZIONI)
-- =========================================================================
-- Migrazione per la tabella profiles.
-- Questa tabella estende la tabella degli utenti gestita da Supabase Auth.

-- Creo la tabella profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('nutritionist', 'client')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilito RLS (Row Level Security) sulla tabella
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Creo una funzione per gestire la creazione automatica del profilo dopo la registrazione
CREATE OR REPLACE FUNCTION public.gestisci_nuovo_utente()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utente'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associo il trigger alla tabella degli utenti di Supabase Auth
CREATE TRIGGER trigger_creazione_profilo
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.gestisci_nuovo_utente();
-- Migrazione per la tabella clients.
-- Rappresenta i dati specifici dei clienti/pazienti associati ai nutrizionisti.

CREATE TABLE public.clients (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  height NUMERIC CHECK (height > 0),
  weight NUMERIC CHECK (weight > 0),
  target TEXT CHECK (target IN ('lose', 'maintain', 'gain')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilito RLS sulla tabella dei clienti
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
-- Migrazione per la tabella foods.
-- Contiene il database degli alimenti con i relativi valori nutrizionali per 100g.

CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  marca TEXT,
  calorie NUMERIC NOT NULL CHECK (calorie >= 0),
  proteine NUMERIC NOT NULL DEFAULT 0 CHECK (proteine >= 0),
  carboidrati NUMERIC NOT NULL DEFAULT 0 CHECK (carboidrati >= 0),
  grassi NUMERIC NOT NULL DEFAULT 0 CHECK (grassi >= 0),
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilito RLS
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
-- Migrazione per la tabella recipes.
-- Permette ai nutrizionisti di salvare ricette personalizzate composte da più ingredienti.

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descrizione TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabella degli ingredienti associati a ciascuna ricetta
CREATE TABLE public.recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.foods(id) ON DELETE CASCADE NOT NULL,
  quantita_grammi NUMERIC NOT NULL CHECK (quantita_grammi > 0)
);

-- Abilito RLS per le tabelle delle ricette
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
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
-- Migrazione per i piani di attività fisica.
-- Permette al nutrizionista di prescrivere schede di allenamento o esercizi fisici.

CREATE TABLE public.activity_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descrizione TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilito RLS
ALTER TABLE public.activity_plans ENABLE ROW LEVEL SECURITY;
-- Migrazione per la gestione degli appuntamenti.
-- Rappresenta il calendario delle visite tra nutrizionista e clienti.

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  data_ora TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('visita', 'follow-up', 'online')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilito RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Migrazione per questionari, misurazioni corporee e diario alimentare.
-- Raggruppa le tabelle utili per raccogliere feedback e tracciamento.

-- Tabella dei modelli di questionario creati dal nutrizionista
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Array di domande con tipologia (testo, scelta, numero)
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabella delle sottomissioni/risposte dei clienti
CREATE TABLE public.questionnaire_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL, -- Oggetto con le risposte date dal cliente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabella delle misurazioni fisiche del cliente (peso, circonferenze)
CREATE TABLE public.client_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight > 0),
  chest NUMERIC CHECK (chest > 0),
  waist NUMERIC CHECK (waist > 0),
  hips NUMERIC CHECK (hips > 0),
  arm_left NUMERIC CHECK (arm_left > 0),
  arm_right NUMERIC CHECK (arm_right > 0),
  measured_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabella del log alimentare giornaliero compilato dal cliente (diario)
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  nome_alimento TEXT NOT NULL,
  quantita_grammi NUMERIC NOT NULL CHECK (quantita_grammi > 0),
  calorie NUMERIC NOT NULL CHECK (calorie >= 0),
  proteine NUMERIC NOT NULL DEFAULT 0 CHECK (proteine >= 0),
  carboidrati NUMERIC NOT NULL DEFAULT 0 CHECK (carboidrati >= 0),
  grassi NUMERIC NOT NULL DEFAULT 0 CHECK (grassi >= 0),
  pasto TEXT NOT NULL CHECK (pasto IN ('colazione', 'pranzo', 'cena', 'spuntino')),
  logged_at DATE NOT NULL
);

-- Abilito RLS per tutte queste tabelle
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
-- Migrazione per le politiche RLS (Row Level Security).
-- Protegge l'accesso ai dati in modo che ciascun utente (nutrizionista o cliente)
-- possa leggere o scrivere solo le informazioni di propria competenza.

-- =========================================================================
-- POLITICHE PER public.profiles
-- =========================================================================

-- Ciascun utente può leggere il proprio profilo
CREATE POLICY "Permetti lettura profilo proprio"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Ciascun utente può modificare il proprio profilo
CREATE POLICY "Permetti aggiornamento profilo proprio"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Permetto al nutrizionista di vedere i profili dei propri clienti
CREATE POLICY "Permetti ai nutrizionisti di leggere i profili dei propri clienti"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT id FROM public.clients WHERE nutritionist_id = auth.uid()
    )
  );

-- Permetto al cliente di vedere il profilo del proprio nutrizionista
CREATE POLICY "Permetti ai clienti di leggere il profilo del proprio nutrizionista"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT nutritionist_id FROM public.clients WHERE id = auth.uid()
    )
  );


-- =========================================================================
-- POLITICHE PER public.clients
-- =========================================================================

-- Il cliente può vedere la propria riga in clients
CREATE POLICY "Clienti possono vedere i propri dati"
  ON public.clients FOR SELECT
  USING (auth.uid() = id);

-- Il cliente può aggiornare i propri dati personali (peso, altezza, target)
CREATE POLICY "Clienti possono aggiornare i propri dati"
  ON public.clients FOR UPDATE
  USING (auth.uid() = id);

-- Il nutrizionista può leggere e scrivere i dati dei clienti associati a lui
CREATE POLICY "Nutrizionisti possono leggere i propri clienti"
  ON public.clients FOR SELECT
  USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutrizionisti possono inserire/aggiornare i propri clienti"
  ON public.clients FOR ALL
  USING (auth.uid() = nutritionist_id);

-- =========================================================================
-- POLITICHE PER public.foods
-- =========================================================================

-- Tutti gli utenti registrati possono leggere i cibi globali o quelli creati da loro
CREATE POLICY "Lettura cibi condivisi o propri"
  ON public.foods FOR SELECT
  USING (is_custom = FALSE OR created_by = auth.uid());

-- I nutrizionisti possono inserire nuovi cibi custom
CREATE POLICY "Inserimento cibi custom da nutrizionista"
  ON public.foods FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

-- I nutrizionisti possono modificare i cibi custom creati da loro stessi
CREATE POLICY "Modifica cibi custom propri"
  ON public.foods FOR UPDATE
  USING (created_by = auth.uid());

-- =========================================================================
-- POLITICHE PER I PIANI ALIMENTARI (meal_plans, days, meals, items)
-- =========================================================================

-- Lettura piani alimentari per il cliente assegnatario
CREATE POLICY "Clienti possono leggere i propri piani"
  ON public.meal_plans FOR SELECT
  USING (auth.uid() = client_id);

-- Lettura e scrittura per il nutrizionista associato al cliente
CREATE POLICY "Nutrizionisti possono gestire i piani"
  ON public.meal_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = meal_plans.client_id AND clients.nutritionist_id = auth.uid()
    )
  );

-- RLS per le tabelle dipendenti (days, meals, items)
-- Usiamo query di verifica che si collegano alla tabella meal_plans principale

CREATE POLICY "Accesso meal_plan_days per cliente/nutrizionista"
  ON public.meal_plan_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_days.meal_plan_id
      AND (meal_plans.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.clients WHERE clients.id = meal_plans.client_id AND clients.nutritionist_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Accesso meals per cliente/nutrizionista"
  ON public.meals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plan_days
      JOIN public.meal_plans ON meal_plans.id = meal_plan_days.meal_plan_id
      WHERE meal_plan_days.id = meals.meal_plan_day_id
      AND (meal_plans.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.clients WHERE clients.id = meal_plans.client_id AND clients.nutritionist_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Accesso meal_items per cliente/nutrizionista"
  ON public.meal_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.meals
      JOIN public.meal_plan_days ON meal_plan_days.id = meals.meal_plan_day_id
      JOIN public.meal_plans ON meal_plans.id = meal_plan_days.meal_plan_id
      WHERE meals.id = meal_items.meal_id
      AND (meal_plans.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.clients WHERE clients.id = meal_plans.client_id AND clients.nutritionist_id = auth.uid()
      ))
    )
  );

-- =========================================================================
-- POLITICHE PER MISURAZIONI (client_metrics) & DIARIO (food_logs)
-- =========================================================================

-- Il cliente può fare qualsiasi operazione (lettura/scrittura) sulle proprie misurazioni e log
CREATE POLICY "Gestione totale propria per clienti (metrics)"
  ON public.client_metrics FOR ALL
  USING (auth.uid() = client_id);

CREATE POLICY "Gestione totale propria per clienti (food logs)"
  ON public.food_logs FOR ALL
  USING (auth.uid() = client_id);

-- Il nutrizionista associato può leggere le misurazioni e i log del cliente
CREATE POLICY "Lettura metrics per nutrizionista"
  ON public.client_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_metrics.client_id AND clients.nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Lettura food logs per nutrizionista"
  ON public.food_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = food_logs.client_id AND clients.nutritionist_id = auth.uid()
    )
  );

-- =========================================================================
-- POLITICHE PER APPUNTAMENTI (appointments)
-- =========================================================================

-- Ciascun cliente e nutrizionista può leggere i propri appuntamenti
CREATE POLICY "Lettura appuntamenti propria"
  ON public.appointments FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = nutritionist_id);

-- I nutrizionisti possono inserire/aggiornare/cancellare i propri appuntamenti
CREATE POLICY "Gestione appuntamenti per nutrizionisti"
  ON public.appointments FOR ALL
  USING (auth.uid() = nutritionist_id);
-- File di seed per NutriFlow.
-- Popola il database con alimenti base condivisi.

INSERT INTO public.foods (nome, marca, calorie, proteine, carboidrati, grassi, is_custom) VALUES
('Pasta di semola', 'Generico', 353, 12, 72, 1.5, FALSE),
('Riso Basmati', 'Generico', 345, 7.5, 78, 1, FALSE),
('Petto di pollo (crudo)', 'Generico', 110, 23, 0, 2, FALSE),
('Fesa di tacchino', 'Generico', 107, 24, 0, 1.2, FALSE),
('Uovo intero (medio)', 'Generico', 143, 12.5, 0.6, 10, FALSE),
('Salmone fresco', 'Generico', 180, 20, 0, 11, FALSE),
('Filetto di merluzzo', 'Generico', 82, 18, 0, 0.7, FALSE),
('Tonno al naturale (sgocciolato)', 'Generico', 103, 25, 0, 0.5, FALSE),
('Ricotta di mucca', 'Generico', 140, 8.5, 3.5, 10.5, FALSE),
('Fiocchi di latte', 'Generico', 98, 11, 3, 4.3, FALSE),
('Olio extravergine d''oliva', 'Generico', 899, 0, 0, 99.9, FALSE),
('Burro d''arachidi 100%', 'Generico', 588, 25, 20, 50, FALSE),
('Mandorle sgusciate', 'Generico', 579, 21.2, 21.7, 49.9, FALSE),
('Noci sgusciate', 'Generico', 654, 15.2, 13.7, 65.2, FALSE),
('Mela (con buccia)', 'Generico', 52, 0.3, 13.8, 0.2, FALSE),
('Banana', 'Generico', 89, 1.1, 22.8, 0.3, FALSE),
('Mirtilli freschi', 'Generico', 57, 0.7, 14.5, 0.3, FALSE),
('Spinaci freschi', 'Generico', 23, 2.9, 3.6, 0.4, FALSE),
('Broccoli lessi', 'Generico', 35, 2.4, 7, 0.4, FALSE),
('Oats / Fiocchi d''avena', 'Generico', 389, 16.9, 66, 6.9, FALSE);
