// Componente RiepilogoDiario.
// Mostra il riepilogo grafico dei macro e delle calorie consumate (diario)
// messe a confronto con i target stabiliti dal piano nutrizionale.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { Card } from '../ui/Card';

interface RiepilogoProps {
  // Calorie consumate registrate nel diario
  calorieConsumate: number;
  // Calorie totali target del piano
  calorieTarget: number;
  proteineConsumate: number;
  proteineTarget: number;
  carboConsumati: number;
  carboTarget: number;
  grassiConsumati: number;
  grassiTarget: number;
}

export const RiepilogoDiario: React.FC<RiepilogoProps> = ({
  calorieConsumate,
  calorieTarget,
  proteineConsumate,
  proteineTarget,
  carboConsumati,
  carboTarget,
  grassiConsumati,
  grassiTarget,
}) => {
  // Funzione ausiliaria per calcolare la percentuale e renderizzare la barra di progresso
  const renderizzaBarraProgresso = (consumato: number, target: number, colore: string) => {
    const percentuale = target > 0 ? Math.min((consumato / target) * 100, 100) : 0;
    
    return (
      <View style={stili.contenitoreBarra}>
        <View style={stili.sfondoBarra}>
          <View
            style={[
              stili.riempimentoBarra,
              { width: `${percentuale}%`, backgroundColor: colore },
            ]}
          />
        </View>
        <View style={stili.dettaglioValori}>
          <Text style={stili.testoValori}>
            {Math.round(consumato)}g / {target}g
          </Text>
          <Text style={stili.testoPercentuale}>{Math.round(percentuale)}%</Text>
        </View>
      </View>
    );
  };

  return (
    <Card paddingInterno={16} style={stili.card}>
      <Text style={stili.titolo}>Consumato vs Obiettivo del Giorno</Text>
      
      {/* Riepilogo Calorie */}
      <View style={stili.sezioneCalorie}>
        <View style={stili.infoCalorie}>
          <Text style={stili.labelCalorie}>Calorie Giornaliere</Text>
          <Text style={stili.valoriCalorie}>
            {calorieConsumate} <Text style={stili.subCalorie}>/ {calorieTarget} kcal</Text>
          </Text>
        </View>
        
        {/* Barra calorie */}
        <View style={stili.sfondoBarraCalorie}>
          <View
            style={[
              stili.riempimentoBarraCalorie,
              {
                width: `${calorieTarget > 0 ? Math.min((calorieConsumate / calorieTarget) * 100, 100) : 0}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Riepilogo Macronutrienti */}
      <View style={stili.sezioneMacro}>
        {/* 1. Proteine */}
        <View style={stili.rigaMacro}>
          <Text style={stili.etichettaMacro}>Proteine</Text>
          {renderizzaBarraProgresso(proteineConsumate, proteineTarget, '#EF4444')}
        </View>

        {/* 2. Carboidrati */}
        <View style={stili.rigaMacro}>
          <Text style={stili.etichettaMacro}>Carboidrati</Text>
          {renderizzaBarraProgresso(carboConsumati, carboTarget, '#3B82F6')}
        </View>

        {/* 3. Grassi */}
        <View style={stili.rigaMacro}>
          <Text style={stili.etichettaMacro}>Grassi</Text>
          {renderizzaBarraProgresso(grassiConsumati, grassiTarget, '#F59E0B')}
        </View>
      </View>
    </Card>
  );
};

const stili = StyleSheet.create({
  card: {
    marginBottom: Layout.spacing.md,
  },
  titolo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    marginBottom: Layout.spacing.md,
  },
  sezioneCalorie: {
    gap: 6,
    marginBottom: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: Layout.spacing.md,
  },
  infoCalorie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  labelCalorie: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TESTO_PRINCIPALE,
  },
  valoriCalorie: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  subCalorie: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    fontWeight: 'normal',
  },
  sfondoBarraCalorie: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  riempimentoBarraCalorie: {
    height: '100%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
  },
  sezioneMacro: {
    gap: Layout.spacing.sm,
  },
  rigaMacro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etichettaMacro: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.TESTO_PRINCIPALE,
    width: 80,
  },
  contenitoreBarra: {
    flex: 1,
    gap: 4,
  },
  sfondoBarra: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  riempimentoBarra: {
    height: '100%',
    borderRadius: 3,
  },
  dettaglioValori: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testoValori: {
    fontSize: 10,
    color: Colors.TESTO_SECONDARIO,
  },
  testoPercentuale: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.TESTO_PRINCIPALE,
  },
});
