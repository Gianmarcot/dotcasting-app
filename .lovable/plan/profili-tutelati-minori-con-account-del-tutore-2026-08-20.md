# Profili tutelati (minori con account del tutore)

## Passo 0 — Ispezione: cosa dice davvero lo schema

Verificato sul database, non ipotizzato:

- **`profiles.id` non ha nessuna foreign key verso gli utenti di autenticazione.** L'unica FK è `profiles.user_id → auth.users(id) ON DELETE CASCADE`. Non c'è niente da rimuovere.
- **`profiles.user_id` è già il concetto di "chi accede e gestisce il profilo"**, è NOT NULL, valorizzato su tutte le 18 righe esistenti, ed è **UNIQUE** (`profiles_user_id_key`).
- **Nessuna riga ha `id = user_id`** (0 su 18): i due valori sono già scollegati di fatto.
- **Nessuna policy e nessuna funzione usa `profiles.id = auth.uid()`.** Tutte passano da `user_id`.

Policy attuali, testuali:

| Tabella | Policy | Clausola |
|---|---|---|
| profiles | Users can view their own profile (SELECT) | `auth.uid() = user_id` |
| profiles | Users can update their own profile (UPDATE) | `auth.uid() = user_id` |
| profiles | Users can insert their own profile (INSERT) | check `auth.uid() = user_id` |
| profiles | Staff can view all profiles (SELECT) | `is_staff(auth.uid())` |
| profiles | Staff can update all profiles (UPDATE) | `is_staff(auth.uid())` |
| talent_attributes | Users can manage their own attributes (ALL) | `exists(profiles where profiles.id = profile_id and profiles.user_id = auth.uid())` |
| talent_attributes | Staff view / insert / update | `is_staff(auth.uid())` |
| talent_media | Users can insert / update / delete their own media | `exists(profiles where profiles.id = profile_id and profiles.user_id = auth.uid())` |
| talent_media | Media is publicly viewable (SELECT) | `true` |
| talent_media | Staff insert / update / delete | `is_staff(auth.uid())` |
| role_talents | Talents can view their published engagements (SELECT) | `published_to_talent = true and profile_id in (select p.id from profiles p where p.user_id = auth.uid())` |
| role_talents | Staff can manage role talents (ALL) | `is_staff(auth.uid())` |

**Conclusione: tutte queste clausole già significano "l'account che gestisce il profilo", quindi funzionano identiche nei tre stati (adulto, minore, post-conversione). Non ne va riscritta nessuna.**

## Il punto critico: le funzioni che confondono "chi gestisce" con "chi è il talent"

Verificate tutte le funzioni che toccano `user_id`. Una sola rompe qualcosa, e lo fa in silenzio:

**`handle_new_user()`** — su ogni nuova registrazione crea *sempre* una riga in `profiles` più il ruolo `talent`. Con la registrazione di un tutore questo produce esattamente ciò che il Passo 2 vuole evitare: se il tutore si registra e poi si crea il profilo del minore, `UNIQUE(user_id)` blocca il secondo inserimento; se invece si riusa la riga creata dal trigger come profilo del minore, tutto funziona. **Quindi la regola operativa è: il profilo del minore È la riga creata dal trigger, non una riga nuova.** Il tutore non ha mai una riga propria in `profiles`, e non serve nessuna modifica al trigger.

Le altre, tutte corrette senza interventi perché leggono "chi gestisce":

- `talent_can_view_casting`, `talent_can_view_casting_role`, `mark_engagement_opened` — passano da `profiles.user_id = auth.uid()`: il tutore vede e apre gli ingaggi del minore. Comportamento desiderato.
- `mark_messages_read` — `communications.talent_user_id = auth.uid()`: le comunicazioni arrivano all'account del tutore. Desiderato.
- `has_role`, `is_staff`, `is_team_manager`, `list_team_members`, `remove_team_member`, `update_member_role` — riguardano `user_roles`, cioè lo staff. Indipendenti da questa modifica.
- `get_shared_round`, `confirm_round_selection`, `get_invitation_by_token`, `get_casting_client_password_status`, `set_casting_client_password` — non usano `user_id` del talent.

