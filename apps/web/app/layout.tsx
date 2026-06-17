// Layout principale (Root Layout) del portale web.
// Carica i font globali, lo stile CSS e racchiude l'applicazione nei Providers.

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import './globals.css';

// Carico il font Inter da Google Fonts
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NutriFlow - Dashboard Nutrizionista',
  description: 'Piattaforma SaaS per la gestione nutrizionale sportiva',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} antialiased text-[#111827] bg-[#F9FAFB]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
