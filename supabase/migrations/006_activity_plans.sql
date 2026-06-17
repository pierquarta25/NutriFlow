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
