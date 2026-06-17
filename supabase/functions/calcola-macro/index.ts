// Edge Function: calcola-macro
// Riceve parametri di un pasto e calcola il riepilogo dei macronutrienti.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { items } = await req.json()

    // Calcolo la somma di calorie, proteine, carboidrati e grassi
    let calorie = 0
    let proteine = 0
    let carboidrati = 0
    let grassi = 0

    if (items && Array.isArray(items)) {
      items.forEach((item: any) => {
        const quantita = item.quantita_grammi || 0
        const fattore = quantita / 100
        
        calorie += (item.food?.calorie || 0) * fattore
        proteine += (item.food?.proteine || 0) * fattore
        carboidrati += (item.food?.carboidrati || 0) * fattore
        grassi += (item.food?.grassi || 0) * fattore
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          calorie: Math.round(calorie),
          proteine: Math.round(proteine * 10) / 10,
          carboidrati: Math.round(carboidrati * 10) / 10,
          grassi: Math.round(grassi * 10) / 10
        }
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
