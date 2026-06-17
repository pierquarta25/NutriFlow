// Edge Function: importa-alimenti
// Consente di cercare e importare alimenti da Open Food Facts API in italiano.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("query") || "pasta"

    // Eseguo la chiamata alle API di Open Food Facts
    const response = await fetch(
      `https://it.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=10`
    )
    const data = await response.json()

    // Mappo i prodotti ricevuti per adattarli al nostro database
    const alimenti = (data.products || []).map((prod: any) => {
      const nutriments = prod.nutriments || {}
      return {
        nome: prod.product_name || "Alimento sconosciuto",
        marca: prod.brands || "Generico",
        calorie: Math.round(nutriments["energy-kcal_100g"] || 0),
        proteine: Math.round((nutriments["proteins_100g"] || 0) * 10) / 10,
        carboidrati: Math.round((nutriments["carbohydrates_100g"] || 0) * 10) / 10,
        grassi: Math.round((nutriments["fat_100g"] || 0) * 10) / 10,
      }
    })

    return new Response(
      JSON.stringify({ success: true, data: alimenti }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
