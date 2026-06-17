// Componente FotoProgressi.
// Mostra una griglia di foto dei progressi caricate su Supabase Storage.
// Permette all'utente di aggiungere nuove foto tramite Expo Image Picker.

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useConnessione } from '../../hooks/useConnessione';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export const FotoProgressi: React.FC = () => {
  const cliente = useAuthStore((stato) => stato.cliente);
  const { isOffline } = useConnessione();
  const [fotoList, impostaFotoList] = useState<string[]>([]);
  const [inCaricamento, impostaInCaricamento] = useState(false);
  const [inUpload, impostaInUpload] = useState(false);

  // Calcolo la dimensione delle celle per fare una griglia a 3 colonne
  const larghezzaCella = (Dimensions.get('window').width - Layout.spacing.xl * 2 - 16) / 3;

  // Carico l'elenco delle foto progressi salvate su Supabase Storage
  const caricaFotoProgressi = async () => {
    if (!cliente?.id || isOffline) return;

    impostaInCaricamento(true);
    try {
      // Chiedo l'elenco dei file presenti nella cartella progress del cliente
      const { data, error } = await supabase.storage
        .from('client-photos')
        .list(`${cliente.id}/progress`, {
          limit: 50,
          sortBy: { column: 'name', order: 'desc' },
        });

      if (!error && data) {
        // Genero l'URL pubblico per ciascun file trovato
        const urls = data
          .filter((file) => file.name !== '.emptyFolderPlaceholder')
          .map((file) => {
            const { data: urlData } = supabase.storage
              .from('client-photos')
              .getPublicUrl(`${cliente.id}/progress/${file.name}`);
            return urlData.publicUrl;
          });

        impostaFotoList(urls);
      }
    } catch (e) {
      console.error('Errore nel caricamento delle foto:', e);
    } finally {
      impostaInCaricamento(false);
    }
  };

  useEffect(() => {
    caricaFotoProgressi();
  }, [cliente?.id, isOffline]);

  // Gestisco la selezione e il caricamento di una nuova foto progressi
  const gestisciSelezionaFoto = async () => {
    if (isOffline) {
      alert('Non puoi caricare foto quando sei offline.');
      return;
    }

    // Richiedo i permessi di accesso alla galleria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permesso di accesso alla galleria negato.');
      return;
    }

    // Apro la galleria del telefono
    const risultato = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!risultato.canceled && risultato.assets && risultato.assets[0]) {
      const uriFoto = risultato.assets[0].uri;
      await uploadFoto(uriFoto);
    }
  };

  // Carico la foto selezionata nel bucket client-photos di Supabase Storage
  const uploadFoto = async (uri: string) => {
    if (!cliente?.id) return;
    
    impostaInUpload(true);
    try {
      const risposta = await fetch(uri);
      const blob = await risposta.blob();
      
      const timestamp = Date.now();
      const percorsoFile = `${cliente.id}/progress/${timestamp}.jpg`;

      // Eseguo l'upload effettivo
      const { error } = await supabase.storage
        .from('client-photos')
        .upload(percorsoFile, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Ricarico la lista delle foto aggiornata
      await caricaFotoProgressi();
    } catch (e) {
      alert('Si è verificato un errore durante il caricamento della foto.');
    } finally {
      impostaInUpload(false);
    }
  };

  return (
    <View style={stili.contenitore}>
      <View style={stili.header}>
        <Text style={stili.titolo}>Foto Progressi</Text>
        {/* Pulsante aggiungi foto */}
        <TouchableOpacity
          onPress={gestisciSelezionaFoto}
          disabled={inUpload || isOffline}
          style={[stili.pulsanteAggiungi, isOffline && stili.disabilitato]}
        >
          {inUpload ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={stili.testoAggiungi}>Aggiungi foto</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {inCaricamento ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={stili.spinner} />
      ) : fotoList.length === 0 ? (
        <View style={stili.areaVuota}>
          <Text style={stili.testoVuoto}>Nessuna foto caricata ancora.</Text>
        </View>
      ) : (
        <FlatList
          data={fotoList}
          keyExtractor={(item) => item}
          numColumns={3}
          scrollEnabled={false} // Rendo la lista non scrollabile per evitare conflitti con scroll esterno
          columnWrapperStyle={stili.rigaGriglia}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={[stili.immagineGriglia, { width: larghezzaCella, height: larghezzaCella }]}
              contentFit="cover"
              transition={200}
            />
          )}
        />
      )}
    </View>
  );
};

const stili = StyleSheet.create({
  contenitore: {
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadius.card,
    padding: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  titolo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TESTO_PRINCIPALE,
  },
  pulsanteAggiungi: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testoAggiungi: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabilitato: {
    opacity: 0.5,
  },
  spinner: {
    paddingVertical: Layout.spacing.xl,
  },
  areaVuota: {
    paddingVertical: Layout.spacing.xl,
    alignItems: 'center',
  },
  testoVuoto: {
    fontSize: 13,
    color: Colors.TESTO_SECONDARIO,
    fontStyle: 'italic',
  },
  rigaGriglia: {
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  immagineGriglia: {
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});
