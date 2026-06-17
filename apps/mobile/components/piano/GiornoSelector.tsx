// Componente GiornoSelector.
// Rende una barra di selezione orizzontale scorrevole con i giorni della settimana.
// Evidenzia il giorno attivo e mostra un puntino sotto il giorno di "oggi".

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface GiornoSelectorProps {
  // Giorno correntemente selezionato (es: "lunedi")
  giornoSelezionato: string;
  // Callback richiamata al cambio del giorno
  onCambiaGiorno: (giorno: string) => void;
}

export const GiornoSelector: React.FC<GiornoSelectorProps> = ({
  giornoSelezionato,
  onCambiaGiorno,
}) => {
  // Lista ordinata delle chiavi dei giorni in italiano
  const giorni = [
    { chiave: 'lunedi', etichetta: 'LUN' },
    { chiave: 'martedi', etichetta: 'MAR' },
    { chiave: 'mercoledi', etichetta: 'MER' },
    { chiave: 'giovedi', etichetta: 'GIO' },
    { chiave: 'venerdi', etichetta: 'VEN' },
    { chiave: 'sabato', etichetta: 'SAB' },
    { chiave: 'domenica', etichetta: 'DOM' },
  ];

  // Determino l'indice del giorno di oggi
  const giorniSettimanaNativi = [
    'domenica',
    'lunedi',
    'martedi',
    'mercoledi',
    'giovedi',
    'venerdi',
    'sabato',
  ];
  const chiaveOggi = giorniSettimanaNativi[new Date().getDay()];

  return (
    <View style={stili.contenitoreEsterno}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={stili.scroll}
      >
        {giorni.map((g) => {
          const isSelezionato = g.chiave === giornoSelezionato;
          const isOggi = g.chiave === chiaveOggi;

          return (
            <TouchableOpacity
              key={g.chiave}
              onPress={() => onCambiaGiorno(g.chiave)}
              activeOpacity={0.7}
              style={[
                stili.pulsanteGiorno,
                isSelezionato ? stili.giornoAttivo : stili.giornoInattivo,
              ]}
            >
              {/* Etichetta del giorno (LUN, MAR...) */}
              <Text
                style={[
                  stili.testoGiorno,
                  isSelezionato ? stili.testoAttivo : stili.testoInattivo,
                ]}
              >
                {g.etichetta}
              </Text>

              {/* Puntino verde sotto se il giorno corrisponde ad oggi */}
              {isOggi && (
                <View
                  style={[
                    stili.puntinoOggi,
                    isSelezionato ? stili.puntinoBianco : stili.puntinoVerde,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const stili = StyleSheet.create({
  contenitoreEsterno: {
    backgroundColor: Colors.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: Layout.spacing.sm,
  },
  scroll: {
    paddingHorizontal: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  pulsanteGiorno: {
    width: 44,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  giornoAttivo: {
    backgroundColor: Colors.PRIMARY,
  },
  giornoInattivo: {
    backgroundColor: '#F3F4F6',
  },
  testoGiorno: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  testoAttivo: {
    color: '#FFFFFF',
  },
  testoInattivo: {
    color: Colors.TESTO_PRINCIPALE,
  },
  puntinoOggi: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 6,
  },
  puntinoVerde: {
    backgroundColor: Colors.PRIMARY,
  },
  puntinoBianco: {
    backgroundColor: '#FFFFFF',
  },
});
