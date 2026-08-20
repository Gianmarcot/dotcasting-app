# Registrazione: seconda porta per il caso tutore

Nessuna migrazione: le colonne (`profiles.guardian_user_id`, tabella `guardians`) esistono già.

## Cosa vede l'utente

Sulla pagina di registrazione, sotto il titolo, compare una CTA testuale:

- in modalità normale: "oppure registra un minore o un adulto di cui sei tutore"
- in modalità tutore: CTA simmetrica per tornare alla registrazione normale

Cambia solo il titolo (e il sottotitolo). Il form è identico nelle due modalità:

```text
email
password
ripeti password
[ ] Ho letto e accetto i termini e le condizioni
[ ] Confermo di essere maggiorenne
```

Entrambe le spunte sono obbligatorie: il pulsante di registrazione resta disabilitato
finché non sono valorizzate, con errore contestuale dopo il primo tentativo.
La conferma di maggiore età si riferisce sempre a chi crea l'account — stesso campo,
stesso significato, nessuna logica condizionale.

La modalità tutore vive in un parametro dell'URL, così la CTA è un link condivisibile
e il refresh non la perde. Le due CTA non fanno altro che cambiare quel parametro.

## Cosa si porta dietro

La modalità è l'unica cosa che la registrazione consegna all'onboarding, ed è persistita
sull'account (nei metadati dell'utente al momento della registrazione), non nello stato
di navigazione: sopravvive all'abbandono e a un nuovo accesso.

Alla prima sessione utile dell'account in modalità tutore vengono predisposti, se
mancanti, la riga del tutore e il collegamento di tutela sul profilo talent del minore.
Entrambi nascono vuoti: li riempirà l'onboarding.

## Dettagli tecnici

- `src/pages/AuthPage.tsx`
  - legge la modalità da `useSearchParams` (`?mode=guardian`); `signupMode = "guardian" | "self"`.
  - titolo/sottotitolo dipendono da `isLogin` e da `signupMode`; il form no.
  - due `ProfileCheckbox` (`terms_accepted`, `age_confirmed`), visibili solo in registrazione;
    validazione client prima di `signUp`.
  - le CTA di switch sono `Link` verso `/auth?mode=guardian` / `/auth`, mostrate solo in registrazione.
- `src/contexts/AuthContext.tsx`
  - `signUp(email, password, options?: { signupMode })` passa `options.data = { signup_mode }`
    a `supabase.auth.signUp`, così la modalità resta sui metadati dell'account.
- Nuovo `src/hooks/useGuardianBootstrap.ts` (invocato dove esiste già una sessione, es. dentro
  `TalentOnboarding`): se `user.user_metadata.signup_mode === "guardian"`
  1. `upsert` su `guardians` con `user_id = auth.uid()` (tutti i campi vuoti) — coperto dalla policy esistente;
  2. `update profiles set guardian_user_id = auth.uid() where user_id = auth.uid() and guardian_user_id is null`
     — coperto dalla policy esistente sul profilo proprio.
  Idempotente: se le righe esistono già non fa nulla. Nessuna scrittura server-side necessaria,
  quindi nessuna edge function.
- Nuovo helper `src/lib/signupMode.ts` con lettura tipata della modalità dai metadati, così
  l'onboarding potrà derivare "una persona o due" senza duplicare stringhe.
- I termini si spostano nella registrazione: la checkbox omonima viene rimossa dal primo step
  di onboarding (`BasicInfoStep.tsx` + validazione in `TalentOnboarding.tsx`), per non chiederli due volte.

## Fuori scopo

Login con Apple o Google, recupero password, qualsiasi campo oltre a quelli elencati,
e le differenze del primo step dell'onboarding fra una persona e due (consumeranno la
modalità già persistita, in un intervento successivo).
