# Data di nascita + Codice fiscale

## 1. Checkbox "Confermo di aver compiuto 18 anni"

- Testo senza asterisco: "Confermo di aver compiuto 18 anni".
- Spostata alla destra del cluster giorno/mese/anno, sulla stessa riga (in colonna sotto su mobile).
- Non più cliccabile a mano: si spunta automaticamente quando la data di nascita indica almeno 18 anni compiuti, si toglie se la data è vuota o l'età è inferiore.
- Se la data indica meno di 18 anni resta l'errore già presente ("Devi avere almeno 18 anni").

## 2. Codice fiscale con controllo in tempo reale

Mentre si digita:
- Formato: 16 caratteri con il pattern italiano corretto (6 lettere, 2 cifre, 1 lettera mese, 2 cifre giorno, 1 lettera + 3 caratteri comune, 1 carattere di controllo).
- Carattere di controllo (checksum) calcolato e confrontato: se non torna, messaggio "Codice fiscale non valido".
- Coerenza con i dati già inseriti: se data di nascita e sesso sono compilati e non corrispondono al codice, avviso "Il codice fiscale non corrisponde a data di nascita / sesso" (avviso, non blocco del salvataggio).
- Nessun errore mostrato finché il campo è vuoto o incompleto (meno di 16 caratteri): il messaggio compare solo a lunghezza piena.
- Se la cittadinanza non è italiana, si applica solo il controllo di lunghezza attuale (nessun checksum).

## Dettagli tecnici

- Nuovo helper `src/lib/fiscalCode.ts`: `validateFiscalCode(code)` con regex + algoritmo di controllo CIN, e `fiscalCodeMatchesBirth(code, birthDate, gender)` (decodifica mese/giorno con offset 40 per il sesso femminile).
- `HeadCard.tsx`: la checkbox diventa derivata (`age_confirmed` calcolato da `birth_date` in un effetto che chiama `set("p","age_confirmed", ...)` solo quando il valore cambia), resa `disabled` e affiancata al `FieldCluster` in un contenitore flex.
- `FormFields.tsx`: `FloatingInput` riceve prop opzionale `error?: string` per bordo/testo di errore; `ProfileCheckbox` supporta stato disabilitato ma spuntato con stile leggibile.
- `DocumentsCard.tsx`: stato locale di validazione derivato dal valore corrente, passa `error` a `FloatingInput`.
- `ProfileFormContext.tsx`: `validate()` usa `validateFiscalCode` al posto del solo controllo di lunghezza (la coerenza con nascita/sesso resta solo avviso in UI).
