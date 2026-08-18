# Allineamento profilo talent al Figma + fix comportamenti

Confronto tra l'estratto Figma e la pagina attuale (`/talent/profile`). La foto profilo resta come è ora.

## Differenze rilevate rispetto al Figma

1. **Data di nascita** — oggi Giorno/Mese/Anno usano lo spacing standard (32px) e occupano tutta la colonna. Nel Figma sono un blocco unico compatto con 8px tra i tre campi e larghezza ridotta.
2. **Luogo di nascita** — nel Figma Regione, Provincia e Città sono tutte tendine; oggi Città è un campo di testo libero (e Regione/Provincia sono tendine solo se lo Stato è Italia).
3. **Forza del Profilo** — le voci mancanti con il "+" sono statiche; nel Figma sono elementi cliccabili che portano alla sezione corrispondente. Anche l'etichetta "Competenze" non compare tra le voci attuali (oggi: Anagrafica, Data di nascita, Contatti, Indirizzo, Documenti, Foto, Misure, Ruoli, Biografia, Lingue).
4. **Chevron del box Forza del Profilo** — nel Figma punta verso l'alto quando il box è aperto; oggi punta verso il basso.

Il resto dell'impaginazione (card, titoli, griglie a 2 colonne, contatti, social, radio Sesso/Rappresentanza) corrisponde già al Figma.

## Comportamenti da sistemare

1. **Salto del campo al click** — l'input è oggi renderizzato in due varianti (una nascosta e una assoluta) che si scambiano quando la label diventa floating: da qui il micro-salto. Verrà unificato in un solo input sempre montato, con lo spazio della label sempre riservato: la label cambia solo dimensione/posizione, l'altezza del campo non cambia mai.
2. **Focus multiplo** — nella variante non-floating il blur non azzera lo stato di focus, quindi più campi restano "accesi" in contemporanea. Con l'input unificato lo stato di focus si spegne sempre al blur; in aggiunta il focus viene derivato dall'elemento realmente attivo, così solo un campo per volta risulta in focus.
3. **Gruppi di campi con spacing 8px** — introduzione di un contenitore per "campi che formano un componente unico" (usato per Data di nascita, e coerente con prefisso+numero di telefono che già usa 8px).
4. **Voci "+" cliccabili** — ogni voce mancante porta alla sezione relativa con scroll animato e un breve evidenziamento della card di destinazione.
5. **Regione / Provincia / Città a tendina** — selezione a cascata: Stato → Regione → Provincia → Città, con le opzioni città filtrate per provincia. Fuori dall'Italia i campi restano a testo libero come oggi (non esiste un dataset equivalente).

## Dettagli tecnici

- `src/components/profile/fields/FormFields.tsx`
  - `FloatingInput` / `FloatingTextarea`: un solo `<input>`/`<textarea>` sempre montato; label sempre presente con transizione di scala/posizione; altezza del guscio fissa (`min-h-16`) per eliminare il reflow; `onBlur` azzera sempre il focus.
  - Nuovo `FieldCluster` (gap 8px, larghezza contenuta) per i gruppi trattati come componente unico.
- `src/lib/profileOptions.ts` + nuovo modulo dati comuni
  - Aggiunta di un dataset comuni italiani raggruppati per provincia, caricato in modo lazy (import dinamico) per non pesare sul bundle iniziale; se il dataset non è disponibile per una provincia, il campo Città resta a testo libero.
- `src/components/profile/fields/AddressFields.tsx`
  - `GeoFields`: Città diventa `FloatingSelect` quando Stato = Italia ed è selezionata la provincia; cascata estesa (cambio provincia azzera città).
- `src/components/profile/v2/HeadCard.tsx`
  - Data di nascita dentro `FieldCluster` con gap 8px e larghezza compatta come da Figma.
- `src/components/profile/v2/ProfileStrengthCard.tsx`
  - Ogni voce mancante diventa un `button` che fa scroll all'ancora della sezione; chevron ruotato correttamente in stato aperto; allineamento etichette a quelle del Figma (inclusa "Competenze" per le abilità).
- `src/pages/talent/TalentProfileV2.tsx`
  - Assegnazione di `id` ancora a ciascuna card di sezione per il target dello scroll.

Nessuna modifica a database, salvataggio globale o barra "Salva": solo presentazione e interazione dei campi.
