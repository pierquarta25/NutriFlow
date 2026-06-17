// Componente Badge (etichetta o chip) per evidenziare piccoli testi o stati.
// Gestisce varianti di colore in base allo scopo semantico.

import React from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  // Testo o elementi da mostrare dentro il badge
  children: React.ReactNode;
  // Colore semantico del badge
  variante?: 'primario' | 'secondario' | 'pericolo' | 'avviso';
}

// Creo il componente Badge.
export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  variante = 'primario',
  ...props
}) => {
  // Classi di stile base comuni
  const classiStileBase =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

  // Definisco le classi di colore specifiche
  let classiColore = '';
  if (variante === 'primario') {
    // Sfondo verde pastello con testo verde scuro
    classiColore = 'bg-[#DCFCE7] text-[#15803D]';
  } else if (variante === 'secondario') {
    // Sfondo grigio con testo scuro
    classiColore = 'bg-[#F3F4F6] text-[#374151]';
  } else if (variante === 'pericolo') {
    // Sfondo rosso pastello con testo rosso scuro
    classiColore = 'bg-[#FEE2E2] text-[#B91C1C]';
  } else if (variante === 'avviso') {
    // Sfondo arancione pastello con testo arancione scuro
    classiColore = 'bg-[#FEF3C7] text-[#B45309]';
  }

  // Unisco le classi finali
  const classiFinali = cn(classiStileBase, classiColore, className);

  return (
    <span className={classiFinali} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
