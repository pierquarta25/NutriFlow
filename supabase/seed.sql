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
