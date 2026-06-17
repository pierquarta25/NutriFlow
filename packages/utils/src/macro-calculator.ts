// Calcolatore delle calorie e dei macronutrienti per gli alimenti.
// Questo modulo contiene funzioni per determinare i valori nutrizionali
// effettivi in base ai grammi di alimento consumati o prescritti.

import { Food, MealItem } from '@nutriflow/types';

interface MacronutrientiCalcolati {
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
}

// Calcolo i macronutrienti esatti in base ai grammi consumati.
// Prendo come parametri la grammatura e i valori per 100 grammi.
export function calcolaMacroDellaPorzione(
  quantitaGrammi: number,
  alimento: Food
): MacronutrientiCalcolati {
  // Verifico che la quantità sia valida ed escludo valori negativi
  if (quantitaGrammi <= 0) {
    return { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 };
  }

  // Calcolo il fattore di conversione rapportato a 100 grammi
  const fattoreDiConversione = quantitaGrammi / 100;

  // Calcolo le calorie totali arrotondando all'intero più vicino
  const calorieCalcolate = Math.round(
    alimento.calorie * fattoreDiConversione
  );

  // Calcolo le proteine con precisione a un decimale
  const proteineCalcolate = Math.round(
    alimento.proteine * fattoreDiConversione * 10
  ) / 10;

  // Calcolo i carboidrati con precisione a un decimale
  const carboidratiCalcolate = Math.round(
    alimento.carboidrati * fattoreDiConversione * 10
  ) / 10;

  // Calcolo i grassi con precisione a un decimale
  const grassiCalcolati = Math.round(
    alimento.grassi * fattoreDiConversione * 10
  ) / 10;

  // Ritorno l'oggetto completo con tutti i macro della porzione
  return {
    calorie: calorieCalcolate,
    proteine: proteineCalcolate,
    carboidrati: carboidratiCalcolate,
    grassi: grassiCalcolati,
  };
}

// Sommo tutti i macronutrienti dei singoli alimenti per ottenere
// i macro totali di un pasto.
export function calcolaMacroTotaliDelPasto(
  listaAlimenti: MealItem[]
): MacronutrientiCalcolati {
  // Inizializzo l'accumulatore a zero per ogni nutriente
  const totaleIniziale: MacronutrientiCalcolati = {
    calorie: 0,
    proteine: 0,
    carboidrati: 0,
    grassi: 0,
  };

  // Sommo i macro di ciascun elemento iterando sulla lista
  const macroSommati = listaAlimenti.reduce((totale, elemento) => {
    // Calcolo i macro del singolo alimento
    const macroAlimento = calcolaMacroDellaPorzione(
      elemento.quantitaGrammi,
      elemento.food
    );

    // Aggiungo i valori al totale accumulato
    return {
      calorie: totale.calorie + macroAlimento.calorie,
      proteine: totale.proteine + macroAlimento.proteine,
      carboidrati: totale.carboidrati + macroAlimento.carboidrati,
      grassi: totale.grassi + macroAlimento.grassi,
    };
  }, totaleIniziale);

  // Arrotondo i totali finali delle proteine, carboidrati e grassi
  return {
    calorie: macroSommati.calorie,
    proteine: Math.round(macroSommati.proteine * 10) / 10,
    carboidrati: Math.round(macroSommati.carboidrati * 10) / 10,
    grassi: Math.round(macroSommati.grassi * 10) / 10,
  };
}
