// Utility per combinare le classi CSS in modo condizionale.
// Utilizzo 'clsx' per la logica condizionale e 'tailwind-merge'
// per risolvere i conflitti tra le classi di Tailwind.

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Unisco le classi CSS passate come parametri.
export function cn(...inputs: ClassValue[]): string {
  // Ritorno la stringa di classi pulita e senza conflitti
  return twMerge(clsx(inputs));
}
