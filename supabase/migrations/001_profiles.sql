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
