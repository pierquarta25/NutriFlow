// Componente GraficoAndamentoPeso.
// Mostra un grafico a linea (Victory Native) dell'andamento del peso nel tempo.
// Filtra le misurazioni in base al periodo selezionato (1M, 3M, 6M, Tutto).

import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryArea,
  VictoryScatter,
  VictoryTooltip,
  VictoryTheme,
} from 'victory-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { ClientMetric } from '@nutriflow/types';

interface GraficoProps {
  // Lista di tutte le misurazioni corporee del cliente
  misurazioni: ClientMetric[];
  // Filtro temporale selezionato
  periodo: '1m' | '3m' | '6m' | 'tutto';
}

export const GraficoAndamentoPeso: React.FC<GraficoProps> = ({
  misurazioni,
  periodo,
}) => {
  // Ottengo la larghezza dello schermo per adattare il grafico
  const larghezzaSchermo = Dimensions.get('window').width - Layout.spacing.xl * 2;

  // Filtro lo storico in base al periodo richiesto
  const ottieniDatiFiltrati = () => {
    // Ordino le misurazioni cronologicamente per tracciare la linea da sinistra a destra
    const ordinate = [...misurazioni].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    if (periodo === 'tutto') {
      return ordinate;
    }

    const oggi = new Date();
    let giorniDaSottrarre = 30; // 1 Mese di default

    if (periodo === '3m') {
      giorniDaSottrarre = 90;
    } else if (periodo === '6m') {
      giorniDaSottrarre = 180;
    }

    const dataLimite = new Date();
    dataLimite.setDate(oggi.getDate() - giorniDaSottrarre);

    // Ritorno solo le misurazioni rientranti nel range temporale
    return ordinate.filter((m) => new Date(m.measuredAt) >= dataLimite);
  };

  const datiGrafico = ottieniDatiFiltrati();

  // Se non ci sono dati, mostro un messaggio informativo (empty state)
  if (datiGrafico.length === 0) {
    return (
      <View style={stili.statoVuoto}>
        <Text style={stili.testoStatoVuoto}>
          Nessuna misurazione nel periodo selezionato.
        </Text>
      </View>
    );
  }

  // Mappo i dati per renderli compatibili con i punti X e Y di Victory Chart
  const datiMappati = datiGrafico.map((m) => {
    const data = new Date(m.measuredAt);
    const giorno = String(data.getDate()).padStart(2, '0');
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    
    return {
      x: `${giorno}/${mese}`, // Asse X: data formattata dd/MM
      y: m.weight, // Asse Y: peso in kg
      label: `${m.weight} kg\nil ${giorno}/${mese}`, // Testo del tooltip
    };
  });

  return (
    <View style={stili.contenitore} pointerEvents="none">
      <VictoryChart
        width={larghezzaSchermo}
        height={220}
        theme={VictoryTheme.material}
        padding={{ top: 20, bottom: 40, left: 45, right: 20 }}
      >
        {/* Asse X: Date */}
        <VictoryAxis
          style={{
            grid: { stroke: 'none' },
            tickLabels: { fontSize: 10, fill: Colors.TESTO_SECONDARIO },
          }}
        />

        {/* Asse Y: Peso in kg */}
        <VictoryAxis
          dependentAxis
          style={{
            grid: { stroke: '#E5E7EB', strokeDasharray: '4, 4' },
            tickLabels: { fontSize: 10, fill: Colors.TESTO_SECONDARIO },
          }}
        />

        {/* Area ombreggiata con gradiente verde sotto la linea del grafico */}
        <VictoryArea
          data={datiMappati}
          style={{
            data: { fill: Colors.ACCENTO, opacity: 0.4 },
          }}
        />

        {/* Linea principale del peso */}
        <VictoryLine
          data={datiMappati}
          style={{
            data: { stroke: Colors.PRIMARY, strokeWidth: 3 },
          }}
        />

        {/* Punti interattivi sul grafico con tooltip al tap */}
        <VictoryScatter
          data={datiMappati}
          size={5}
          style={{
            data: { fill: '#FFFFFF', stroke: Colors.PRIMARY, strokeWidth: 2 },
          }}
          labels={({ datum }) => datum.label}
          labelComponent={
            <VictoryTooltip
              constrainToVisibleArea
              flyoutStyle={{
                fill: Colors.TESTO_PRINCIPALE,
                stroke: 'none',
                borderRadius: 6,
              }}
              style={{ fill: '#FFFFFF', fontSize: 10 }}
            />
          }
        />
      </VictoryChart>
    </View>
  );
};

const stili = StyleSheet.create({
  contenitore: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadius.card,
    paddingVertical: Layout.spacing.sm,
  },
  statoVuoto: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadius.card,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testoStatoVuoto: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    fontStyle: 'italic',
  },
});
