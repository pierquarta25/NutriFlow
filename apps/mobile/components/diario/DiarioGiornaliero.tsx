// Componente DiarioGiornaliero.
// Organizza e mostra la lista dei pasti consumati registrati dall'utente
// suddivisi per pasto (Colazione, Pranzo, ecc.) con i relativi macro totali.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { AlimentoRow } from '../piano/AlimentoRow';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { FoodLog } from '@nutriflow/types';

interface DiarioGiornalieroProps {
  // Lista dei log alimentari del giorno
  logs: FoodLog[];
  // Callback opzionale per eliminare una riga dal diario
  onRimuoviAlimento?: (id: string) => void;
}

export const DiarioGiornaliero: React.FC<DiarioGiornalieroProps> = ({
  logs,
  onRimuoviAlimento,
}) => {
  // Definisco l'elenco ordinato dei pasti standard
  const tipiPasto = ['colazione', 'pranzo', 'cena', 'spuntino'] as const;

  // Associo l'emoji e il titolo corretto per la visualizzazione
  const ottieniInfoPasto = (pasto: string) => {
    if (pasto === 'colazione') return { emoji: '☕️', titolo: 'Colazione' };
    if (pasto === 'pranzo') return { emoji: '🍝', titolo: 'Pranzo' };
    if (pasto === 'cena') return { emoji: '🍗', titolo: 'Cena' };
    return { emoji: '🍎', titolo: 'Spuntini' };
  };

  // Filtro i log per tipologia di pasto
  const ottieniLogsPerPasto = (pasto: string) => {
    return logs.filter((log) => log.pasto === pasto);
  };

  // Calcolo la somma delle calorie totali consumate in un pasto
  const calcolaCaloriePasto = (logsPasto: FoodLog[]) => {
    return logsPasto.reduce((somma, log) => somma + log.calorie, 0);
  };

  return (
    <View style={stili.contenitore}>
      {tipiPasto.map((tipo) => {
        const logsDelPasto = ottieniLogsPerPasto(tipo);
        const info = ottieniInfoPasto(tipo);
        const calorieTotali = calcolaCaloriePasto(logsDelPasto);

        return (
          <Card key={tipo} paddingInterno={12} style={stili.cardPasto}>
            {/* Intestazione Pasto */}
            <View style={stili.headerPasto}>
              <View style={stili.areaSinistra}>
                <Text style={stili.emoji}>{info.emoji}</Text>
                <Text style={stili.titoloPasto}>{info.titolo}</Text>
              </View>
              {/* Mostro le calorie totali consumate per questo pasto */}
              <Text style={stili.valoreCalorie}>{calorieTotali} kcal</Text>
            </View>

            {/* Lista degli alimenti inseriti per questo pasto */}
            <View style={stili.listaAlimenti}>
              {logsDelPasto.length === 0 ? (
                // Se vuoto, indico che non ci sono cibi registrati per questo pasto
                <Text style={stili.testoVuoto}>Nessun alimento registrato.</Text>
              ) : (
                logsDelPasto.map((log) => (
                  <View key={log.id} style={stili.rigaAlimentoContainer}>
                    <View style={stili.alimentoInfo}>
                      <AlimentoRow
                        nomeAlimento={log.nomeAlimento}
                        grammatura={log.quantitaGrammi}
                        calorie={log.calorie}
                        proteine={log.proteine}
                        carboidrati={log.carboidrati}
                        grassi={log.grassi}
                      />
                    </View>
                    
                    {/* Icona per rimuovere l'alimento dal diario */}
                    {onRimuoviAlimento && (
                      <TouchableOpacity
                        onPress={() => onRimuoviAlimento(log.id)}
                        style={stili.pulsanteRimuovi}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.PERICOLO} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          </Card>
        );
      })}
    </View>
  );
};

const stili = StyleSheet.create({
  contenitore: {
    gap: Layout.spacing.md,
  },
  cardPasto: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerPasto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Layout.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  areaSinistra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  titoloPasto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  valoreCalorie: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.PRIMARY,
  },
  listaAlimenti: {
    marginTop: Layout.spacing.sm,
    gap: 4,
  },
  testoVuoto: {
    fontSize: 12,
    color: Colors.TESTO_SECONDARIO,
    fontStyle: 'italic',
    paddingVertical: Layout.spacing.xs,
  },
  rigaAlimentoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alimentoInfo: {
    flex: 1,
  },
  pulsanteRimuovi: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
