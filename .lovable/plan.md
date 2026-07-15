## Obiettivo
Verificare end-to-end il flusso di invito e accettazione di un nuovo membro team, individuando eventuali bug prima della demo.

## Scenari da testare (via Playwright headless sul preview locale)

### A. Creazione invito (owner autenticato)
1. Login come utente owner corrente (sessione già iniettata nel sandbox).
2. Naviga a `/owner/settings` → sezione "Gestione team".
3. Click "Invita membro" → inserisce email test unica (es. `test+<timestamp>@dotcasting.dev`) e ruolo `editor`.
4. Verifica: 
   - dialog "Invito creato" mostra un link `/accept-invitation?token=...`;
   - la riga appare in "Inviti in sospeso" con badge ruolo e data scadenza;
   - copia link funziona (clipboard).

### B. Validazioni edge function `invite-team-member`
5. Ritentare invito con stessa email → deve revocare il precedente pending e creare uno nuovo (verifico che ci sia una sola riga pending finale).
6. Invitare email malformata → toast di errore "Email non valida".
7. Invitare email di un membro già esistente (l'owner stesso) → errore "Esiste già un utente".

### C. Accettazione invito
8. Apri il link `/accept-invitation?token=...` in contesto anonimo (nuovo context Playwright).
9. Verifica che `get_invitation_by_token` restituisca stato `pending`, email e ruolo corretti.
10. Completa il form di signup con password → deve chiamare `accept-team-invitation` e loggare il nuovo utente.
11. Verifica redirect a dashboard owner e presenza del nuovo user in `list_team_members()`.

### D. Revoca e rimozione
12. Da settings, revoca un invito pending → sparisce dalla lista, DB `status=revoked`.
13. Rimuovi il nuovo membro appena creato → non compare più tra i membri attivi; riprova rimozione dell'ultimo admin → deve fallire con messaggio dedicato.

### E. Log e side-effects
14. Ispeziona `edge_function_logs` per `invite-team-member` e `accept-team-invitation` durante i test — cerco 4xx/5xx.
15. Query di controllo: `select email, status, expires_at from team_invitations order by created_at desc limit 5;`.

## Output atteso
Report sintetico con: passi eseguiti, screenshot chiave (dialog invito + accettazione + lista aggiornata), errori riscontrati e proposte di fix puntuali. Nessuna modifica di codice o schema in questo passaggio: solo test + report; eventuali fix verranno pianificati a valle in base a ciò che emerge.

## Note tecniche
- Uso Playwright con sessione Supabase già iniettata (`LOVABLE_BROWSER_SUPABASE_*`).
- Le email di test resteranno nel DB come "revoked" o utenti orfani: se serve, posso aggiungere uno step finale di cleanup (`delete from team_invitations where email like 'test+%dotcasting.dev'` + `auth.admin.deleteUser` per l'utente creato).
- Nessun invio email reale: il flusso si basa sul link mostrato in dialog.