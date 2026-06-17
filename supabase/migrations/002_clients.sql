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
