Ho testato la funzionalità in preview sul casting “Campari”: nel database ci sono 6 talent collegati al ruolo “Ragazze”, ma nel dialog “Nuovo round” appare “Nessun talent disponibile”.

Causa trovata: il dialog prova a ordinare i ruoli per una colonna inesistente (`sort_order`), quindi la richiesta fallisce con errore 400 prima di caricare i talent.

Piano di fix:
1. Modificare `CreateRoundDialog` per ordinare i ruoli con un campo esistente (`created_at`) invece di `sort_order`.
2. Aggiungere una gestione errore più chiara: se il caricamento dei talent fallisce, mostrare un messaggio nel dialog invece di far sembrare che non ci siano talent.
3. Ritestare in preview: aprire “Nuovo round”, verificare che i 6 talent appaiano sotto “Ragazze”, selezionare almeno un talent e verificare che la selezione aggiorni il contatore/anteprima.