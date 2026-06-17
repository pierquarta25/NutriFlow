// Costanti di layout per l'applicazione mobile.
// Definiscono le dimensioni dello schermo, spaziature e raggi dei bordi.

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  // Dimensioni dello schermo del dispositivo
  window: {
    width,
    height,
  },
  // Raggi dei bordi (border radius) standardizzati nel design system
  borderRadius: {
    input: 8, // Raggio del bordo per i campi di input
    card: 12, // Raggio del bordo per le card e i pannelli
    bottone: 24, // Raggio del bordo per i bottoni principali arrotondati
  },
  // Spaziatura standard basata su multipli di 4 per mantenere l'ordine visivo
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    giant: 48,
  },
};
