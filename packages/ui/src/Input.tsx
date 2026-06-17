// Componente Input di testo riutilizzabile con etichetta, suffisso ed errori.
// Gestisce gli stati di disabilitazione e i messaggi di validazione.

import React from 'react';
import { cn } from './utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  // L'etichetta testuale sopra il campo di input
  etichetta: string;
  // Valore corrente del campo
  valore: string;
  // Funzione chiamata quando il testo cambia
  onChange: (testo: string) => void;
  // Eventuale suffisso (es. "kg", "cm") da mostrare a destra
  suffisso?: string;
  // Messaggio di errore da mostrare sotto il campo
  errore?: string;
  // Stato disabilitato
  disabilitato?: boolean;
  // Tipo di input (es. text, password, email, number)
  tipo?: 'testo' | 'email' | 'password' | 'numero';
}

// Creo il componente Input.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      etichetta,
      valore,
      onChange,
      suffisso,
      errore,
      disabilitato = false,
      tipo = 'testo',
      placeholder,
      ...props
    },
    ref
  ) => {
    // Determino il tipo di input nativo HTML
    let tipoInputNativo = 'text';
    if (tipo === 'email') {
      tipoInputNativo = 'email';
    } else if (tipo === 'password') {
      tipoInputNativo = 'password';
    } else if (tipo === 'numero') {
      tipoInputNativo = 'number';
    }

    // Gestisco il cambiamento del testo inoltrando il valore
    const gestisciCambiamento = (
      evento: React.ChangeEvent<HTMLInputElement>
    ) => {
      onChange(evento.target.value);
    };

    // Definisco le classi per il bordo in base alla presenza di errori
    const classiBordo = errore
      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]'
      : 'border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]';

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Mostro l'etichetta dell'input */}
        <label className="text-xs font-semibold text-[#6B7280]">
          {etichetta}
        </label>

        {/* Contenitore dell'input per gestire l'eventuale suffisso */}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type={tipoInputNativo}
            value={valore}
            onChange={gestisciCambiamento}
            disabled={disabilitato}
            placeholder={placeholder}
            className={cn(
              'flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              classiBordo,
              suffisso ? 'pr-12' : '',
              className
            )}
            {...props}
          />

          {/* Se presente, mostro il suffisso posizionato a destra */}
          {suffisso && (
            <span className="absolute right-3 text-sm font-medium text-[#9CA3AF] pointer-events-none">
              {suffisso}
            </span>
          )}
        </div>

        {/* Se presente l'errore, mostro il messaggio rosso sotto l'input */}
        {errore && (
          <span className="text-xs text-[#EF4444] font-medium">
            {errore}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
