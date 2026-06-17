// Componente bottone riutilizzabile e personalizzabile.
// Gestisce varianti grafiche, stati di caricamento e disabilitazione.

import React from 'react';
import { cn } from './utils';

export interface BottoneProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Il testo da mostrare dentro il bottone
  testo: string;
  // Lo stile grafico del bottone
  variante?: 'primario' | 'secondario' | 'pericolo' | 'outline';
  // Stato di caricamento (mostra un indicatore visivo)
  caricamento?: boolean;
  // Stato disabilitato (impedisce l'interazione)
  disabilitato?: boolean;
}

// Definisco il componente bottone con le sue proprietà.
export const Button = React.forwardRef<HTMLButtonElement, BottoneProps>(
  (
    {
      className,
      testo,
      variante = 'primario',
      caricamento = false,
      disabilitato = false,
      ...props
    },
    ref
  ) => {
    // Definisco le classi CSS di base comuni a tutti i bottoni
    const classiBase =
      'inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 py-2';

    // Determino le classi specifiche in base alla variante scelta
    let classiVariante = '';

    if (variante === 'primario') {
      // Stile verde per azioni principali
      classiVariante =
        'bg-[#16A34A] text-white hover:bg-[#15803d] focus-visible:ring-[#16A34A]';
    } else if (variante === 'secondario') {
      // Stile grigio chiaro per azioni secondarie
      classiVariante =
        'bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] focus-visible:ring-[#D1D5DB]';
    } else if (variante === 'pericolo') {
      // Stile rosso per azioni distruttive (es. elimina)
      classiVariante =
        'bg-[#EF4444] text-white hover:bg-[#DC2626] focus-visible:ring-[#EF4444]';
    } else if (variante === 'outline') {
      // Stile bordato trasparente
      classiVariante =
        'border border-[#E5E7EB] bg-transparent text-[#111827] hover:bg-[#F9FAFB]';
    }

    // Unisco tutte le classi calcolate con la funzione cn
    const classiFinali = cn(classiBase, classiVariante, className);

    return (
      <button
        ref={ref}
        disabled={disabilitato || caricamento}
        className={classiFinali}
        {...props}
      >
        {caricamento ? (
          // Mostro un indicatore di caricamento testuale semplice
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Caricamento...
          </span>
        ) : (
          // Mostro il testo normale del bottone
          testo
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
