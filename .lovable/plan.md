# Apri la gestione team agli Owner

Rimuovo il vincolo "solo Admin": sia Owner che Admin potranno invitare membri, cambiare ruoli e rimuovere altri membri del team.

## Modifiche

### 1. Database (migrazione)

Aggiorno le 3 RPC SECURITY DEFINER per accettare entrambi i ruoli:
- `list_team_members()` — controllo `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')`.
- `update_member_role(p_user_id, p_new_role)` — stesso check.
- `remove_team_member(p_user_id)` — stesso check.
Mantengo intatte le tutele: non rimuovere te stesso, non rimuovere/declassare l'ultimo Admin.

Aggiorno la policy RLS su `team_invitations`:
- `USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'owner'))`.

### 2. Edge function `invite-team-member`

Cambio il check da "solo admin" a "owner o admin". Stesso messaggio d'errore in italiano per chi non ha né owner né admin.

### 3. Frontend

`AccountSection.tsx`: cambio la condizione di rendering da
`userRole === 'admin'` a `userRole === 'admin' || userRole === 'owner'`,
così tu (Owner) vedi subito la sezione "Gestione team".

## Note

- L'ultimo Admin resta protetto dai check nelle RPC, anche se ora un Owner potrebbe tentare di declassarlo: la RPC restituisce errore "Non puoi rimuovere l'ultimo Admin".
- Nessun cambio alla pagina pubblica `/accept-invitation`.
- Nessun cambio alla sidebar.
