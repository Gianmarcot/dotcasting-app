# Onboarding: via l'email, dentro la città in cui vivi

## Cosa cambia nel primo passo dell'onboarding

- Sparisce il campo **Email di contatto** (era in sola lettura e occupava spazio: l'indirizzo resta quello dell'account e si modifica dal profilo).
- Compare un campo **"Città in cui vivi"**, testo libero, obbligatorio come gli altri dati del primo passo, subito dopo il numero di telefono. Il valore finisce nella città del profilo, quindi si ritrova già compilato nella sezione Indirizzo.
- Nei profili tutelati (registrazione come tutore) la città viene chiesta nella sezione del minore, dove ci sono nome, data di nascita e sesso.

## Dettagli tecnici

- `src/components/onboarding/steps/BasicInfoStep.tsx`: rimuovere `<AccountEmailField />` e il relativo import; aggiungere un `FloatingInput` "Città in cui vivi" (larghezza coerente, `max-w-[420px]`) con errore da `errors.city`.
- `src/components/profile/fields/BasicInfoFields.tsx`: togliere `contact_email` da `BasicInfoValue`, `BASIC_INFO_REQUIRED` e `validateBasicInfo` (compreso `EMAIL_RE` se non più usato), rimuovere `ContactEmailField` se non referenziato altrove; aggiungere `city` al value, ai campi richiesti e alla validazione ("Inserisci la città in cui vivi").
- `src/pages/talent/TalentOnboarding.tsx`: `EMPTY_BASIC` senza `contact_email` e con `city: ""`; semplificare il filtro degli errori (non serve più scartare `contact_email`); precompilare `city` dal profilo se già presente; in `saveBasic` scrivere `city: basic.city.trim() || null` in entrambi i rami (tutore e non).
- Controllare gli altri consumatori di `BasicInfoValue`/`validateBasicInfo` (profilo talent) e allinearli, senza modifiche a database, RLS o colonne: `profiles.city` esiste già.
