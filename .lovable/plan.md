# Mezze taglie nelle tendine delle taglie

Aggiungere le misure intermedie alle tendine di taglia giacca, taglia pantaloni e taglia maglia nel profilo talent, scritte come coppia di misure secondo lo schema indicato. I valori già salvati restano validi e selezionati.

## Schema dei valori

- Giacca: `IT 44/46 | EU 34/36`, `IT 46/48 | EU 42/44`, ecc. — ogni mezza taglia si scrive come coppia della taglia piena precedente e successiva, sia per IT sia per EU.
- Pantaloni: stesso schema, es. `IT 38/40 | EU 32/34`, `IT 40/42 | EU 34/36`.
- Maglia: coppia di lettere, es. `XXS/XS`, `XS/S`, `S/M`, `M/L`, `L/XL`, `XL/XXL`, `XXL/XXXL`.

Ogni mezza taglia viene inserita subito dopo la taglia piena corrispondente, così l'elenco resta in ordine crescente e alterna taglia piena / mezza taglia come nello screenshot.

## Note

- Nessuna modifica al database: le opzioni sono liste di testo e le taglie già scelte continuano a mostrarsi normalmente.

## Dettagli tecnici

- Unico punto di modifica: `src/lib/profileOptions.ts`, costanti `JACKET_SIZES`, `PANTS_SIZES`, `SHIRT_SIZES`.
- Le tendine in `src/components/profile/v2/PhysicalCard.tsx` leggono già queste costanti tramite `toOptions`, quindi non richiedono modifiche.
- Le stesse costanti alimentano filtri e comp card: nessuna migrazione né cambio di tipo (colonne testo).
