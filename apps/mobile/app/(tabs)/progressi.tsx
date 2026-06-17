// Schermata "Progressi" dell'applicazione mobile.
// Raggruppa la gestione del peso, dei grafici temporali e delle foto progressi.

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useProgressi } from '../../hooks/useProgressi';
import { useConnessione } from '../../hooks/useConnessione';
import { InserisciMisurazione } from '../../components/progressi/InserisciMisurazione';
import { GraficoAndamentoPeso } from '../../components/progressi/GraficoAndamentoPeso';
import { FotoProgressi } from '../../components/progressi/FotoProgressi';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export default function TabProgressiCliente() {
  const { isOffline } = useConnessione();
  const { misurazioni, salvaMisurazione } = useProgressi();

  // Stato per gestire il filtro temporale del grafico
  const [periodoGrafico, impostaPeriodoGrafico] = useState<'1m' | '3m' | '6m' | 'tutto'>('1m');

  return (
    <SafeAreaView style={stili.contenitoreEsterno}>
      {/* Banner giallo visibile quando offline */}
      {isOffline && (
        <View style={stili.bannerOffline}>
          <Text style={stili.testoOffline}>
            Misurazioni offline — i dati verranno sincronizzati appena torni online
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={stili.scroll}>
        <View style={stili.header}>
          <Text style={stili.titolo}>Miei Progressi</Text>
          <Text style={stili.sottoTitolo}>Traccia peso, circonferenze e foto</Text>
        </View>

        {/* 1. SEZIONE GRAFICO PESO */}
        <View style={stili.sezioneGrafico}>
          <View style={stili.rigaGraficoHeader}>
            <Text style={stili.titoloSezione}>Andamento Peso</Text>
            {/* Selettore del periodo temporale */}
            <View style={stili.selettorePeriodo}>
              {([
                { chiave: '1m', etichet: '1M' },
                { chiave: '3m', etichet: '3M' },
                { chiave: '6m', etichet: '6M' },
                { chiave: 'tutto', etichet: 'Tutto' },
              ] as const).map((p) => (
                <TouchableOpacity
                  key={p.chiave}
                  onPress={() => impostaPeriodoGrafico(p.chiave)}
                  style={[
                    stili.pulsantePeriodo,
                    periodoGrafico === p.chiave && stili.pulsantePeriodoAttivo,
                  ]}
                >
                  <Text
                    style={[
                      stili.testoPeriodo,
                      periodoGrafico === p.chiave && stili.testoPeriodoAttivo,
                    ]}
                  >
                    {p.etichet}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Renderizzo il grafico Victory passandogli lo storico */}
          <GraficoAndamentoPeso misurazioni={misurazioni} periodo={periodoGrafico} />
        </View>

        {/* 2. SEZIONE INSERIMENTO DATI */}
        <InserisciMisurazione onSalva={salvaMisurazione} />

        {/* 3. SEZIONE FOTO PROGRESSI */}
        <FotoProgressi />
      </ScrollView>
    </SafeAreaView>
  );
}

const stili = StyleSheet.create({
  contenitoreEsterno: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  bannerOffline: {
    backgroundColor: Colors.AVVISO,
    padding: Layout.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testoOffline: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scroll: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
    gap: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.xs,
  },
  titolo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  sottoTitolo: {
    fontSize: 12,
    color: Colors.TESTO_SECONDARIO,
    marginTop: 2,
  },
  sezioneGrafico: {
    gap: Layout.spacing.sm,
  },
  rigaGraficoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titoloSezione: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  selettorePeriodo: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  pulsantePeriodo: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pulsantePeriodoAttivo: {
    backgroundColor: '#FFFFFF',
  },
  testoPeriodo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.TESTO_SECONDARIO,
  },
  testoPeriodoAttivo: {
    color: Colors.PRIMARY,
  },
});
