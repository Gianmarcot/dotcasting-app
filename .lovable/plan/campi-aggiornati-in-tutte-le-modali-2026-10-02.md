# Campi aggiornati in tutte le modali

Uniformare i campi di compilazione delle finestre allo stesso standard con etichetta interna usato nel profilo talent, senza trasformare i controlli che hanno una funzione diversa da un normale campo di modulo.

## Cosa cambia

1. Sostituire `Input`, `Textarea` e `Select` tradizionali con `FloatingInput`, `FloatingTextarea` e `FloatingSelect` nelle modali di casting, ruoli, inviti, aziende, target, creazione talent e comunicazioni.
2. Conservare validazioni, messaggi di errore, tipi speciali (email, numero, data e data/ora), valori iniziali e logica di invio esistenti.
3. Lasciare compatti i controlli operativi: barre di ricerca, link di condivisione in sola lettura, filtri inline e selettori dentro righe o tabelle. Questi casi restano correttamente affidati ai componenti base del Design System.
4. Nelle procedure PDF, aggiornare solo gli eventuali campi testuali o select di configurazione; checkbox, selezione foto e controlli di navigazione restano invariati.
5. Adeguare le griglie delle modali affinché i campi da 64px mantengano spaziatura e leggibilità su mobile e desktop.

## Sicurezza e verifica

- Mantenere la validazione Zod già presente e aggiungere limiti client dove il campo libero ne è privo, senza modificare i dati accettati dal backend.
- Verificare compilazione, errori e invio nelle modali principali: nuovo talent, nuovo/modifica casting, invito a un casting, azienda, target e comunicazione.
- Controllare build e resa visiva delle finestre su desktop e mobile.
