## Obiettivo

Implementare l'end-to-end di un "invio" (round): creazione guidata in 3 step, modifica/rigenerazione finché è in bozza, condivisione con link pubblico. Riuso totale di `FIELD_REGISTRY`, `resolveCard`, `RoundPreset`, `generateRoundPdfs`, `fetchRoundTalents`. Nessuna riscrittura di campi o template.

## 1. Wizard di creazione (sostituisce `CreateRoundDialog`)

Il pulsante "Nuovo invio" sul compartimento ruolo e "Aggiungi invio" tile aprono lo stesso `RoundWizardDialog`, sempre con `roleId` del ruolo corrente. Modale a larghezza fissa (`max-w-4xl`), tre step con barra di progresso in alto.

### Step 1 — Selezione talent
- Bacino: `role_talents` del ruolo dove `company_status = 'confirmed'`. Niente fallback ad altri stati.
- Query nuova in `useRoleConfirmedTalents(roleId)`: join con `profiles` per `stage_name | first_name | last_name | profile_photo_url` (foto principale del profilo).
- Lista verticale, una riga per talent: avatar 40×40 + nome. Checkbox multipla. Header "Seleziona tutti".
- Empty state: "Nessun talent confermato in questo ruolo".
- Disabilita "Avanti" se 0 selezionati.

### Step 2 — Preset campi
- Etichetta invio (input, default `{N}° invio - {nomeRuolo}` precompilato).
- Scorciatoie: bottoni Essenziale / Completo che applicano `PRESET_ESSENZIALE` / `PRESET_COMPLETO`.
- Checklist dei campi raggruppata per `GROUP_LABELS` (anagrafica, fisico, misure, competenze, contatti). Stesso layout già esistente.
- Selettore foto: 3 / 6 / Tutte (mappato su `preset.photoCount`).
- Toggle "Contatto agenzia" (`preset.showAgencyContact`).
- Pannello anteprima a destra (`TalentCardWeb`) sul primo talent selezionato.

### Step 3 — Conferma e generazione
- Riepilogo: ruolo, etichetta, N talent, N campi visibili, N foto, stato finale (Bozza).
- Pulsante "Crea invio e genera PDF".
- Crea `casting_rounds` (status `draft`, `casting_role_id`, `field_preset`), poi `generateRoundPdfs` con progress bar (`done/total`).
- Errori per-talent raccolti e mostrati senza bloccare il resto (come oggi).
- A successo: chiusura modale + redirect a `/owner/castings/:castingId/rounds/:roundId`.

## 2. Modifica invio in bozza

Stessa `RoundWizardDialog` aperta in modalità `mode="edit"` da `OwnerRoundDetail` (pulsante "Modifica", oggi disabilitato). Prefill da `useRoundDetail`:
- talent selezionati = righe correnti di `casting_round_talents`,
- preset = `round.field_preset`,
- label = `round.label`.

Step 3 in edit:
- Calcolo diff talent: `added` / `removed` / `kept`.
- "Salva modifiche" aggiorna `casting_rounds.label` e `field_preset`, applica diff su `casting_round_talents` (insert nuovi, delete rimossi).
- Se preset cambiato → rigenera PDF per tutti i talent ancora dentro.
- Se preset invariato → genera solo per `added`; per `removed` cancella il file su Storage (`storage.from('casting-pdfs').remove([path])`).
- "Rigenera" su round già in bozza, riapplica preset corrente a tutti.

Edit disabilitato quando `status = 'shared'` per coerenza ("Rigenera" rimane disponibile, vedi sotto).

## 3. Condivisione

Pulsante "Condividi" su invio in bozza in `OwnerRoundDetail` e azione Share dal `RoundFolderCard`:

