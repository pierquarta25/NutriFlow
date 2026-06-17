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
