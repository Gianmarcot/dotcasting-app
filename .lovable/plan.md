# Mezze taglie nelle tendine delle taglie

Aggiungere le misure intermedie alle tendine di taglia giacca, taglia pantaloni e taglia maglia nel profilo talent. I valori già salvati restano validi e selezionati.

## Cosa cambia

- Taglia giacca: si aggiungono i valori intermedi tra le misure attuali (IT 45, IT 47, IT 49, IT 51, IT 53, IT 55, IT 57, IT 59, IT 61, IT 63) con la corrispondenza europea coerente al formato esistente `IT xx | EU yy`.
- Taglia pantaloni: si aggiungono i valori intermedi (IT 39, IT 41, IT 43, IT 45, IT 47, IT 49, IT 51, IT 53, IT 55, IT 57, IT 59) con lo stesso formato `IT xx | EU yy`.
- Taglia maglia: si aggiungono le mezze taglie combinate XXS/XS, XS/S, S/M, M/L, L/XL, XL/XXL, XXL/XXXL, in ordine tra le taglie piene.
- L'ordine delle liste resta crescente, così le tendine restano leggibili.
- Nessuna modifica al database: le opzioni sono liste di testo e le taglie già scelte continuano a mostrarsi normalmente.

## Dettagli tecnici

- Unico punto di modifica: `src/lib/profileOptions.ts`, costanti `JACKET_SIZES`, `PANTS_SIZES`, `SHIRT_SIZES`.
- Le tendine in `src/components/profile/v2/PhysicalCard.tsx` leggono già queste costanti tramite `toOptions`, quindi non richiedono modifiche.
- Le stesse costanti alimentano eventuali filtri e la comp card: nessuna migrazione né cambio di tipo (colonne testo).
