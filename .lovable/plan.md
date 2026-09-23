# Errori del primo passo: rossi al momento giusto

## Il problema

Oggi basta scrivere un carattere in un campo qualsiasi del primo passo perché **tutti** i campi ancora vuoti diventino rossi: c'è un unico interruttore ("hai toccato qualcosa") che accende gli errori di tutto il modulo.

## Come si comporterà

- Un campo diventa rosso solo se **quel campo** è stato compilato e poi lasciato vuoto o incompleto: scrivere il nome non fa diventare rossi città, telefono o data di nascita.
- Quando si preme **Avanti** con dati mancanti, allora sì: compaiono tutti gli errori rimasti, così l'utente vede subito cosa manca.
- Il pulsante Avanti resta disattivato finché i dati obbligatori non sono completi (nessun cambiamento).
- Stesso comportamento nella sezione del tutore nei profili tutelati.

## Dettagli tecnici

In `src/pages/talent/TalentOnboarding.tsx`:

- Sostituire `basicTouched` (booleano globale) con:
  - `touched: Set<string>` — chiavi dei campi modificati, popolato dalle `onChange` di `BasicInfoStep` e della sezione tutore (`Object.keys(patch)`, con prefisso `guardian.` per il tutore);
  - `showAllErrors: boolean` — impostato a `true` in `goNext` quando lo step 1 non è valido (uscita anticipata senza salvataggio).
- `visibleErrors` / `guardianVisibleErrors`: filtrare `errors` tenendo solo le chiavi presenti in `touched`, oppure tutte se `showAllErrors`.
- `whatsappError` / `guardianWhatsappError`: mostrati solo se `showAllErrors` o se i rispettivi campi whatsapp sono in `touched`.
- `birth_date` è composta da tre select: considerarla toccata quando arriva un patch con `birth_date` (la `onChange` dei campi data emette `birth_date` anche parziale, quindi l'errore compare solo dopo la prima selezione — comportamento voluto).
- Resettare `showAllErrors` a `false` quando l'utente modifica un campo, così il rosso sui campi non toccati sparisce appena si riprende a compilare.
- Nessuna modifica a validazione, salvataggi, database o componenti condivisi dei campi.
