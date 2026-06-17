// Componente Card nativo per React Native.
// Rende una superficie rialzata con ombreggiatura leggera per raggruppare informazioni.

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface CardProps {
  // Contenuto da visualizzare all'interno della card
  children: React.ReactNode;
  // Spaziatura interna in pixel (default: 16)
  paddingInterno?: number;
  // Stili di layout aggiuntivi passabili dall'esterno
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  paddingInterno = 16,
  style,
}) => {
  return (
    <View
      style={[
        stili.card,
        { padding: paddingInterno },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const stili = StyleSheet.create({
  card: {
    backgroundColor: Colors.SURFACE,
    borderRadius: Layout.borderRadius.card,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Ombreggiatura per iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevazione per Android
    elevation: 2,
  },
});