Nota semantica, non un bug: le colonne di contatto su `profiles` (`contact_email`, `phone_number`, `whatsapp_number`) su un profilo tutelato restano i contatti *del talent minore*. I contatti del tutore vivono nella nuova tabella `guardians`.

## Cosa cambia in database

### 1. Una colonna su `profiles`

```sql
alter table public.profiles
  add column guardian_user_id uuid references auth.users(id) on delete set null;

comment on column public.profiles.user_id is
  'utente auth che gestisce il profilo; per i profili tutelati è il tutore, non il talent';
comment on column public.profiles.guardian_user_id is
  'valorizzata solo per i profili tutelati (minori). "Profilo tutelato" si deriva SOLO da guardian_user_id is not null.';
comment on constraint profiles_user_id_key on public.profiles is
  'un account auth possiede un solo profilo talent; un tutore ha quindi un account dedicato al minore. Rimuovere questo vincolo richiede logica di selezione profilo in tutta l''area talent.';
```

Nessun rename, nessun backfill, nessuna FK da rimuovere: `user_id` è già NOT NULL e completo.

I tre stati risultanti:

```text
adulto            user_id = utente proprio       guardian_user_id = null
minore            user_id = utente del tutore    guardian_user_id = stesso valore
post-conversione  user_id = invariato            guardian_user_id = null
```

### 2. Tabella `guardians`

Chiave primaria = l'utente auth del tutore, quindi una riga per account e nessuna presenza in `profiles`.

Campi: nome, cognome, data di nascita, conferma maggiore età, prefisso e numero di telefono, prefisso e numero WhatsApp, email di contatto, più `created_at` / `updated_at` con trigger di aggiornamento.

Grant: `select, insert, update, delete` a `authenticated`, `all` a `service_role`. Nessun grant ad `anon`.

Policy: una sola clausola — il tutore legge e scrive esclusivamente `user_id = auth.uid()`. Più una policy di lettura per lo staff (`is_staff(auth.uid())`), coerente con come lo staff vede i profili.

### 3. Nessun indice unico parziale

`UNIQUE(user_id)` su `profiles` già impedisce qualsiasi secondo profilo sullo stesso account, quindi un tutore non può gestirne più di uno. Un solo vincolo, in un punto solo. **Punto da toccare in futuro** se serviranno più minori per tutore: rimuovere `profiles_user_id_key` e introdurre la selezione del profilo attivo in tutta l'area talent.

### 4. Funzione di conversione al compimento dei 18 anni

`public.convert_guardian_profile_to_adult()` — security definer, invocata dall'utente autenticato sul proprio profilo tutelato:

1. Individua il profilo con `user_id = auth.uid()` e `guardian_user_id is not null`; se non esiste, errore `not_a_guardian_profile`.
2. Legge `birth_date`; se nulla → `birth_date_missing`; se `birth_date + interval '18 years' > current_date` → `not_yet_adult`.
3. Calcola la **data effettiva di compimento** (`birth_date + 18 anni`) e la conserva distinta da `now()`.
4. `guardian_user_id = null`, `age_confirmed = true`. `user_id` **resta invariato**.
5. Inserisce in `notifications` (tabella esistente) una riga per ogni utente con ruolo `owner` o `admin`, tipo `guardian_profile_converted`, con payload: `profile_id`, nome e cognome del talent, `adult_since` (data di compimento) e `converted_at` (istante del click). Per i casting in corso la differenza fra le due date è operativa.

La funzione non tocca credenziali: email, telefono e password si aggiornano in un passaggio successivo lato interfaccia.

## Fuori scopo, confermato

Liberatoria per l'uso dell'immagine, blocchi sull'invio di profili minori ai clienti, relazione molti-a-molti fra tutori e minori.

## Dopo l'approvazione

La migrazione va presentata per approvazione separata. In questo piano non viene eseguita.
