## Modifica

Nella pagina `/owner/castings` (`src/pages/owner/OwnerCastings.tsx`), wrappare l'intera tabella (header colonne + righe `CastingRow`) in un contenitore bianco con lo stile `.dc-card` (sfondo bianco, `rounded-3xl`, `shadow-sm`), coerente con le altre superfici del design system.

## Dettagli

- Avvolgere il blocco `<div>` che contiene l'header a griglia e il map dei `CastingRow` in un `<div className="dc-card overflow-hidden">`.
- Rimuovere il `border-b` inferiore dall'ultima riga se necessario per un bordo pulito dentro il box.
- Filtri (`CastingFilters`) e header pagina restano fuori dal box, sullo sfondo cream come ora.
- Lo stato vuoto ("Nessun casting trovato") e gli skeleton di caricamento vengono anch'essi inseriti nel box bianco per coerenza.

Nessun cambio di logica, solo presentazione.