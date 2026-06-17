// Componente Avatar nativo per React Native.
// Mostra la foto del profilo caricata o, in alternativa,
// le iniziali del nome del cliente su uno sfondo colorato.

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/Colors';

interface AvatarProps {
  // URL pubblico dell'immagine del profilo caricata
  urlFoto?: string;
  // Nome completo per calcolare le iniziali in caso di foto mancante
  nomeCompleto: string;
  // Dimensione in pixel (larghezza ed altezza, default: 48)
  dimensione?: number;
  // Azione facoltativa quando si tocca l'avatar
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  urlFoto,
  nomeCompleto,
  dimensione = 48,
  onPress,
}) => {
  // Calcolo le iniziali prendendo le prime lettere di Nome e Cognome
  const ottieniIniziali = () => {
    const parti = nomeCompleto.trim().split(' ');
    if (parti.length === 0 || !parti[0]) return '?';
    
    const primaLettera = parti[0][0] || '';
    const secondaLettera = parti[1] ? parti[1][0] || '' : '';
    
    return (primaLettera + secondaLettera).toUpperCase();
  };

  const stileCerchio = {
    width: dimensione,
    height: dimensione,
    borderRadius: dimensione / 2,
  };

  // Contenuto grafico dell'avatar
  const contenutoAvatar = urlFoto ? (
    // Se c'è la foto, uso expo-image per visualizzarla con cache ottimizzata
    <Image
      source={{ uri: urlFoto }}
      style={[stili.immagine, stileCerchio]}
      contentFit="cover"
      transition={200}
    />
  ) : (
    // Se la foto non c'è, mostro il cerchio colorato con le iniziali
    <View style={[stili.segnaposto, stileCerchio]}>
      <Text style={[stili.testoIniziali, { fontSize: dimensione * 0.4 }]}>
        {ottieniIniziali()}
      </Text>
    </View>
  );

  // Se è impostata la prop onPress, rendo l'avatar cliccabile
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {contenutoAvatar}
      </TouchableOpacity>
    );
  }

  return contenutoAvatar;
};

const stili = StyleSheet.create({
  immagine: {
    backgroundColor: '#E5E7EB',
  },
  segnaposto: {
    backgroundColor: Colors.ACCENTO,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testoIniziali: {
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
});
