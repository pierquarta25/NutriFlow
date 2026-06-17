// Edge Function: bilancia-smart
// Bilancia automaticamente le quantità degli alimenti in un pasto per raggiungere il target.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { items, target_macro } = await req.json()
    
    // Logica di ottimizzazione fittizia per bilanciare i macro
    // Per ora restituiamo le quantità con una leggera variazione proporzionale
    const bilanciati = items.map((item: any) => ({
      ...item,
      quantita_grammi: Math.round((item.quantita_grammi || 100) * 1.1)
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: bilanciati
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
