// Wrapper per i provider client-side di Next.js (es: QueryClient).
// Questo file vive lato client ed inizializza lo stato globale della cache.

'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Inizializzo il QueryClient all'interno di uno stato per evitare la ricreazione
  // del client durante i ri-rendering della pagina.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // Tempo di stale standard di 5 minuti
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
