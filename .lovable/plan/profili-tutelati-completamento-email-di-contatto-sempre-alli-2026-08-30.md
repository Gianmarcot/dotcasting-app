# Profili tutelati — completamento: email di contatto sempre allineata all'account

Ispezione fatta sul database: i Passi 1, 2, 3 e 5 sono **già in produzione**. Resta da fare il Passo 4 e una pulizia coerente su `guardians`.

## Stato accertato adesso

| Elemento | Stato |
|---|---|
| `profiles.guardian_user_id` (uuid nullable, FK `auth.users`) | presente, 1 profilo tutelato |
| COMMENT su `profiles.user_id` | presente, testo richiesto |
| Tabella `guardians` (chiave = utente auth del tutore) | presente, 1 riga |
| Il tutore non ha riga in `profiles` | rispettato |
| `convert_guardian_profile_to_adult()` (Passo 5) | presente: verifica i 18 anni, azzera `guardian_user_id`, lascia `user_id`, notifica staff con `adult_since` **e** `converted_at` |
| Trigger su `auth.users` per l'email | **assente** (esiste solo `on_auth_user_created` → `handle_new_user`) |
| `guardians.contact_email` | **ancora presente**, da rimuovere |
| Righe con `contact_email` diverso dall'email dell'account | **20 su 21**, di cui 17 nulle |

### Passo 3 — verifica RLS, nessuna riscrittura

Tutte usano "chi gestisce il profilo", quindi valgono identiche nei tre stati (adulto, minore, post-conversione). **Nessuna da riscrivere, nessuna usa `profiles.id = auth.uid()`.**

| Tabella | Policy | Clausola attuale |
|---|---|---|
| profiles | Users can view their own profile (SELECT) | `auth.uid() = user_id` |
| profiles | Users can update their own profile (UPDATE) | `auth.uid() = user_id` |
| profiles | Users can insert their own profile (INSERT) | check `auth.uid() = user_id` |
| profiles | Staff can view / update all profiles | `is_staff(auth.uid())` |
| guardians | Guardians can manage their own row (ALL) | `user_id = auth.uid()` (using e check) |
| guardians | Staff can view guardians (SELECT) | `is_staff(auth.uid())` |
| talent_attributes | Users can manage their own attributes (ALL) | `exists(profiles where profiles.id = profile_id and profiles.user_id = auth.uid())` |
| talent_attributes | Staff view / insert / update | `is_staff(auth.uid())` |
| talent_media | Users can insert / update / delete their own media | come sopra, via `profiles.user_id = auth.uid()` |
| talent_media | Media is publicly viewable (SELECT) | `true` |
| role_talents | Talents can view their published engagements (SELECT) | `published_to_talent = true and profile_id in (select p.id from profiles p where p.user_id = auth.uid())` |
| role_talents | Staff can manage role talents (ALL) | `is_staff(auth.uid())` |

Nessun indice unico parziale aggiunto: `profiles_user_id_key` già impedisce un secondo profilo sullo stesso account.

### Verifica critica sulle funzioni SQL che usano `user_id`

Nessuna rompe qualcosa in silenzio, ma una va letta con attenzione:

- `handle_new_user()` — crea **sempre** una riga `profiles` + ruolo `talent` per ogni nuovo account. Regola operativa da mantenere: **il profilo del minore È la riga creata dal trigger**, non una riga nuova; il tutore non ha mai un profilo proprio. Nessuna modifica necessaria.
- `talent_can_view_casting`, `talent_can_view_casting_role`, `mark_engagement_opened` — passano da `profiles.user_id = auth.uid()`: il tutore vede e apre gli ingaggi del minore. Comportamento voluto.
- `mark_messages_read` — `communications.talent_user_id = auth.uid()`: le comunicazioni arrivano all'account del tutore. Voluto.
- `has_role`, `is_staff`, `is_team_manager`, `list_team_members`, `remove_team_member`, `update_member_role` — riguardano lo staff, indipendenti.
- `get_shared_round`, `confirm_round_selection`, `get_invitation_by_token`, `get_casting_client_password_status`, `set_casting_client_password` — non usano `user_id` del talent.
- `convert_guardian_profile_to_adult()` — già corretta: non tocca `user_id`.

Unico punto semantico, non un bug: nel PDF/comp card i contatti di un profilo tutelato vanno risolti sul tutore. È già così in `fetchRoundTalents.ts`.

## Passo 4 — sincronizzazione dell'email di contatto

