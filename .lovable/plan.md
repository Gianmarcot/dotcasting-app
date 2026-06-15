# Round come cartelle dentro il dettaglio casting

Tre blocchi: migration → compartimenti per ruolo → vista invio.

## 1. Migration schema

Aggiungo colonne a `casting_rounds` per legare il round al ruolo e gestire la condivisione. Le RLS attuali (`Owners manage casting rounds` per owner/admin) coprono già le nuove colonne — nessuna modifica policy richiesta in questo step (l'accesso pubblico via token sarà una RPC separata in un prompt futuro).

```sql
alter table public.casting_rounds
  add column if not exists casting_role_id uuid references public.casting_roles(id) on delete cascade,
  add column if not exists status text not null default 'draft',
  add column if not exists share_token text unique,
  add column if not exists shared_at timestamptz;

create index if not exists idx_rounds_role on public.casting_rounds(casting_role_id);
```

Vincolo soft: `status` libero (`draft` | `shared`), validato dal client. Nessun NOT NULL su `casting_role_id` per non rompere i round esistenti, ma tutti i nuovi round verranno creati con `casting_role_id` valorizzato.

## 2. Corpo del dettaglio casting → compartimenti per ruolo

File: `src/pages/owner/OwnerCastingDetail.tsx`.

- **Rimosso**: la sezione "Confermati dall'azienda" aggregata flat (lines 259–292) e la vecchia `<RoundsSection castingId={castingId!} />` flat (line 295). La query `allRoleTalents` resta perché alimenta `confirmedByRole` mostrato nell'header del compartimento.
- **Nuovo blocco** sotto "Ruoli": rendering di ogni `role` con il nuovo componente `RoleRoundsCompartment` che incapsula header + griglia round del ruolo.
- L'attuale lista `CastingRoleCard` resta invariata sopra (nessun cambiamento al dettaglio ruolo).

Nuovo componente `src/components/castings/rounds/RoleRoundsCompartment.tsx`:
- Header con: nome ruolo, contatore "N confermati" (passato come prop), bottone "Nuovo invio".
- Body: griglia `grid-cols-1 md:grid-cols-2 gap-4` con
  - una `RoundFolderCard` per ogni round del ruolo
  - una `AddRoundCard` tratteggiata in coda
- Stile contenitore: `rounded-2xl border bg-white p-5 space-y-4`.

Nuovo componente `src/components/castings/rounds/RoundFolderCard.tsx`:
- Altezza fissa (es. `h-44`), layout 3 sezioni verticali:
  1. Header: label round (es. "1° invio") + `Badge` stato (Bozza grigio / Condiviso verde).
  2. Striscia foto: max 5 miniature 2:3 ravvicinate (`flex gap-1`), ultima cella "+N" se i talent superano 5. Se 0 talent: una sola cella placeholder con iniziali del round o icona.
  3. Footer: "N talent · data" + icone azione (right-aligned):
     - `draft` → Edit, Share
     - `shared` → Copy link, RotateCcw (rigenera)
- Click card → naviga a `/owner/castings/:castingId/rounds/:roundId`.
- Le miniature sono caricate via una nuova query batch `useRoundPreviewPhotos(roundIds)` che per ogni round prende fino a 5 `profile_photo_url` dai talent agganciati (join `casting_round_talents` → `role_talents` → `profiles`).

Nuovo hook `src/hooks/useRoundsByRole.ts`:
- `useRoundsByRole(castingId, roleIds)` → singola query filtrata per `casting_role_id in (...)` con conteggio talent, ordinata `created_at desc`. Restituisce `Map<roleId, CastingRound[]>`.
- Sostituisce `useCastingRounds` solo nel dettaglio casting; l'hook esistente resta per altre eventuali viste (non rimosso).

Modifica minima a `useCastingRounds`/`useCreateRound`:
- Estendo l'interface `CastingRound` con `casting_role_id`, `status`, `share_token`, `shared_at`.
- `useCreateRound` accetta `casting_role_id` e default `status: "draft"`.

Nuovo dialog `CreateRoleRoundDialog` (wrap del `CreateRoundDialog` esistente):
- Stesso dialog di configurazione preset/talent, ma con `casting_role_id` precompilato. La sezione "Talent da includere" viene filtrata ai soli `role_talents` di quel ruolo (preselezione opzionale: solo `company_status = confirmed` o `shortlisted`).
- Refactor minimo dentro `CreateRoundDialog.tsx`: aggiungo prop opzionale `roleId?: string` che, se presente, limita il filtro e passa `casting_role_id` alla create mutation.

## 3. Vista invio (round detail)

Nuova route: `/owner/castings/:castingId/rounds/:roundId` → `src/pages/owner/OwnerRoundDetail.tsx`. Registrata in `src/App.tsx` accanto alle altre route owner.

Layout:
- Back button "← Torna al casting".
- Barra top:
  - Titolo `round.label` + `Badge` stato.
  - Ricerca per nome (input controllato, filtro client-side sui talent caricati).
  - Toggle "Raggruppa per stato" (mostra sezioni per `company_status` o `talent_status`).
  - Azioni a destra in base a stato: `draft` → "Modifica" + "Condividi"; `shared` → "Copia link" + "Rigenera".
- Griglia talent: riusa **`TalentBoardGrid`** già esistente. Per la virtualizzazione introduco un wrapper `VirtualBoardGrid` che renderizza i talent in batch con `IntersectionObserver` (pagine da 30) — niente nuova dipendenza, soluzione leggera coerente con il vincolo "non duplicare".
- Click su card → apre `TalentPreviewDrawer` (già esistente, riuso diretto). Per "comp card PDF di questo invio" il drawer accetta una prop opzionale `extraAction?: { label, onClick }`: se passata, mostra un bottone extra nel footer del drawer che apre l'URL del PDF di quel talent in questo round (lookup in `casting_round_talents.pdf_path` → signed URL via `useSignedPdfUrl`).

Dati:
- Hook `useRoundDetail(roundId)`: load `casting_rounds` row + `casting_round_talents` con join a `role_talents.profile_id` → profilo + attributes (riusa la proiezione di `useTalents` ma filtrata a quegli id). Restituisce `TalentWithAttributes[]` consumabili dalla board.
- Conta foto/video/PDF per gli "indicatori materiali" sulla card → estendo `TalentBoardCard` con prop opzionale `materialIndicators?: { photos: number; videos: number; hasPdf: boolean }` (additiva, non rompe l'uso attuale dal Database Talenti).

Azione "Condividi":
- Mutation `useShareRound`: genera token via `crypto.randomUUID()`, set `status='shared'`, `share_token`, `shared_at=now()`. Copia in clipboard `/r/:token` (route pubblica da costruire nel prompt futuro — qui solo l'UI di copy).
- Azione "Rigenera": riapre `CreateRoundDialog` in modalità "rigenera" sullo stesso round (regen PDFs, mantiene selezione). Implementazione minima riusando il flusso esistente; non distruttivo.

Mobile: griglia `grid-cols-2`, drawer full-width (già gestito).

## File toccati / creati

Creati:
- `src/pages/owner/OwnerRoundDetail.tsx`
- `src/components/castings/rounds/RoleRoundsCompartment.tsx`
- `src/components/castings/rounds/RoundFolderCard.tsx`
- `src/components/castings/rounds/VirtualBoardGrid.tsx`
- `src/hooks/useRoundsByRole.ts`
- `src/hooks/useRoundDetail.ts`
- `src/hooks/useRoundPreviewPhotos.ts`
- `src/hooks/useShareRound.ts`

Modificati:
- `src/pages/owner/OwnerCastingDetail.tsx` — rimosso confermati flat + RoundsSection, aggiunto compartimento per ruolo.
- `src/components/castings/rounds/CreateRoundDialog.tsx` — accetta `roleId?`, filtra talent e setta `casting_role_id`.
- `src/hooks/useCastingRounds.ts` — interface estesa, `useCreateRound` accetta `casting_role_id` e `status`.
- `src/components/talents/TalentBoardCard.tsx` — prop opzionale `materialIndicators`.
- `src/components/talents/TalentPreviewDrawer.tsx` — prop opzionale `extraAction`.
- `src/App.tsx` — nuova route round detail.

Migration: 1 file.

Non toccati: header casting, `useCastingRoles`, `OwnerCastingRoleDetail`, `RoleTalents`, `CastingRoleCard`, dettaglio ruolo.

## Note esecuzione

- La migration parte per prima e richiede approvazione separata: dopo l'OK procedo con il codice (i tipi auto-rigenerati includeranno le nuove colonne).
- Il componente `RoundHistoryItem` resta nel repo ma non più montato — riferimento per eventuali viste future.
