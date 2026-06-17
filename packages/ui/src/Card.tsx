// Componente Card riutilizzabile con ombreggiatura e bordi arrotondati.
// Consente di contenere altri elementi organizzandoli visivamente.

import React from 'react';
import { cn } from './utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Elementi figli da renderizzare all'interno della card
  children: React.ReactNode;
  // Spaziatura interna in pixel (default: 16)
  paddingInterno?: number;
}

// Creo il componente Card.
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, paddingInterno = 16, ...props }, ref) => {
    // Definisco le classi di stile base per la card (sfondo bianco, ombretta)
    const classiStileBase =
      'bg-white rounded-xl border border-[#E5E7EB] shadow-sm transition-shadow hover:shadow-md';

    // Determino il padding interno dinamico in base alla prop
    let classePadding = 'p-4'; // Corrisponde a 16px (p-4)
    if (paddingInterno === 8) {
      classePadding = 'p-2';
    } else if (paddingInterno === 12) {
      classePadding = 'p-3';
    } else if (paddingInterno === 24) {
      classePadding = 'p-6';
    } else if (paddingInterno === 32) {
      classePadding = 'p-8';
    }

    // Unisco tutte le classi calcolate
    const classiFinali = cn(classiStileBase, classePadding, className);

    return (
      <div ref={ref} className={classiFinali} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
