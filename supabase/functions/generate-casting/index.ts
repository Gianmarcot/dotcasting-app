import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei un assistente specializzato nella creazione di casting per produzioni cinematografiche, televisive, pubblicitarie e teatrali.

L'utente ti descriverà un casting in linguaggio naturale. Tu devi restituire ESCLUSIVAMENTE un oggetto JSON valido, senza markdown, senza backtick, senza testo aggiuntivo.

La struttura JSON deve essere:
{
  "title": "string - titolo del casting",
  "client": "string o null - nome del cliente/azienda committente",
  "location": "string o null - luogo delle riprese/evento",
  "dates": "string o null - date previste in formato leggibile",
  "notes": "string o null - note aggiuntive sul casting",
  "roles": [
    {
      "name": "string - nome del ruolo",
      "description": "string o null - descrizione del ruolo",
      "gender": "string o null - M, F, o null se non specificato",
      "age_min": "number o null",
      "age_max": "number o null",
      "budget": "number o null - compenso in EUR",
      "location": "string o null",
      "height_min": "number o null - in cm",
      "height_max": "number o null - in cm",
      "hair_color": "string o null",
      "body_type": "string o null",
      "skills": ["array di stringhe o array vuoto"]
    }
  ]
}

REGOLE IMPORTANTI:
- I campi NON menzionati dall'utente DEVONO essere null, non inventati
- Se l'utente non specifica ruoli, crea almeno un ruolo generico basato sulla descrizione
- Il gender deve essere "M" per maschio, "F" per femmina, null se non specificato
- Le altezze devono essere in centimetri
- I budget devono essere in EUR
- Rispondi SOLO con il JSON, nessun altro testo`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Il prompt è obbligatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Il prompt è troppo lungo (max 5000 caratteri)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Servizio AI non configurato" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_casting",
              description: "Crea un casting con i suoi ruoli dalla descrizione dell'utente",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  client: { type: ["string", "null"] },
                  location: { type: ["string", "null"] },
                  dates: { type: ["string", "null"] },
                  notes: { type: ["string", "null"] },
                  roles: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: ["string", "null"] },
                        gender: { type: ["string", "null"], enum: ["M", "F", null] },
                        age_min: { type: ["number", "null"] },
                        age_max: { type: ["number", "null"] },
                        budget: { type: ["number", "null"] },
                        location: { type: ["string", "null"] },
                        height_min: { type: ["number", "null"] },
                        height_max: { type: ["number", "null"] },
                        hair_color: { type: ["string", "null"] },
                        body_type: { type: ["string", "null"] },
                        skills: { type: "array", items: { type: "string" } },
                      },
                      required: ["name"],
                    },
                  },
                },
                required: ["title", "roles"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_casting" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Troppe richieste, riprova tra qualche secondo" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crediti AI esauriti" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Errore nella generazione AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Risposta AI non valida" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let casting;
    try {
      casting = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      return new Response(
        JSON.stringify({ error: "Risposta AI non valida" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ casting }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-casting error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
