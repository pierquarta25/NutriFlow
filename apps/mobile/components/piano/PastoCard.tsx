// Componente PastoCard.
// Rappresenta un singolo pasto della giornata (es: Colazione).
// È collassabile al tap sull'intestazione e contiene la lista dei cibi.

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { AlimentoRow } from './AlimentoRow';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { MealItem } from '@nutriflow/types';

interface PastoCardProps {
  // Nome del pasto (es. "Colazione", "Pranzo")
  nomePasto: string;
  // Orario indicativo consigliato per il pasto (es. "08:00")
  orarioPasto?: string;
  // Lista degli alimenti che compongono il pasto
  listaAlimenti: MealItem[];
  // Somma totale delle calorie del pasto
  totalCalorie: number;
}

export const PastoCard: React.FC<PastoCardProps> = ({
  nomePasto,
  orarioPasto,
  listaAlimenti,
  totalCalorie,
}) => {
  // Stato booleano per gestire l'apertura/chiusura della card
  const [aperta, impostaAperta] = useState(true);

  // Associo un'emoji rappresentativa ad ogni pasto standard
  const ottieniEmojiPasto = () => {
    const nomeMinuscolo = nomePasto.toLowerCase();
    if (nomeMinuscolo.includes('colazione')) return '☕️';
    if (nomeMinuscolo.includes('pranzo')) return '🍝';
    if (nomeMinuscolo.includes('cena')) return '🍗';
    if (nomeMinuscolo.includes('spuntino') && nomeMinuscolo.includes('mattina')) return '🍎';
    if (nomeMinuscolo.includes('spuntino') && nomeMinuscolo.includes('pomeriggio')) return '🍌';
    return '🍽️';
  };

  // Inverto lo stato di apertura quando l'utente tocca l'header
  const invertiApertura = () => {
    impostaAperta(!aperta);
  };

  return (
    <Card paddingInterno={12} style={stili.card}>
      {/* Intestazione del pasto cliccabile */}
      <TouchableOpacity
        onPress={invertiApertura}
        activeOpacity={0.7}
        style={stili.header}
      >
        <View style={stili.areaSinistra}>
          <Text style={stili.emoji}>{ottieniEmojiPasto()}</Text>
          <View>
            <Text style={stili.titoloPasto}>{nomePasto}</Text>
            {orarioPasto && (
              <Text style={stili.orario}>{orarioPasto}</Text>
            )}
          </View>
        </View>

        <View style={stili.areaDestra}>
          {/* Badge delle calorie totali del pasto */}
          <View style={stili.badgeCalorie}>
            <Text style={stili.testoCalorie}>{totalCalorie} kcal</Text>
          </View>
          
          {/* Icona a freccia che ruota in base allo stato aperta/chiusa */}
          <Ionicons
            name={aperta ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.TESTO_SECONDARIO}
          />
        </View>
      </TouchableOpacity>

      {/* Se la card è aperta, mostro la lista degli alimenti */}
      {aperta && (
        <View style={stili.corpo}>
          {listaAlimenti.length === 0 ? (
            // Stato vuoto se non ci sono alimenti inseriti
            <Text style={stili.testoVuoto}>Nessun alimento inserito.</Text>
          ) : (
            // Mappo la lista degli alimenti passandoli al componente AlimentoRow
            listaAlimenti.map((elemento) => (
              <AlimentoRow
                key={elemento.id}
                nomeAlimento={elemento.food.nome}
                grammatura={elemento.quantitaGrammi}
                calorie={Math.round(
                  (elemento.food.calorie * elemento.quantitaGrammi) / 100
                )}
                proteine={Math.round(
                  ((elemento.food.proteine * elemento.quantitaGrammi) / 100) * 10
                ) / 10}
                carboidrati={Math.round(
                  ((elemento.food.carboidrati * elemento.quantitaGrammi) / 100) * 10
                ) / 10}
                grassi={Math.round(
                  ((elemento.food.grassi * elemento.quantitaGrammi) / 100) * 10
                ) / 10}
              />
            ))
          )}
        </View>
      )}
    </Card>
  );
};

const stili = StyleSheet.create({
  card: {
    marginBottom: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs,
  },
  areaSinistra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  emoji: {
    fontSize: 22,
  },
  titoloPasto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  orario: {
    fontSize: 12,
    color: Colors.TESTO_SECONDARIO,
  },
  areaDestra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  badgeCalorie: {
    backgroundColor: Colors.ACCENTO,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  testoCalorie: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  corpo: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  testoVuoto: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Layout.spacing.sm,
  },
});
