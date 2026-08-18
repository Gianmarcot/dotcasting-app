Aggiungere il titolo di gruppo di campi "Luogo di nascita" sopra la riga dei campi geografici di nascita (Stato di nascita, Regione, Provincia, Città) nella prima sezione del profilo talent.

## Modifica
- In `src/components/profile/v2/HeadCard.tsx`, aggiungere il componente `GroupHeading` (o `GroupLabel` se usato come titolo sezione) immediatamente prima della riga `FieldGrid cols={4}` che contiene `GeoFields` per i campi di nascita (`birth_country`, `birth_region`, `birth_province`, `birth_city`).
- Lo stile deve essere coerente con gli altri titoli di gruppo nella pagina (es. "Social media", "Residenza", "Dati bancari").
- Non devono essere modificati altri titoli, campi o logica di salvataggio.