### Le 3 righe che il backfill sovrascriverebbe (ispezionate)

Nessuna è un profilo tutelato:

| Profilo | Nome | `contact_email` attuale | email dell'account |
|---|---|---|---|
| `1cf50c13-…f021a4` | Mario Rossi | mario@example.com | test-talent-onboarding@example.com |
| `4dca73b4-…0c34d4` | Corrie Burkart | corrieburkart@gmail.com | tvaretti+burkart@gmail.com |
| `5619f40c-…39aca42a` | Gianmarco Varetti | varetti96@gmail.com | gianmarcovaretti@gmail.com |

`guardians`: una sola riga (Sonia Avanzi), `contact_email` **già identica** all'email dell'account (`gianmarcovaretti+tutore@gmail.com`). Rimuovendo la colonna non si perde nessun dato — resta comunque in attesa della tua conferma insieme al backfill.

### Migrazione da eseguire ora (senza backfill, senza drop)

1. `handle_new_user()` aggiornata: crea la riga profilo con `contact_email = new.email` (la riga la crea già lei, quindi nessuna dipendenza dall'ordine dei trigger).
2. Funzione `public.sync_profile_contact_email()`, security definer, `search_path = public`: copia `new.email` su `profiles.contact_email` dove `user_id = new.id`.
3. Trigger su `auth.users` limitato a **`AFTER UPDATE OF email`** (con `when (old.email is distinct from new.email)`). Nessun trigger su INSERT.

### Rinviato alla tua conferma esplicita

- Backfill delle 17 righe con `contact_email` nulla e delle 3 righe sopra.
- `alter table public.guardians drop column contact_email`.

Fino ad allora il client smette di scrivere la colonna e le righe già allineate restano tali; le 3 divergenti continuano a mostrare il valore attuale.

## Lato interfaccia — il client non scrive più quella colonna

- `GuardianFields.tsx`: via il campo email e la sua validazione; l'email dell'account resta mostrata come dato in sola lettura.
- `TalentOnboarding.tsx`: smette di inviare `contact_email` sia sul profilo sia sul tutore.
- `ContactsCard.tsx` (profilo v2) e `ContactInfoSection.tsx`: l'email diventa sola lettura, con nota "coincide con l'email di accesso"; niente scrittura.
- `useGuardian.ts` / `GuardianCard.tsx`: rimosso `contact_email` dal payload; lettura dell'email dall'utente auth.

### `TalentUpdateAccess.tsx` — stato di attesa sul cambio email

`auth.updateUser({ email })` non cambia nulla subito: l'email diventa effettiva solo dopo il click sul link inviato al nuovo indirizzo. Comportamento previsto:

- All'invio, l'app salva l'indirizzo richiesto nei metadati dell'account (`pending_email_requested_at` + `pending_email`), quindi lo stato sopravvive al ricaricamento della pagina e non dipende dallo stato di navigazione.
- Il campo email mostra sempre l'**indirizzo attuale in vigore** (`user.email`) come valore in uso.
- Sotto il campo compare un avviso: "Cambio email in attesa di conferma. Abbiamo inviato un link a *nuovo@indirizzo*: fino al click resta attiva *indirizzo attuale*." Con azione "Invia di nuovo".
- Lo stato si chiude quando `user.email` coincide con l'indirizzo richiesto (Supabase aggiorna la sessione dopo la conferma): l'avviso spariisce e i metadati vengono ripuliti.
- Nessuna scrittura su `profiles.contact_email`: la propaga il trigger del Passo 4 nel momento in cui l'email dell'account cambia davvero.

## Le due conferme richieste

- **Campo email nel profilo**: oggi è un input editabile (`ContactEmailField` in `ContactsCard.tsx`), non un campo disabilitato. Diventa sola lettura. Nota sul token: `--field-bg-disabled` **è già `grey-200`** nei contesti chiari (base e muted, `src/index.css`), quindi non serve alcuna modifica; sui contesti brand/inverse resta `brand-700` / `grey-900`, coerente.
- **Interfaccia di conversione ai 18 anni**: **esiste già**. `MaturityNotice` invoca `convert_guardian_profile_to_adult()` ed è montata in `TalentProfileV2.tsx` insieme a `UpdateAccessNotice`, che rimanda a `/talent/aggiorna-accesso`. Nessun lavoro nuovo qui.

## Fuori scopo, confermato

Liberatoria per l'uso dell'immagine, blocchi sull'invio di profili minori ai clienti, relazione molti-a-molti fra tutori e minori.

