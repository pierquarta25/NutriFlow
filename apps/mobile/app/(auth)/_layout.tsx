// Layout per l'area di autenticazione.
// Rende le schermate di login e benvenuto all'interno di uno Stack di navigazione
// nascondendo l'intestazione predefinita di Expo.

import React from 'react';
import { Stack } from 'expo-router';

export default function LayoutAuth() {
  return (
    <Stack
      screenOptions={{
        // Nascondo l'header nativo in tutte le schermate di questo gruppo
        headerShown: false,
        // Imposto uno sfondo grigio chiaro per tutta l'area di accesso
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      {/* Schermata principale di accesso */}
      <Stack.Screen name="login" />
      {/* Schermata di onboarding per i nuovi clienti */}
      <Stack.Screen name="benvenuto" />
    </Stack>
  );
}
