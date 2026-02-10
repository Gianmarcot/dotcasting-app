
## Creare account Talent da parte dell'Owner

### Panoramica

L'Owner potra creare un nuovo account Talent direttamente dal backoffice, inserendo i dati base (email, nome, cognome). Il sistema creera l'utente, il profilo e il ruolo automaticamente tramite una backend function sicura.

### Perche serve una backend function

La creazione di utenti richiede l'API Admin di Supabase (`supabase.auth.admin.createUser`), che necessita della service role key. Questa operazione non puo essere fatta dal frontend per motivi di sicurezza.

### Modifiche previste

#### 1. Backend function: `create-talent`

Creare `supabase/functions/create-talent/index.ts`:

- Riceve: `email`, `first_name`, `last_name` (opzionali: `gender`, `city`, `country`)
- Verifica che il chiamante sia un Owner/Admin (controlla il JWT e il ruolo nella tabella `user_roles`)
- Crea l'utente con `supabase.auth.admin.createUser()` con una password temporanea generata
- Il trigger `handle_new_user` gia esistente crea automaticamente il profilo e il ruolo "talent"
- Aggiorna il profilo con nome/cognome forniti
- Restituisce i dati del nuovo utente

Aggiornare `supabase/config.toml` per registrare la funzione con `verify_jwt = false` (la verifica avverra nel codice).

#### 2. Dialog frontend: `CreateTalentDialog`

Creare `src/components/talents/CreateTalentDialog.tsx`:

- Form con campi: Email (obbligatorio), Nome, Cognome, Genere, Citta
- Validazione con zod
- Chiama la backend function tramite `supabase.functions.invoke('create-talent', ...)`
- Mostra feedback di successo/errore con toast
- Al successo, invalida la query dei talent per aggiornare la lista

#### 3. Pulsante nella pagina Talents

In `src/pages/owner/OwnerTalents.tsx`:

- Aggiungere un pulsante "Nuovo Talent" nell'header accanto al titolo
- Aprire il `CreateTalentDialog` al click
- Al successo della creazione, la lista si aggiorna automaticamente

### Flusso operativo

```text
Owner clicca "Nuovo Talent"
       |
       v
Compila il form (email, nome, cognome...)
       |
       v
Frontend chiama edge function "create-talent"
       |
       v
Edge function:
  1. Verifica ruolo Owner/Admin del chiamante
  2. Crea utente via Admin API
  3. Trigger DB crea profilo + ruolo "talent"
  4. Aggiorna profilo con nome/cognome
       |
       v
Risposta al frontend -> toast di conferma
Lista talent si aggiorna
```

### Dettagli tecnici

- La password temporanea viene generata casualmente (il talent potra fare "Reset password" per accedere)
- L'utente viene creato con `email_confirm: true` per saltare la verifica email (e l'Owner che garantisce)
- La backend function usa la service role key (gia configurata come secret `SUPABASE_SERVICE_ROLE_KEY`)
- Gestione errore se l'email e gia registrata
