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

## Passo 4 — sincronizzazione dell'email di contatto (l'unico lavoro nuovo in database)

Migrazione da presentare a parte per approvazione, **non eseguita in questo piano**:

1. Funzione `public.sync_profile_contact_email()`, security definer, `search_path = public`: copia `new.email` su `profiles.contact_email` dove `user_id = new.id`.
2. Trigger su `auth.users`: `AFTER INSERT OR UPDATE OF email`. Sull'insert si accoda dopo `on_auth_user_created`, così la riga profilo esiste già.
3. Backfill: `update public.profiles p set contact_email = u.email from auth.users u where u.id = p.user_id and coalesce(p.contact_email,'') <> u.email` — allinea le 20 righe fuori sincrono.
4. `guardians.contact_email` viene **rimossa**: l'email del tutore è quella dell'account, che per un profilo tutelato è già in `profiles.contact_email`.

Una sola regola copre profili normali e tutelati.

## Lato interfaccia — il client non scrive più quella colonna

- `GuardianFields.tsx`: via il campo email e la sua validazione; l'email dell'account resta mostrata come dato in sola lettura.
- `TalentOnboarding.tsx`: smette di inviare `contact_email` sia sul profilo sia sul tutore.
- `ContactsCard.tsx` (profilo v2) e `ContactInfoSection.tsx`: l'email diventa sola lettura, con nota "coincide con l'email di accesso"; niente scrittura.
- `TalentUpdateAccess.tsx`: aggiorna solo l'email dell'account (`auth.updateUser`), niente `contact_email` — la propaga il trigger.
- `useGuardian.ts` / `GuardianCard.tsx`: rimosso `contact_email` dal payload; lettura dell'email dall'utente auth.

## Fuori scopo, confermato

Liberatoria per l'uso dell'immagine, blocchi sull'invio di profili minori ai clienti, relazione molti-a-molti fra tutori e minori.
