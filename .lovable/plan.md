## Obiettivo
Quando il cliente conferma la selezione su `/round/:token`, l'owner riceve una notifica visibile nel feed "Attività recente" della dashboard.

## 1. Migration: aggiornare `confirm_round_selection`

Estendere la funzione RPC esistente (mantenendo la logica attuale di validazione token, password, update `role_talents`) aggiungendo, prima del `return`:

- Recuperare `role.name`, `casting.title`, `casting.id`, e il totale talent del round (count su `casting_round_talents`).
- Inserire una riga in `public.notifications` per ogni utente staff (owner + admin) tramite:
  ```sql
  INSERT INTO public.notifications (user_id, type, payload_json)
  SELECT ur.user_id,
         'round_selection_confirmed',
         jsonb_build_object(
           'round_id', v_round.id,
           'casting_id', v_casting.id,
           'casting_title', v_casting.title,
           'role_name', v_role.name,
           'confirmed', v_confirmed,
           'total', v_total
         )
  FROM public.user_roles ur
  WHERE ur.role IN ('owner','admin');
  ```
- La funzione resta `SECURITY DEFINER` quindi l'insert funziona anche senza utente autenticato.
- Nessuna modifica a RLS o GRANT (tabella e policy già esistenti).

## 2. Hook `useOwnerRecentActivity`

In `src/hooks/useOwnerDashboard.ts`:

- Aggiungere `"round_selection_confirmed"` al tipo `OwnerActivityType`.
- Aggiungere una quarta query in `Promise.all` che legge da `notifications`:
  ```ts
  supabase
    .from("notifications")
    .select("id, payload_json, sent_at")
    .eq("type", "round_selection_confirmed")
    .order("sent_at", { ascending: false })
    .limit(limit)
  ```
  Nota: la tabella è filtrata da RLS per `user_id = auth.uid()`, quindi ogni staff vede solo le proprie righe (corretto: la migration inserisce una riga per ciascuno).
- Mappare i risultati in `OwnerActivityItem`:
  - `id`: `sel-${n.id}`
  - `type`: `"round_selection_confirmed"`
  - `title`: `"Selezione confermata"`
  - `description`: `` `${payload.role_name} · ${payload.confirmed} di ${payload.total} talent approvati` ``
  - `timestamp`: `n.sent_at`
- I nuovi item entrano nello stesso `items[]` e vengono ordinati cronologicamente con il sort esistente. Logica precedente invariata.

## 3. Componente `RecentActivityFeed`

In `src/components/owner/dashboard/RecentActivityFeed.tsx`:

- Importare un'icona adatta da `lucide-react` (es. `CheckCircle2`).
- In `renderIcon`, aggiungere il branch:
  ```ts
  if (item.type === "round_selection_confirmed") return <CheckCircle2 className="h-4 w-4" />;
  ```
- Nessun altro cambiamento (titolo e descrizione arrivano già dall'hook).

## File toccati
- Migration SQL (CREATE OR REPLACE FUNCTION `confirm_round_selection`)
- `src/hooks/useOwnerDashboard.ts`
- `src/components/owner/dashboard/RecentActivityFeed.tsx`

## Fuori scope
- Nessuna modifica alla pagina pubblica `SharedRound.tsx`.
- Nessuna modifica alla logica esistente del feed o alle altre query.
- Nessuna modifica alla pagina/route `/owner/notifications` (la notifica vi comparirà automaticamente, ma non è richiesto adattamento UI specifico).
