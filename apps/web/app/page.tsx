// Landing page pubblica di NutriFlow.
// Mostra una pagina di presentazione minimale e professionale
// con i pulsanti per accedere o registrarsi alla piattaforma.

import React from 'react';
import Link from 'next/link';

export default function PaginaInizialePubblica() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between">
      {/* Intestazione / Navbar */}
      <header className="px-8 py-6 flex justify-between items-center bg-white border-b border-[#E5E7EB]">
        <span className="text-xl font-bold text-[#16A34A] tracking-wider">
          NutriFlow
        </span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] px-4 py-2 transition-colors"
          >
            Accedi
          </Link>
          <Link
            href="/login"
            className="text-sm font-bold text-white bg-[#16A34A] hover:bg-[#15803d] px-5 py-2 rounded-full transition-colors"
          >
            Inizia Ora
          </Link>
        </div>
      </header>

      {/* Contenuto Principale (Hero Section) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto py-12 gap-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#16A34A] bg-[#DCFCE7] px-3.5 py-1.5 rounded-full">
          NutriFlow SaaS
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight">
          La nutrizione sportiva, resa semplice e professionale.
        </h1>
        <p className="text-lg text-[#6B7280] max-w-xl">
          Crea piani alimentari personalizzati, traccia i progressi dei clienti
          in tempo reale e ottimizza il lavoro del tuo studio nutrizionale.
        </p>

        {/* Pulsanti di Azione */}
        <div className="flex gap-4 mt-4">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#16A34A] px-8 text-sm font-bold text-white hover:bg-[#15803d] transition-colors shadow-lg hover:shadow-xl"
          >
            Accedi alla Dashboard
          </Link>
          <a
            href="https://github.com/pierquarta25/NutriFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-8 text-sm font-bold text-[#111827] hover:bg-[#F9FAFB] transition-colors"
          >
            Codice Sorgente
          </a>
        </div>
      </main>

      {/* Piè di pagina */}
      <footer className="py-6 border-t border-[#E5E7EB] text-center bg-white">
        <p className="text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} NutriFlow. Tutti i diritti riservati.
        </p>
      </footer>
    </div>
  );
}
