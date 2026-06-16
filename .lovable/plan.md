# Selezione talent lato cliente sulla pagina round pubblica

Aggiunge al link condiviso `/round/:token` la possibilità per il cliente di confermare/scartare i talent. Lettura libera; selezione protetta da password gestita solo server-side.

## 1. Schema e funzioni DB (una sola migrazione)

```sql
create extension if not exists pgcrypto;

alter table public.castings
  add column if not exists client_password_hash text;
```

### RPC `set_casting_client_password(p_casting_id uuid, p_password text)`
- `SECURITY DEFINER`, `search_path = public`.
- Richiede `auth.uid()` non null e che l'utente sia staff (`public.is_staff(auth.uid())`); altrimenti errore.
- Se `p_password` è null/'' → `client_password_hash = null` (rimuove password).
- Altrimenti `update castings set client_password_hash = crypt(p_password, gen_salt('bf', 10)) where id = p_casting_id`.
- GRANT EXECUTE TO authenticated.

### RPC `get_casting_client_password_status(p_casting_id uuid) returns boolean`
- `SECURITY DEFINER`, staff-only. Ritorna `client_password_hash is not null`. Usata dall'owner per mostrare "password impostata".
- GRANT EXECUTE TO authenticated.

### RPC `confirm_round_selection(p_token text, p_password text, p_selected uuid[]) returns jsonb`
- `SECURITY DEFINER`, `search_path = public`. GRANT EXECUTE TO anon, authenticated.
- Risolve round da `share_token` con `status = 'shared'`; se non trovato → `raise exception 'invalid_link'`.
- Calcola "ultimo round del ruolo": `max(created_at)` su `casting_rounds` con stesso `casting_role_id`. Se il round risolto non è l'ultimo → `raise exception 'round_locked'`.
- Carica `castings.client_password_hash` del casting del round. Se null → `raise exception 'password_not_set'`. Verifica `client_password_hash = crypt(p_password, client_password_hash)`; se falso → `raise exception 'invalid_password'` (messaggio generico).
- Filtra `p_selected` agli `role_talents.id` realmente presenti in `casting_round_talents` per quel round; gli id estranei sono ignorati.
- Update transazionale sui `role_talents` del round:
  - id in selezione valida → `company_status = 'confirmed'`
  - non selezionati → `company_status = 'rejected'`
- Ritorna `jsonb_build_object('ok', true, 'confirmed', n_confirmed, 'rejected', n_rejected)`.

Nessuna modifica alle RLS delle tabelle: rimangono chiuse a `anon`. L'accesso pubblico esiste solo via RPC `SECURITY DEFINER`.

### Estensione `get_shared_round`
La RPC esistente già ritorna i talent. Aggiungere a ciascun talent il campo `company_status` (da `role_talents.company_status`) e al payload root due flag:
- `is_latest_round` (boolean): vero sse questo round è l'ultimo del suo ruolo.
- `has_password` (boolean): vero sse il casting ha `client_password_hash` non nullo.

Questi servono al client per decidere se mostrare i controlli di selezione e per pre-spuntare i talent già `confirmed`. Non espongono dati sensibili.

## 2. UI lato owner (impostazione password)

In `OwnerRoundDetail.tsx` (dove c'è già il pulsante "Condividi"/copia link), aggiungere accanto un piccolo riquadro "Password cliente":
- Mostra stato attuale ("Password impostata" / "Nessuna password") chiamando `get_casting_client_password_status(casting_id)`.
- Input password + pulsante "Salva password" → chiama `set_casting_client_password`.
- Pulsante "Rimuovi" se già impostata.
- Hint: "Comunica la password al cliente insieme al link. Senza password il cliente vede ma non può confermare."

Nessuna password viene mai letta dal client: si fa solo `set` e `status` (booleano).

## 3. UI lato cliente in `src/pages/shared/SharedRound.tsx`

- La galleria talent (`TalentCardWeb`) resta visibile senza password.
- Se `is_latest_round` è falso: mostra banner in alto "Selezione chiusa — round superato da uno più recente". Nessun controllo, nessun pulsante. Per ciascun talent, badge readonly che riflette `company_status` ('confirmed' verde, 'rejected' rosso tenue, altro nulla).
- Se `is_latest_round` è vero:
  - Su ogni card un controllo "Conferma" (checkbox grande, area tap ampia, mobile-first). Stato locale `selected: Set<roleTalentId>`, pre-popolato con i talent il cui `company_status === 'confirmed'`.
  - Footer sticky con contatore "X selezionati" e pulsante primario "Conferma selezione".
  - Click sul pulsante → apre `Dialog` con un solo campo password e pulsante "Conferma". Submit chiama `supabase.rpc('confirm_round_selection', { p_token, p_password, p_selected: Array.from(selected) })`.
  - Errore con messaggio `invalid_password` o codice generico → toast "Password non corretta". Nessun altro dettaglio.
  - Errore `round_locked` → toast "Selezione non più disponibile" e refetch.
  - Errore `password_not_set` → toast "Selezione non ancora abilitata, contatta l'agenzia".
  - Successo → toast "Selezione confermata", chiusura dialog, refetch della query `["shared-round", token]` per riflettere i nuovi `company_status`. La selezione resta modificabile finché il round è l'ultimo.

Responsive: il dialog password e il pulsante sticky sono pensati per mobile (pulsante full-width, padding generoso).

## 4. Vincoli rispettati
- Password mai inviata né verificata nel client: solo dentro la RPC. Hash bcrypt via `pgcrypto`, mai in chiaro nel DB.
- Nessuna apertura RLS ad `anon` su tabelle: tutto via RPC `SECURITY DEFINER`.
- Niente notifiche talent in questa fase.
- Lo stato selezione usa `role_talents.company_status` esistente; nessun nuovo campo.

## 5. Dettagli tecnici (riferimento)
- File toccati frontend: `src/pages/shared/SharedRound.tsx` (selezione + dialog password), `src/pages/owner/OwnerRoundDetail.tsx` (riquadro password cliente). Eventuale nuovo `src/hooks/useCastingClientPassword.ts` per le due RPC owner.
- Migrazione SQL singola con: estensione pgcrypto, colonna, tre nuove RPC, ricreazione di `get_shared_round` per aggiungere `is_latest_round`, `has_password`, e `company_status` per talent.
- Tipi Supabase si rigenerano dopo l'approvazione della migrazione.
