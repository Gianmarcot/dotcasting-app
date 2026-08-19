Sottigliare le icone di dettaglio casting

Ridurre il tratto delle icone di 64px nella pagina di dettaglio casting del talento (`/talent/applications/:engagementId`), in particolare per `CalendarDays` e `MapPin`, che attualmente usano `stroke-[1]`.

Dettagli tecnici
- File: `src/pages/talent/TalentCastingDetail.tsx`
- Le icone target sono `CalendarDays` e `MapPin`, entrambe con `h-16 w-16 stroke-[1] text-[#1a1a1a]`.
- Cambiare `stroke-[1]` in `stroke-[0.75]` (o `stroke-[0.5]` in base al risultato visivo) per entrambe le icone, lasciando invariate dimensioni, colori, layout e spaziatura.
- Se possibile, valutare di estendere lo stesso stile sottile a `Info` nella colonna destra per coerenza.
- Verificare che il contrasto e la leggibilità rimangano buoni.

Accettazione
- Le icone della sezione "Quando" e "Location" in `TalentCastingDetail.tsx` hanno un tratto visibilmente più sottile, coerente con lo stile del design system.
- La build passa e la pagina si renderizza correttamente.
