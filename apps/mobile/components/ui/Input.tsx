// Componente campo di input (TextInput) nativo per React Native.
// Mostra un'etichetta superiore, un eventuale suffisso (es. "kg")
// e un eventuale messaggio di validazione/errore rosso in basso.

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface InputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  // L'etichetta descrittiva del campo
  etichetta: string;
  // Il valore testuale corrente
  valore: string;
  // Funzione richiamata ogni volta che l'utente inserisce un carattere
  onChange: (testo: string) => void;
  // Eventuale suffisso numerico/unità di misura (es: "kg", "cm")
  suffisso?: string;
  // Messaggio di errore rosso da mostrare sotto il campo
  errore?: string;
  // Disabilita la scrittura se impostato a true
  disabilitato?: boolean;
  // Tipo di tastiera/input (testo, email, password, numero)
  tipo?: 'testo' | 'email' | 'password' | 'numero';
}

export const Input: React.FC<InputProps> = ({
  etichetta,
  valore,
  onChange,
  suffisso,
  errore,
  disabilitato = false,
  tipo = 'testo',
  placeholder,
  ...props
}) => {
  // Configuro la tastiera e l'oscuramento in base alla tipologia di campo
  const isPassword = tipo === 'password';
  const keyboardType = tipo === 'numero' ? 'numeric' : 'default';
  const autoCapitalize = tipo === 'email' || tipo === 'password' ? 'none' : 'sentences';

  return (
    <View style={stili.contenitore}>
      {/* Etichetta superiore grigia */}
      <Text style={stili.etichetta}>{etichetta}</Text>

      {/* Contenitore interno per input ed eventuale suffisso */}
      <View style={stili.areaInput}>
        <TextInput
          value={valore}
          onChangeText={onChange}
          editable={!disabilitato}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            stili.input,
            errore ? stili.inputErrore : stili.inputNormale,
            disabilitato && stili.inputDisabilitato,
            suffisso ? { paddingRight: 40 } : null,
          ]}
          {...props}
        />

        {/* Mostro il suffisso a destra se fornito */}
        {suffisso && (
          <Text style={stili.testoSuffisso}>{suffisso}</Text>
        )}
      </View>

      {/* Mostro il messaggio di errore rosso in basso se presente */}
      {errore && (
        <Text style={stili.testoErrore}>{errore}</Text>
      )}
    </View>
  );
};

const stili = StyleSheet.create({
  contenitore: {
    width: '100%',
    gap: 6,
  },
  etichetta: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TESTO_SECONDARIO,
  },
  areaInput: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.input,
    paddingHorizontal: Layout.spacing.lg,
    fontSize: 14,
    color: Colors.TESTO_PRINCIPALE,
    backgroundColor: '#FFFFFF',
  },
  inputNormale: {
    borderColor: '#E5E7EB',
  },
  inputErrore: {
    borderColor: Colors.PERICOLO,
  },
  inputDisabilitato: {
    backgroundColor: '#F3F4F6',
    color: Colors.TESTO_SECONDARIO,
  },
  testoSuffisso: {
    position: 'absolute',
    right: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  testoErrore: {
    fontSize: 11,
    color: Colors.PERICOLO,
    fontWeight: '500',
  },
});
