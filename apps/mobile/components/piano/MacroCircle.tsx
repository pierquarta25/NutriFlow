// Componente cerchio progressi animato per i macronutrienti.
// Utilizza react-native-svg per disegnare la barra di avanzamento circolare
// e react-native-reanimated per l'animazione di riempimento iniziale.

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

// Associo la classe animata al componente Circle di react-native-svg
const CircleAnimato = Animated.createAnimatedComponent(Circle);

interface MacroCircleProps {
  // Nome del nutriente (es: "Proteine")
  etichetta: string;
  // Valore corrente assunto (es: 120)
  valore: number;
  // Valore target da raggiungere (es: 150)
  obiettivo: number;
  // Unità di misura (es: "g" o "kcal")
  unita: string;
  // Colore del cerchio di avanzamento
  colore: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({
  etichetta,
  valore,
  obiettivo,
  unita,
  colore,
}) => {
  // Configuro il raggio e la circonferenza del cerchio
  const raggio = 28;
  const spessoreBordo = 6;
  const circonferenza = 2 * Math.PI * raggio;

  // Calcolo la percentuale di completamento limitandola al 100% (1.0)
  const percentuale = obiettivo > 0 ? Math.min(valore / obiettivo, 1) : 0;

  // Valore animato per lo scostamento del tratto (dash offset)
  const scostamentoTratto = useSharedValue(circonferenza);

  // Avvio l'animazione al montaggio del componente
  useEffect(() => {
    // Il cerchio parte da vuoto ed arriva alla percentuale desiderata in 1 secondo
    scostamentoTratto.value = withTiming(circonferenza * (1 - percentuale), {
      duration: 1000,
    });
  }, [percentuale]);

  // Proprietà animate passate al cerchio SVG
  const propsAnimate = useAnimatedProps(() => {
    return {
      strokeDashoffset: scostamentoTratto.value,
    };
  });

  return (
    <View style={stili.contenitore}>
      <Svg width={72} height={72} style={stili.svg}>
        <G rotation="-90" origin="36, 36">
          {/* Cerchio di sfondo grigio (obiettivo non ancora raggiunto) */}
          <Circle
            cx="36"
            cy="36"
            r={raggio}
            stroke="#E5E7EB"
            strokeWidth={spessoreBordo}
            fill="transparent"
          />
          {/* Cerchio colorato animato che si riempie */}
          <CircleAnimato
            cx="36"
            cy="36"
            r={raggio}
            stroke={colore}
            strokeWidth={spessoreBordo}
            fill="transparent"
            strokeDasharray={`${circonferenza} ${circonferenza}`}
            animatedProps={propsAnimate}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Testo centrale con valore/obiettivo */}
      <View style={stili.areaValori}>
        <Text style={stili.testoValore}>
          {Math.round(valore)}
          <Text style={stili.testoUnita}>{unita}</Text>
        </Text>
        <Text style={stili.testoObiettivo}>target: {obiettivo}</Text>
      </View>

      {/* Nome del macronutriente in basso */}
      <Text style={stili.etichetta}>{etichetta}</Text>
    </View>
  );
};

const stili = StyleSheet.create({
  contenitore: {
    alignItems: 'center',
    gap: 4,
  },
  svg: {
    marginBottom: 2,
  },
  areaValori: {
    alignItems: 'center',
  },
  testoValore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  testoUnita: {
    fontSize: 10,
    color: Colors.TESTO_SECONDARIO,
    fontWeight: 'normal',
  },
  testoObiettivo: {
    fontSize: 9,
    color: Colors.TESTO_SECONDARIO,
  },
  etichetta: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TESTO_PRINCIPALE,
    marginTop: 2,
  },
});
