# Fix: Errore creazione Talent da area Admin

## Causa

La Edge Function `create-talent` legge `SUPABASE_PUBLISHABLE_KEY` per costruire il client che valida l'utente chiamante. Nelle Edge Function Supabase la variabile standard esposta automaticamente è `SUPABASE_ANON_KEY` — `SUPABASE_PUBLISHABLE_KEY` può non essere disponibile a runtime, quindi il client viene creato con `undefined` e `getUser()` fallisce silenziosamente, restituendo `401 "Non autorizzato"`.

Inoltre la function ha `verify_jwt = false` in `config.toml` ma non è necessario: vogliamo proprio che Supabase verifichi il JWT a monte. Lasciandolo `false` la function deve fare tutto il lavoro a mano (come ora), e qualsiasi errore di config provoca il 401.

## Fix

1. In `supabase/functions/create-talent/index.ts`:
   - Sostituire `Deno.env.get("SUPABASE_PUBLISHABLE_KEY")` con `Deno.env.get("SUPABASE_ANON_KEY")` (variabile standard sempre presente).
   - Aggiungere un `console.error` nel `catch` finale per loggare l'errore reale e facilitare il debug futuro.

2. In `supabase/config.toml`:
   - Rimuovere il blocco `[functions.create-talent] verify_jwt = false`, lasciando il default. Così Supabase verifica il JWT e la function riceve sempre un Authorization valido.

Nessuna modifica al frontend: `supabase.functions.invoke("create-talent", ...)` allega già automaticamente il token utente.

## Verifica

Dopo il deploy, riprovare la creazione di un talent da `Admin → Talents → Nuovo Talent`: deve restituire 200 e mostrare il toast "Talent creato con successo".
