// Edge Function: stripe-webhook
// Riceve i webhook da Stripe per aggiornare gli abbonamenti dei nutrizionisti.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature")
    if (!signature) {
      return new Response("Missing signature", { status: 400 })
    }

    const body = await req.text()
    // Qui verificheremmo la firma con la chiave segreta di Stripe
    const event = JSON.parse(body)

    // Log dell'evento ricevuto
    console.log(`Ricevuto evento Stripe: ${event.type}`)

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
