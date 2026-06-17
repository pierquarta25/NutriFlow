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
