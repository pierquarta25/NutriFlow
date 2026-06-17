// Componente AggiuntaAlimentoDiario.
// Schermata/Modal per cercare un alimento nel database locale,
// inserire i grammi consumati e registrarlo in uno specifico pasto.

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { ottieniAlimentiLocali } from '../../lib/database-locale';
import { Food, FoodLog } from '@nutriflow/types';

interface AggiuntaProps {
  // Controlla l'apertura/chiusura del modal
  visibile: boolean;
  // Funzione per chiudere il modal
  onChiudi: () => void;
  // Giorno corrente formattato YYYY-MM-DD per associare il log
  dataSelezionata: string;
  // Callback richiamata alla conferma della registrazione
  onSalvaAlimento: (log: Omit<FoodLog, 'id' | 'clientId'>) => Promise<void>;
}

export const AggiuntaAlimentoDiario: React.FC<AggiuntaProps> = ({
  visibile,
  onChiudi,
  dataSelezionata,
  onSalvaAlimento,
}) => {
  const [ricerca, impostaRicerca] = useState('');
  const [pastoSelezionato, impostaPastoSelezionato] = useState<'colazione' | 'pranzo' | 'cena' | 'spuntino'>('colazione');
  const [alimentoSelezionato, impostaAlimentoSelezionato] = useState<Food | null>(null);
  const [grammi, impostaGrammi] = useState('100');
  const [errore, impostaErrore] = useState<string | undefined>(undefined);
  const [inRegistrazione, impostaInRegistrazione] = useState(false);

  const [alimentiDisponibili, impostaAlimentiDisponibili] = useState<Food[]>([]);

  // Carico gli alimenti disponibili dal database locale all'apertura del modal
  useEffect(() => {
    if (visibile) {
      const cibi = ottieniAlimentiLocali();
      impostaAlimentiDisponibili(cibi);
    }
  }, [visibile]);

  // Filtro gli alimenti in base al testo digitato dall'utente
  const ottieniAlimentiFiltrati = () => {
    if (!ricerca) return [];
    return alimentiDisponibili.filter((cibo) =>
      cibo.nome.toLowerCase().includes(ricerca.toLowerCase())
    );
  };

  const cibiFiltrati = ottieniAlimentiFiltrati();

  // Seleziono un alimento e nascondo i risultati della ricerca
  const gestisciSelezionaAlimento = (cibo: Food) => {
    impostaAlimentoSelezionato(cibo);
    impostaRicerca('');
  };

  // Eseguo la validazione e registro l'alimento consumato
  const gestisciRegistrazione = async () => {
    impostaErrore(undefined);

    if (!alimentoSelezionato) {
      impostaErrore('Seleziona un alimento prima.');
      return;
    }

    const grammiNumerici = parseFloat(grammi);
    if (isNaN(grammiNumerici) || grammiNumerici <= 0) {
      impostaErrore('Inserisci una quantità valida in grammi.');
      return;
    }

    impostaInRegistrazione(true);

    try {
      const fattore = grammiNumerici / 100;

      // Creo il log alimentare calcolando i macro effettivi per la grammatura
      await onSalvaAlimento({
        foodId: alimentoSelezionato.id,
        nomeAlimento: alimentoSelezionato.nome,
        quantitaGrammi: grammiNumerici,
        calorie: Math.round(alimentoSelezionato.calorie * fattore),
        proteine: Math.round(alimentoSelezionato.proteine * fattore * 10) / 10,
        carboidrati: Math.round(alimentoSelezionato.carboidrati * fattore * 10) / 10,
        grassi: Math.round(alimentoSelezionato.grassi * fattore * 10) / 10,
        pasto: pastoSelezionato,
        loggedAt: dataSelezionata,
      });

      // Pulisco lo stato e chiudo il modal
      impostaAlimentoSelezionato(null);
      impostaGrammi('100');
      onChiudi();
    } catch (e) {
      impostaErrore('Errore nel salvataggio del pasto.');
    } finally {
      impostaInRegistrazione(false);
    }
  };

  return (
    <Modal visible={visibile} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={stili.contenitoreModal}>
        {/* Intestazione */}
        <View style={stili.header}>
          <Text style={stili.titoloHeader}>Aggiungi Alimento</Text>
          <TouchableOpacity onPress={onChiudi} style={stili.pulsanteChiudi}>
            <Ionicons name="close" size={24} color={Colors.TESTO_PRINCIPALE} />
          </TouchableOpacity>
        </View>

        <View style={stili.corpo}>
          {/* 1. Selezione del Pasto */}
          <Text style={stili.label}>Seleziona il Pasto</Text>
          <View style={stili.rigaPasti}>
            {(['colazione', 'pranzo', 'cena', 'spuntino'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => impostaPastoSelezionato(p)}
                style={[
                  stili.badgePasto,
                  pastoSelezionato === p ? stili.badgePastoAttivo : stili.badgePastoInattivo,
                ]}
              >
                <Text
                  style={[
                    stili.testoBadge,
                    pastoSelezionato === p ? stili.testoBadgeAttivo : stili.testoBadgeInattivo,
                  ]}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 2. Ricerca Alimento */}
          {!alimentoSelezionato ? (
            <View style={stili.sezioneCerca}>
              <Input
                etichetta="Cerca Alimento"
                valore={ricerca}
                onChange={impostaRicerca}
                placeholder="digita il nome dell'alimento (es: pasta, pollo)"
              />

              {/* Lista risultati filtrati */}
              {ricerca.length > 0 && (
                <FlatList
                  data={cibiFiltrati}
                  keyExtractor={(item) => item.id}
                  style={stili.listaRisultati}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => gestisciSelezionaAlimento(item)}
                      style={stili.rigaRisultato}
                    >
                      <Text style={stili.testoRisultato}>{item.nome}</Text>
                      <Text style={stili.kcalRisultato}>{item.calorie} kcal/100g</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <Text style={stili.testoListaVuota}>Nessun alimento corrispondente.</Text>
                  )}
                />
              )}
            </View>
          ) : (
            // 3. Inserimento Grammi dell'alimento selezionato
            <View style={stili.sezioneGrammi}>
              <View style={stili.cardAlimentoSelezionato}>
                <View style={stili.infoCiboSelezionato}>
                  <Text style={stili.nomeCiboSelezionato}>{alimentoSelezionato.nome}</Text>
                  <TouchableOpacity onPress={() => impostaAlimentoSelezionato(null)}>
                    <Text style={stili.testoRimuovi}>Cambia</Text>
                  </TouchableOpacity>
                </View>
                <Text style={stili.macroCiboSelezionato}>
                  Calorie: {alimentoSelezionato.calorie} kcal | P: {alimentoSelezionato.proteine}g | C: {alimentoSelezionato.carboidrati}g | G: {alimentoSelezionato.grassi}g (per 100g)
                </Text>
              </View>

              <Input
                etichetta="Quantità Consumata"
                valore={grammi}
                onChange={impostaGrammi}
                tipo="numero"
                suffisso="g"
                placeholder="es: 150"
              />

              {errore && <Text style={stili.testoErrore}>{errore}</Text>}

              <Button
                testo="Registra nel diario"
                onPress={gestisciRegistrazione}
                variante="primario"
                caricamento={inRegistrazione}
                disabilitato={inRegistrazione}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const stili = StyleSheet.create({
  contenitoreModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titoloHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  pulsanteChiudi: {
    padding: 4,
  },
  corpo: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.md,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.TESTO_SECONDARIO,
  },
  rigaPasti: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.xs,
  },
  badgePasto: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgePastoAttivo: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  badgePastoInattivo: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  testoBadge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  testoBadgeAttivo: {
    color: '#FFFFFF',
  },
  testoBadgeInattivo: {
    color: Colors.TESTO_PRINCIPALE,
  },
  sezioneCerca: {
    flex: 1,
    gap: Layout.spacing.sm,
  },
  listaRisultati: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 250,
  },
  rigaRisultato: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  testoRisultato: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.TESTO_PRINCIPALE,
  },
  kcalRisultato: {
    fontSize: 12,
    color: Colors.TESTO_SECONDARIO,
  },
  testoListaVuota: {
    padding: Layout.spacing.md,
    textAlign: 'center',
    color: Colors.TESTO_SECONDARIO,
    fontStyle: 'italic',
    fontSize: 13,
  },
  sezioneGrammi: {
    gap: Layout.spacing.md,
  },
  cardAlimentoSelezionato: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCiboSelezionato: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nomeCiboSelezionato: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
    flex: 1,
  },
  testoRimuovi: {
    color: Colors.PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  macroCiboSelezionato: {
    fontSize: 11,
    color: Colors.TESTO_SECONDARIO,
  },
  testoErrore: {
    color: Colors.PERICOLO,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
