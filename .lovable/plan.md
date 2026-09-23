# Onboarding: via l'email, dentro la città in cui vivi

## Cosa cambia nel primo passo dell'onboarding

- Sparisce il campo **Email di contatto** (era in sola lettura e occupava spazio: l'indirizzo resta quello dell'account e si modifica dal profilo).
- Compare un campo **"Città in cui vivi"**, obbligatorio come gli altri dati del primo passo, subito dopo il numero di telefono. Il valore finisce nella città del profilo, quindi si ritrova già compilato nella sezione Indirizzo.
- **Perché non un campo del tutto libero**: la città dell'agenzia serve a cercare e filtrare i talent (l'elenco dei filtri è costruito dalle città salvate). Scritta a mano diventa "Milano", "milano", "MIlano", "Milano (MI)" e il filtro si spezzetta. Quindi: il campo si scrive liberamente ma **suggerisce i comuni italiani** mentre digiti; se scegli un suggerimento resta la forma corretta e uniforme.
- Se quello che l'utente scrive non è tra i suggerimenti (vive all'estero, frazione, nome diverso) **il testo viene comunque accettato**: nessun blocco, solo una nota discreta "Città non riconosciuta: la useremo così come l'hai scritta". Niente errore rosso, niente passo bloccato.


## Dettagli tecnici

- `src/components/onboarding/steps/BasicInfoStep.tsx`: rimuovere `<AccountEmailField />` e il relativo import; aggiungere il campo città (`max-w-[420px]`) con errore da `errors.city`. Nei profili tutelati la città sta nella sezione del minore, insieme a nome, data di nascita e sesso.
- Campo città con suggerimenti: nuovo componente `CityField` accanto agli altri campi condivisi, basato su `FloatingInput` + lista di suggerimenti (Command/Popover già nel DS). Sorgente: elenco piatto di tutti i comuni ricavato da `loadComuni()` (`src/lib/geo/comuni.ts`, caricato lazy al focus), match case-insensitive, max ~8 suggerimenti. Valore non riconosciuto: si salva così com'è, con nota informativa sotto il campo (nessun errore di validazione).

- `src/components/profile/fields/BasicInfoFields.tsx`: togliere `contact_email` da `BasicInfoValue`, `BASIC_INFO_REQUIRED` e `validateBasicInfo` (compreso `EMAIL_RE` se non più usato), rimuovere `ContactEmailField` se non referenziato altrove; aggiungere `city` al value, ai campi richiesti e alla validazione ("Inserisci la città in cui vivi").
- `src/pages/talent/TalentOnboarding.tsx`: `EMPTY_BASIC` senza `contact_email` e con `city: ""`; semplificare il filtro degli errori (non serve più scartare `contact_email`); precompilare `city` dal profilo se già presente; in `saveBasic` scrivere `city: basic.city.trim() || null` in entrambi i rami (tutore e non).
- Controllare gli altri consumatori di `BasicInfoValue`/`validateBasicInfo` (profilo talent) e allinearli, senza modifiche a database, RLS o colonne: `profiles.city` esiste già.
