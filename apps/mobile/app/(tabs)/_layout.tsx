// Configurazione della navigazione a schede (Tab Navigation) principale.
// Crea la barra inferiore (TabBar) con i 5 collegamenti alle funzionalità principali.

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function LayoutTabs() {
  return (
    <Tabs
      screenOptions={{
        // Colore dell'icona e testo attivo
        tabBarActiveTintColor: Colors.PRIMARY,
        // Colore dell'icona e testo non attivo
        tabBarInactiveTintColor: Colors.TESTO_SECONDARIO,
        // Stile della barra inferiore
        tabBarStyle: {
          backgroundColor: Colors.SURFACE,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        // Stile per le etichette delle schede
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        // Nascondo l'intestazione predefinita nelle schermate
        headerShown: false,
      }}
    >
      {/* 1. Scheda OGGI (Piano alimentare del giorno corrente) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Oggi',
          tabBarLabel: 'Oggi',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'today' : 'today-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Scheda PIANO (Piano settimanale completo) */}
      <Tabs.Screen
        name="piano"
        options={{
          title: 'Piano',
          tabBarLabel: 'Piano',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'restaurant' : 'restaurant-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Scheda DIARIO (Tracciamento dei pasti consumati) */}
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diario',
          tabBarLabel: 'Diario',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Scheda PROGRESSI (Peso, misure e foto) */}
      <Tabs.Screen
        name="progressi"
        options={{
          title: 'Progressi',
          tabBarLabel: 'Progressi',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'trending-up' : 'trending-up-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 5. Scheda PROFILO (Modifica dati e impostazioni) */}
      <Tabs.Screen
        name="profilo"
        options={{
          title: 'Profilo',
          tabBarLabel: 'Profilo',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
