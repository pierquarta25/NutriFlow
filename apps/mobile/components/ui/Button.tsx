// Componente Bottone nativo per React Native.
// Supporta le varianti di colore definite nel design system,
// lo stato di caricamento con indicatore di attività e la disabilitazione.

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface BottoneProps {
  // Testo visibile dentro il bottone
  testo: string;
  // Funzione chiamata al tocco del bottone
  onPress: () => void;
  // Variante di stile (primario, secondario, pericolo, outline)
  variante?: 'primario' | 'secondario' | 'pericolo' | 'outline';
  // Mostra un caricamento asincrono se impostato su true
  caricamento?: boolean;
  // Disabilita l'interazione se impostato su true
  disabilitato?: boolean;
  // Stili aggiuntivi opzionali passati dall'esterno
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<BottoneProps> = ({
  testo,
  onPress,
  variante = 'primario',
  caricamento = false,
  disabilitato = false,
  style,
}) => {
  // Determino lo stile del contenitore in base alla variante
  const ottieniStileContenitore = () => {
    if (variante === 'primario') return stili.primario;
    if (variante === 'secondario') return stili.secondario;
    if (variante === 'pericolo') return stili.pericolo;
    if (variante === 'outline') return stili.outline;
    return stili.primario;
  };

  // Determino lo stile del testo in base alla variante
  const ottieniStileTesto = () => {
    if (variante === 'outline') return stili.testoOutline;
    if (variante === 'secondario') return stili.testoSecondario;
    return stili.testoBianco;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabilitato || caricamento}
      activeOpacity={0.8}
      style={[
        stili.base,
        ottieniStileContenitore(),
        (disabilitato || caricamento) && stili.disabilitato,
        style,
      ]}
    >
      {caricamento ? (
        // Mostro lo spinner di caricamento nativo
        <ActivityIndicator
          size="small"
          color={variante === 'outline' ? Colors.PRIMARY : '#FFFFFF'}
        />
      ) : (
        // Mostro il testo del bottone
        <Text style={[stili.testo, ottieniStileTesto()]}>{testo}</Text>
      )}
    </TouchableOpacity>
  );
};

const stili = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: Layout.borderRadius.bottone,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
    flexDirection: 'row',
  },
  primario: {
    backgroundColor: Colors.PRIMARY,
  },
  secondario: {
    backgroundColor: '#F3F4F6',
  },
  pericolo: {
    backgroundColor: Colors.PERICOLO,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disabilitato: {
    opacity: 0.5,
  },
  testo: {
    fontSize: 15,
    fontWeight: '600',
  },
  testoBianco: {
    color: '#FFFFFF',
  },
  testoSecondario: {
    color: Colors.TESTO_PRINCIPALE,
  },
  testoOutline: {
    color: Colors.TESTO_PRINCIPALE,
  },
});
