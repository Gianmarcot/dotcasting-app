## Obiettivo
Trasformare `/owner` da panoramica generica a una dashboard operativa: tre metriche azionabili, una coda di nuovi talent da valutare (triage), elenco casting attivi con avanzamento, attività recente ripulita. Tutti i riferimenti alle candidature vengono rimossi dalla dashboard.

## 1. Schema DB (migrazione)

Aggiungo due colonne semplici su `profiles`:

```sql
alter table profiles
  add column if not exists triaged_at timestamptz,
  add column if not exists is_shortlisted boolean not null default false;
create index if not exists profiles_triage_idx
  on profiles (triaged_at, created_at desc)
  where triaged_at is null;
```

**Strada scelta per la shortlist:** la `target_shortlist` esistente è scoped per target di casting, quindi NON copre il concetto di "shortlist globale del talent". Aggiungo un flag globale `profiles.is_shortlisted` come suggerito (opzione B). La shortlist per-target resta invariata.

Logica triage: shortlistare (stella) o scartare un talent imposta `triaged_at = now()`. Lo shortlist setta inoltre `is_shortlisted = true`.

Nessun cambio di RLS necessario: i campi sono editabili tramite le policy update di profiles già esistenti per staff.

## 2. Hook nuovi (`src/hooks/useOwnerDashboard.ts`)

Un solo file con hook leggeri, riusando il client supabase:

- `useOwnerActionableStats()` → ritorna `{ toTriage, draftRounds, pendingInvitations }`
  - `toTriage`: count `profiles` con `triaged_at is null` AND `created_at >= now()-30d` AND `onboarding_completed = true`.
  - `draftRounds`: count `casting_rounds` con `status = 'draft'`.
  - `pendingInvitations`: count `role_talents` con `talent_status = 'invited'`.
- `useTriageQueue(limit=20)` → ultimi profili non triaged, con foto principale (riuso pattern di `useTalentsMainPhotos`). Restituisce id, nome, city, age, photo.
- `useTriageTalent()` mutation → `{ profileId, action: 'shortlist' | 'discard' }` → update `profiles` { triaged_at: now(), is_shortlisted: action==='shortlist' ? true : existing }. Invalida `triage-queue` e `owner-actionable-stats`.
- `useActiveCastingsWithProgress()` → castings `status='active'` con i loro `casting_roles` e per ciascun ruolo `{ confirmed, target_count }`. `confirmed` da `role_talents` con `company_status='confirmed'`; `target_count` dal campo del ruolo (o `casting_targets` se è lì — verifico nella prima query e uso quello disponibile).
- `useOwnerRecentActivity(limit=10)` → riscrivo la query: SOLO `castings` creati, `casting_invitations` con `status in ('accepted','declined')` (talent che risponde), `casting_rounds` con `status='shared'` (round condiviso). Niente `applications`.

## 3. Componenti nuovi

In `src/components/owner/dashboard/`:

- `ActionableStatCard.tsx` — card cliccabile con label, count, icona, link. Stile `.dc-card`. Quando `count > 0`, numero in colore accent ambra (token semantico `text-status-warning` o equivalente già usato; verifico in `index.css`). Quando 0, `text-foreground` neutro.
- `TriageQueueStrip.tsx` — striscia orizzontale scrollabile (`overflow-x-auto snap-x`) di `TriageTalentCard`. Empty state "Nessun nuovo talent da valutare". Click card → apre `TalentPreviewDrawer` esistente, passando `extraAction = { label: 'Scarta', onClick: discard }`.
- `TriageTalentCard.tsx` — formato 5:7, foto coprente con fallback iniziali su `bg-charcoal`. Stella in alto a destra (button) → shortlist + rimuove dalla coda (mutation). Overlay nome + "città · età". Larghezza fissa (es. `w-40`).
- `ActiveCastingsList.tsx` — per ogni casting attivo: titolo + lista ruoli con `<Progress value={confirmed/target*100} />` e label `X/Y confermati`. Click sul casting → `/owner/castings/:id`.
- `RecentActivityFeed.tsx` — riusa l'attuale visual (icona + titolo + descrizione + data relativa), ma da `useOwnerRecentActivity`. Icone differenziate per `casting_created`, `invitation_response`, `round_shared`.

## 4. Riscrittura `OwnerDashboard.tsx`

Sostituisco completamente il body con:

```text
Header (titolo + CTA "Crea casting")
Grid 3 col → 3x ActionableStatCard (su mobile stack)
TriageQueueStrip (full width)
Grid 2 col → ActiveCastingsList | RecentActivityFeed  (su mobile stack)
```

Rimuovo: card "Talenti totali", "Casting attivi", "Candidature totali", riquadro "Candidature recenti", icona/eventi di tipo `application` dall'attività. Rimuovo import di `useDashboardStats`, `useRecentApplications`.

## 5. Vincoli e dettagli

- Responsive: `grid-cols-1 md:grid-cols-3` per stat, `grid-cols-1 lg:grid-cols-2` per casting/attività, striscia triage sempre `overflow-x-auto` con `snap-x`.
- Nessun cambio a `useDashboardStats` (può restare, ma non più usato in dashboard) — lo lascio in modo che altre pagine eventuali non si rompano (verifico chi lo importa: se solo OwnerDashboard, lo cancellerò per pulizia).
- Lo "Scarta" sta solo dentro il drawer come azione secondaria piccola, non sulla card.
- Nessuna nuova sezione per funzioni non attive (niente candidature, niente provini).

## File toccati
- `supabase/migrations/<new>.sql` — colonne `triaged_at`, `is_shortlisted` + indice.
- `src/hooks/useOwnerDashboard.ts` (nuovo).
- `src/components/owner/dashboard/*` (nuovi 5 file).
- `src/pages/owner/OwnerDashboard.tsx` (riscritto).
- Eventuale rimozione `src/hooks/useDashboardStats.ts` se non più referenziato.
