// Calcolatore del Metabolismo Basale (BMR - Basal Metabolic Rate).
// Questo modulo contiene formule scientifiche ampiamente utilizzate
// per stimare il consumo calorico a riposo di un individuo.

export type GenereUtente = 'male' | 'female';
export type FormulaMetabolismo = 'harris-benedict' | 'mifflin-st-jeor';

// Calcolo il Metabolismo Basale usando la formula di Mifflin-St Jeor.
// Questa formula è considerata molto accurata per la popolazione moderna.
export function calcolaMifflinStJeor(
  pesoChilogrammi: number,
  altezzaCentimetri: number,
  etaAnni: number,
  genere: GenereUtente
): number {
  // Calcolo la quota base comune ai due generi
  const quotaBase =
    10 * pesoChilogrammi + 6.25 * altezzaCentimetri - 5 * etaAnni;

  // Applico la correzione finale in base al genere
  if (genere === 'male') {
    // Aggiungo 5 per gli uomini
    return Math.round(quotaBase + 5);
  } else {
    // Sottraggo 161 per le donne
    return Math.round(quotaBase - 161);
  }
}

// Calcolo il BMR usando la formula classica di Harris-Benedict (revisione 1984).
// Viene usata spesso nello sport e nella nutrizione clinica.
export function calcolaHarrisBenedict(
  pesoChilogrammi: number,
  altezzaCentimetri: number,
  etaAnni: number,
  genere: GenereUtente
): number {
  // Verifico il genere per applicare la formula corrispondente
  if (genere === 'male') {
    // Formula per il genere maschile
    const bmrMaschile =
      88.362 +
      13.397 * pesoChilogrammi +
      4.799 * altezzaCentimetri -
      5.677 * etaAnni;
    return Math.round(bmrMaschile);
  } else {
    // Formula per il genere femminile
    const bmrFemminile =
      447.593 +
      9.247 * pesoChilogrammi +
      3.098 * altezzaCentimetri -
      4.33 * etaAnni;
    return Math.round(bmrFemminile);
  }
}

// Calcolo il metabolismo basale finale in base alla formula selezionata.
// Funge da punto di ingresso principale per il calcolo del BMR.
export function calcolaMetabolismoBasale(
  pesoChilogrammi: number,
  altezzaCentimetri: number,
  etaAnni: number,
  genere: GenereUtente,
  formulaSelezionata: FormulaMetabolismo
): number {
  // Eseguo il calcolo in base alla formula passata come parametro
  if (formulaSelezionata === 'mifflin-st-jeor') {
    // Chiamo il calcolo specifico di Mifflin-St Jeor
    return calcolaMifflinStJeor(
      pesoChilogrammi,
      altezzaCentimetri,
      etaAnni,
      genere
    );
  } else {
    // Chiamo il calcolo specifico di Harris-Benedict
    return calcolaHarrisBenedict(
      pesoChilogrammi,
      altezzaCentimetri,
      etaAnni,
      genere
    );
  }
}
