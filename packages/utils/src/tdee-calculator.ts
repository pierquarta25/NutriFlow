// Calcolatore del Fabbisogno Calorico Giornaliero Totale
// (TDEE - Total Daily Energy Expenditure).
// Calcola le calorie totali consumate in una giornata
// moltiplicando il metabolismo basale per il livello di attività fisica.

export type LivelloAttivita =
  | 'sedentary' // Attività minima, lavoro d'ufficio, poco o nessun esercizio
  | 'lightly_active' // Esercizio leggero o sport 1-3 giorni alla settimana
  | 'moderately_active' // Esercizio moderato o sport 3-5 giorni alla settimana
  | 'very_active' // Esercizio intenso o sport 6-7 giorni alla settimana
  | 'extremely_active'; // Allenamenti multipli quotidiani o lavoro molto pesante

// Recupero il coefficiente moltiplicatore in base al livello di attività.
export function ottieniMoltiplicatoreAttivita(
  livello: LivelloAttivita
): number {
  // Eseguo una selezione esplicita per evitare ternari o magie
  if (livello === 'sedentary') {
    // Ritorno il moltiplicatore per stile sedentario
    return 1.2;
  }

  if (livello === 'lightly_active') {
    // Ritorno il moltiplicatore per attività leggera
    return 1.375;
  }

  if (livello === 'moderately_active') {
    // Ritorno il moltiplicatore per attività moderata
    return 1.55;
  }

  if (livello === 'very_active') {
    // Ritorno il moltiplicatore per attività intensa
    return 1.725;
  }

  if (livello === 'extremely_active') {
    // Ritorno il moltiplicatore per attività estremamente intensa
    return 1.9;
  }

  // Ritorno il valore di default di sicurezza (sedentario) se non corrisponde
  return 1.2;
}

// Calcolo il fabbisogno energetico giornaliero totale (TDEE).
// Prendo in ingresso il metabolismo basale e il livello di attività fisica.
export function calcolaTDEE(
  metabolismoBasale: number,
  livelloAttivita: LivelloAttivita
): number {
  // Ottengo il moltiplicatore numerico corrispondente al livello
  const moltiplicatore = ottieniMoltiplicatoreAttivita(livelloAttivita);

  // Calcolo il totale calorico giornaliero arrotondando all'intero
  const tdeeCalcolato = metabolismoBasale * moltiplicatore;

  return Math.round(tdeeCalcolato);
}
