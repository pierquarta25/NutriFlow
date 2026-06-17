// Componente AlimentoRow.
// Mostra un singolo alimento consumato o prescritto con grammi e calorie.
// Al tap, mostra in basso i dettagli dei macronutrienti (P, C, G).

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface AlimentoRowProps {
  // Nome del cibo (es. "Fesa di tacchino")
  nomeAlimento: string;
  // Grammi prescritti/consumati (es. 120)
  grammatura: number;
  // Calorie totali calcolate per la porzione
  calorie: number;
  // Grammi di proteine nella porzione
  proteine: number;
  // Grammi di carboidrati nella porzione
  carboidrati: number;
  // Grammi di grassi nella porzione
  grassi: number;
}

export const AlimentoRow: React.FC<AlimentoRowProps> = ({
  nomeAlimento,
  grammatura,
  calorie,
  proteine,
  carboidrati,
  grassi,
}) => {
  // Stato per mostrare/nascondere i macronutrienti di dettaglio (tooltip)
  const [mostraDettaglio, impostaMostraDettaglio] = useState(false);

  const toggleDettaglio = () => {
    impostaMostraDettaglio(!mostraDettaglio);
  };

  return (
    <View style={stili.contenitoreEsterno}>
      <TouchableOpacity
        onPress={toggleDettaglio}
        activeOpacity={0.6}
        style={stili.rigaPrincipale}
      >
        <View style={stili.areaSinistra}>
          {/* Nome dell'alimento */}
          <Text style={stili.nome}>{nomeAlimento}</Text>
          {/* Grammatura dell'alimento */}
          <Text style={stili.grammi}>{grammatura}g</Text>
        </View>

        {/* Calorie calcolate per la porzione */}
        <Text style={stili.calorie}>{calorie} kcal</Text>
      </TouchableOpacity>

      {/* Se l'utente fa tap sulla riga, mostro i dettagli dei macro (tooltip) */}
      {mostraDettaglio && (
        <View style={stili.areaMacroDettaglio}>
          <Text style={stili.testoMacro}>
            Prot: <Text style={stili.valoreMacro}>{proteine}g</Text>
          </Text>
          <Text style={stili.separatoreMacro}>|</Text>
          <Text style={stili.testoMacro}>
            Carbo: <Text style={stili.valoreMacro}>{carboidrati}g</Text>
          </Text>
          <Text style={stili.separatoreMacro}>|</Text>
          <Text style={stili.testoMacro}>
            Grassi: <Text style={stili.valoreMacro}>{grassi}g</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const stili = StyleSheet.create({
  contenitoreEsterno: {
    paddingVertical: Layout.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rigaPrincipale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  areaSinistra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    flex: 1,
  },
  nome: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.TESTO_PRINCIPALE,
  },
  grammi: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
  },
  calorie: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    fontWeight: '500',
  },
  areaMacroDettaglio: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  testoMacro: {
    fontSize: 11,
    color: Colors.TESTO_SECONDARIO,
  },
  valoreMacro: {
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  separatoreMacro: {
    color: '#D1D5DB',
    fontSize: 11,
  },
});
