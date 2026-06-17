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
