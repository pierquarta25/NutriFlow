// Layout dell'area dashboard protetta.
// Include la Sidebar fissa laterale e l'Header superiore.
// Gestisce il posizionamento e lo scrolling corretto dei contenuti delle pagine.

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Barra laterale fissa */}
      <Sidebar />

      {/* Contenitore a destra con header superiore e area di lavoro */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Area di lavoro principale scrollabile */}
        <main className="flex-1 p-8 ml-[240px] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