- `useShareRound` produce token url-safe di 32+ caratteri: 24 byte random → base64url (no padding) ≈ 32 char. Sostituisce l'attuale UUID stripped (più corto e meno entropico):
  ```ts
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  ```
- Update `casting_rounds`: `share_token`, `status = 'shared'`, `shared_at = now()`.
- Dialog di conferma post-share con link `${origin}/round/{token}` + bottone "Copia link" + nota: "Da questo momento il cliente vedrà i talent e i PDF correnti".

URL convention: **`/round/{share_token}`**. Aggiornare `RoundFolderCard` (oggi usa `/r/{token}`) e `OwnerRoundDetail` (idem) per uniformare. La pagina pubblica `/round/:token` è fuori scope di questo plan (verrà costruita successivamente).

## 4. Rigenerazione invio condiviso

"Rigenera" in `OwnerRoundDetail` (oggi disabilitato) per round `shared`:
- Conferma con `AlertDialog`: "Rigenera tutti i PDF con i dati attuali dei talent. Non cambia chi è nell'invio".
- Riusa `fetchRoundTalents` sui `role_talent_id` correnti + `generateRoundPdfs` con stesso `preset`. Upsert sovrascrive i file (`upsert: true` già attivo).
- Nessuna modifica a token / status / membri.

## 5. Foto a risoluzione limitata

Tutte le foto consumate dalla card (PDF e web) passano per la trasformazione 1500px lato lungo. Modifica unica in `fetchRoundTalents.mapToTalent`:

```ts
const transformUrl = (url: string) => {
  // url tipo https://<proj>.supabase.co/storage/v1/object/public/talent-media/<path>
  return url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  ) + (url.includes("?") ? "&" : "?") + "width=1500&resize=contain&quality=80";
};
```

Applicato solo all'array `photos`. Nessuna modifica al template PDF né alla card web.

## 6. Cleanup

- `OwnerRoundDetail` abilita "Modifica" (in draft) e "Rigenera" (in shared) collegando i nuovi handler.
- `CreateRoundDialog.tsx` rimosso a favore di `RoundWizardDialog`; tutti i call site (compartimento ruolo, tile "Aggiungi invio") aggiornati.

## File coinvolti

**Nuovi**
- `src/components/castings/rounds/RoundWizardDialog.tsx` — wizard 3 step (create + edit).
- `src/hooks/useRoleConfirmedTalents.ts` — talent con `company_status='confirmed'` di un ruolo, con avatar.
- `src/hooks/useUpdateRound.ts` — applica diff talent + opzionale label/preset.
- `src/hooks/useRegenerateRound.ts` — fetch + generateRoundPdfs sui talent correnti.

**Modificati**
- `src/components/castings/rounds/RoleRoundsCompartment.tsx` — usa `RoundWizardDialog`.
- `src/components/castings/rounds/RoundFolderCard.tsx` — link `/round/{token}` invece di `/r/{token}`; mantiene azioni share/copy/regen che oggi delegano a `OwnerRoundDetail`.
- `src/pages/owner/OwnerRoundDetail.tsx` — abilita Modifica/Rigenera, link `/round/{token}`, conferma rigenerazione, dialog post-share.
- `src/hooks/useShareRound.ts` — token 32+ url-safe.
- `src/lib/casting/fetchRoundTalents.ts` — `transformUrl` per `photos` a 1500px.

**Rimossi**
- `src/components/castings/rounds/CreateRoundDialog.tsx`.

**Non toccati**
- `FIELD_REGISTRY`, `roundPreset.ts`, `generateRound.tsx`, `TalentCardPDF`, `TalentCardWeb` — riusati senza modifiche.
- Schema DB e RLS — `casting_rounds` già ha `share_token`, `status`, `shared_at`, `casting_role_id`.

## Vincoli e note

- Nessuna distruttiva senza conferma: rimozione talent in edit + rigenerazione condivisa hanno `AlertDialog`.
- Permessi invariati: tutto passa per le RLS attuali su `casting_rounds`, `casting_round_talents`, `casting-pdfs`.
- Responsive: wizard a colonna singola sotto `md`; anteprima Step 2 spostata in tab "Anteprima" su mobile.
