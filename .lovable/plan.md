# Gestione account team + riorganizzazione sidebar

## 1. Sidebar: sposta "Impostazioni" in fondo

In `src/components/layout/OwnerSidebar.tsx`:
- Rimuovi "Impostazioni" dalla lista `allNavItems` principale.
- Aggiungilo nel footer della sidebar, **sopra** il pulsante "Esci" (logout), come voce a sé stante con stile coerente alle altre voci di navigazione (icona + label, evidenziazione attiva su `/owner/settings`).
- Stesso trattamento in `MobileBottomNavOwner.tsx` (Impostazioni rimane nel drawer "Altro", spostato in fondo).

## 2. Gestione team multi-utente (tab "Account" in /owner/settings)

Solo gli **Admin** possono invitare/rimuovere membri. Gli **Owner** vedono solo il proprio account (cambio password).

### 2.1 Schema (nuova migrazione)

Nuova tabella `team_invitations` per tracciare gli inviti in sospeso:
- `email` (text, unique con status='pending'), `role` (`app_role`: owner|admin), `invited_by` (uuid → auth.users), `token` (text unique), `status` (pending|accepted|revoked|expired), `expires_at` (timestamptz, default now()+7d), `accepted_at` (timestamptz, nullable).
- RLS: solo Admin può SELECT/INSERT/UPDATE/DELETE. Lettura pubblica via RPC `get_invitation_by_token(token)` per la pagina di accettazione.
- GRANT a `authenticated` e `service_role`.

Nuova RPC `list_team_members()` (SECURITY DEFINER, solo Admin):
- Ritorna `[{ user_id, email, role, created_at, last_sign_in_at }]` joinando `auth.users` + `user_roles`. Necessaria perché `auth.users` non è leggibile dal client.

Nuova RPC `update_member_role(target_user_id, new_role)` (SECURITY DEFINER, solo Admin, blocca self-demote dell'ultimo Admin).

Nuova RPC `remove_team_member(target_user_id)` (SECURITY DEFINER, solo Admin, blocca rimozione di se stesso e dell'ultimo Admin).

### 2.2 Edge Functions

**`invite-team-member`** (verify_jwt validato in-code):
- Input: `{ email, role: 'owner'|'admin' }`.
- Verifica che il chiamante sia Admin via `has_role`.
- Crea record in `team_invitations` con token random.
- Invia email di invito via Lovable Emails (`send-transactional-email`) con link `${VITE_PUBLIC_APP_URL}/accept-invitation?token=...`.
- Se l'utente esiste già: ritorna errore "utente già registrato".

**`accept-team-invitation`** (pubblica):
- Input: `{ token, password }`.
- Valida token (non scaduto, status='pending').
- Crea utente via `supabase.auth.admin.createUser({ email, password, email_confirm: true })`.
- Inserisce ruolo in `user_roles` dal campo `invitations.role`.
- Marca invito come `accepted`.

**`revoke-team-invitation`** (verify_jwt, solo Admin): marca invito come `revoked`.

### 2.3 Frontend

**`src/hooks/useTeamMembers.ts`** (nuovo): `useTeamMembers()`, `useTeamInvitations()`, `useInviteMember()`, `useUpdateMemberRole()`, `useRemoveMember()`, `useRevokeInvitation()`.

**`src/components/owner/settings/TeamMembersSection.tsx`** (nuovo, solo visibile se `userRole === 'admin'`):
- Tabella membri attivi: email, ruolo (Select Owner/Admin), ultimo accesso, azione "Rimuovi" (con AlertDialog di conferma).
- Sezione "Inviti in sospeso": email, ruolo, data, azione "Revoca".
- Pulsante "Invita membro" → Dialog con form (email + ruolo).
- Toast di conferma in italiano.

**`src/components/owner/settings/AccountSection.tsx`** (modifica esistente):
- In cima: dati account personale (email read-only, form cambio password — già presenti).
- Sotto, se Admin: render `<TeamMembersSection />` con titolo "Gestione team".
- Se Owner non-admin: solo dati personali, nessuna sezione team.

**`src/pages/AcceptInvitation.tsx`** (nuovo, route pubblica `/accept-invitation`):
- Legge `?token=` dalla URL.
- Form: nuova password + conferma password.
- Chiama `accept-team-invitation` edge function.
- Su successo: redirect a `/auth` con toast "Account creato, accedi".
- Su token invalido/scaduto: messaggio errore.

**`src/App.tsx`**: aggiungi route pubblica `/accept-invitation`.

## Vincoli rispettati

- Solo Admin gestisce team; Owner vede solo il proprio account.
- Italiano (it-IT) su tutta la UI.
- Nessuna nuova sezione fuori da Impostazioni.
- Singleton `app_settings` invariato.
- Email via Lovable Emails (richiede dominio email configurato — se mancante, mostrerò il dialog di setup al momento dell'implementazione della Edge Function).

## Dettagli tecnici principali

- Tabella `team_invitations` con RLS `has_role(auth.uid(), 'admin')`.
- 3 RPC SECURITY DEFINER per leggere `auth.users` ed evitare race su demote/remove dell'ultimo admin (CHECK: `(select count(*) from user_roles where role='admin') > 1`).
- 3 Edge Functions per invite/accept/revoke; `accept` usa `service_role` per creare utente.
- Cambio ruolo gestito client-side via RPC, non via tabella diretta (per validazioni).
