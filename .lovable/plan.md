## Pagina pubblica `/round/:token`

Vista cliente accessibile via link condiviso, **senza login**. Tutta la lettura passa per una RPC dedicata; nessuna policy RLS viene aperta ad `anon`.

### 1. Backend: RPC + edge function

**Migration — RPC `public.get_shared_round(p_token text)`**
- `SECURITY DEFINER`, `STABLE`, `SET search_path = public`.
- Trova `casting_rounds` con `share_token = p_token AND status = 'shared'`. Se non trovato → ritorna `jsonb` vuoto `{}` (la pagina mostra "Link non disponibile"); zero leak di esistenza.
- Ritorna un singolo `jsonb` con:
  ```jsonc
  {
    "round": { "id", "label", "field_preset", "shared_at" },
    "casting": { "title" },          // solo il titolo, niente altro
    "role":    { "name" },            // solo il nome del ruolo
    "talents": [
      {
        "role_talent_id",
        "pdf_path",                   // path nel bucket, non URL
        "profile": { ...stesse colonne usate da fetchRoundTalents.mapToTalent },
        "attributes": { ...colonne talent_attributes },
        "media": [ { url, sort_order, category, media_type } ]  // solo main_photos
      }
    ]
  }
  ```
  Il client riusa `mapToTalent` + `resolveCard(preset)` esattamente come oggi, senza duplicare logica di campi.
- Filtri di proiezione: `media_type = 'photo' AND category = 'main_photos'`, ordinati per `sort_order`.
- `GRANT EXECUTE ON FUNCTION public.get_shared_round(text) TO anon, authenticated;`
- **RLS delle tabelle resta invariata** (chiusa per anon). La definer accede grazie al security definer.

**Edge function `get-round-pdf-url`** (verify_jwt = false)
- Input: `{ token, roleTalentId }` con validazione zod.
- Cerca con service role il round (`share_token=token, status='shared'`) e il `casting_round_talents.pdf_path` corrispondente. Se non trova → 404.
- Crea `signed URL` (TTL 300s) sul bucket privato `casting-pdfs` e la restituisce. Nessun URL permanente esposto.
- CORS abilitato.

### 2. Frontend: route pubblica

**`src/pages/shared/SharedRound.tsx`** (route `/round/:token` registrata in `App.tsx` **fuori** da `ProtectedRoute` e da `OwnerLayout`).
- React Query: `["shared-round", token] → supabase.rpc('get_shared_round', { p_token: token })`.
- Stati:
  - Loading: skeleton minimale.
  - Vuoto / errore: schermata neutra "Link non disponibile" (logo dotCasting + frase, nessun dettaglio tecnico, nessun retry button).
  - OK: header + lista card.
- Header sobrio: logo dotCasting (asset esistente), titolo `{casting.title} — {role.name}` in Tenor Sans uppercase, sottotitolo con `round.label`. Nessun riferimento alla dashboard interna.
- Lista talent: una `TalentCardWeb` per riga, alimentata da `resolveCard(mapToTalent(item.profile + attributes + media), preset)` (riutilizzo puro, niente duplicazione logica).
  - Sotto la card: bottone "Scarica PDF" → invoca `supabase.functions.invoke('get-round-pdf-url', { body: { token, roleTalentId } })`, apre l'URL firmato in nuova tab. Bottone disabilitato se `pdf_path` è null.
- Layout: mobile-first, colonna singola sempre (anche desktop max-w-3xl centrato). Background cream del progetto.
- Tipografia/colori conformi al design system (no Inter, headings Tenor Sans).

**Helper riuso `mapToTalent`**: estrazione in `fetchRoundTalents.ts` resta utilizzabile importando solo `mapToTalent` con il payload assemblato dall'RPC. Aggiungerò un piccolo adapter `mapRpcTalent(item)` che compone `{ ...profile, attributes: [attributes], media }` e chiama `mapToTalent` esistente.

### 3. Sicurezza — riepilogo
- Nessuna tabella diventa leggibile per `anon`.
- Unica superficie esposta: una RPC che restituisce **solo** il payload del round se `status='shared'`.
- PDF mai accessibili tramite URL pubblico: signed URL a 5 minuti generato da edge function previa validazione token + appartenenza del `roleTalentId` al round.
- Nessun tracciamento accessi (esplicitamente fuori scope).

### 4. Fuori scope
- Analytics / logging accessi.
- Watermark, scadenza del token, revoca esplicita (esiste già `status` per "unsharing" eventuale).
- Modifica dello schema esistente o delle RLS già in essere.
- Variazioni a `TalentCardWeb`, `roundPreset`, `FIELD_REGISTRY`, `generateRound`.

### File toccati / creati
- **Migration**: funzione `get_shared_round` + grant execute.
- **Edge function**: `supabase/functions/get-round-pdf-url/index.ts`.
- **Frontend**:
  - `src/pages/shared/SharedRound.tsx` (nuovo)
  - `src/App.tsx` (route pubblica `/round/:token`)
  - `src/lib/casting/fetchRoundTalents.ts` (export di `mapToTalent` + nuovo `mapRpcTalent` adapter)
