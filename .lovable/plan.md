Il problema non è nei dati: il backend restituisce correttamente altezza, peso, occhi, capelli, segni, taglie, lingue e abilità. Il problema è nel codice di mapping: `talent_attributes` arriva come oggetto singolo, mentre il mapper lo tratta come array e quindi scarta quasi tutti i campi fisici.

Piano di correzione:

1. Aggiornare `src/lib/casting/fetchRoundTalents.ts`
   - Far accettare `attributes` sia come array sia come oggetto singolo.
   - Usare una piccola funzione helper per normalizzare il valore prima di costruire il `Talent`.
   - Mantenere invariata la query e la sicurezza dei dati.

2. Verificare la mappatura di Corrie
   - Controllare che il PDF riceva: altezza, peso, occhi, capelli, lunghezza/tipo capelli, lentiggini, taglie, misure, lingue e abilità `Canto`.
   - Verificare sia la preview `/dev/card-preview` sia il flusso reale di generazione PDF, perché entrambi usano lo stesso mapper.

3. Nessuna modifica ai dati
   - Non toccherò i dati di Corrie.
   - Non toccherò RLS/policy backend.
   - Non cambierò preset o template, salvo eventuale minimo aggiustamento solo se i campi risultassero presenti ma troppo piccoli da leggere.