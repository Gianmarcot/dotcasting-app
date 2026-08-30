# Aggiorna i dati di accesso: campi, telefono, password

Tre correzioni, solo presentazione e riorganizzazione di logica esistente. Nessuna migrazione, nessuna modifica a RLS.

## 1. Sfondo dei campi

La pagina è avvolta in una superficie "muted", che imposta lo sfondo dei campi su bianco; la card interna è però già bianca, quindi i campi risultano invisibili sul loro contenitore.

Correzione: portare la pagina sulla superficie "base" (come la pagina profilo), così i campi tornano cream su card bianca, coerenti con il resto dell'area talent. Il riquadro informativo del cambio email in attesa viene adeguato allo stesso token.

## 2. Rimozione del telefono

Il telefono e il numero WhatsApp si modificano già dalla pagina profilo: qui vengono rimossi.

- Via il blocco telefono/WhatsApp e il relativo stato locale.
- Il salvataggio non scrive più sul profilo: agisce solo su email e password dell'account.
- Testi aggiornati: la pagina parla di email e password, non più di telefono.

## 3. Cambio password unificato

Oggi le impostazioni account hanno un secondo form di password, con regole e stile diversi. Si elimina la duplicazione:

- Nelle impostazioni account, la riga "Password" resta ma il pulsante "Cambia password" porta alla pagina Aggiorna i dati di accesso; il form inline e la sua logica vengono rimossi.
- Anche la riga Email nelle impostazioni smette di dire che l'email non è modificabile e rimanda alla stessa pagina.
- La verifica della password attuale, oggi presente solo nelle impostazioni, viene portata sulla pagina unica: per cambiare password si chiede la password attuale e si verifica prima di applicare la nuova. Per i profili appena convertiti da tutela questa richiesta non si applica (la password attuale è quella del tutore), quindi resta facoltativa in quel caso.
- Regole uniche: minimo 8 caratteri e conferma coincidente, con messaggi sotto i campi.

## Dettagli tecnici

- `src/pages/talent/TalentUpdateAccess.tsx`: `Surface variant="base"`, rimozione di `PhoneFields`, `useUpdateProfile` e stato telefono; aggiunta campo "Password attuale" con re-autenticazione via `signInWithPassword` prima di `updateUser({ password })`; invariata la gestione dello stato di attesa email.
- `src/pages/talent/TalentSettings.tsx`: rimozione di `handlePasswordChange`, dello stato del form e dei tre campi; i pulsanti diventano link a `/talent/aggiorna-accesso`.
- Nessun cambiamento al comportamento del database: `contact_email` continua a essere propagata dal backend alla conferma del nuovo indirizzo.
