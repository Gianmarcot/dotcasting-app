# Larghezza contenuto pagine admin: 1600px

## Obiettivo

Nell'area admin il contenuto delle pagine oggi è limitato a 1280px e resta quindi molto stretto sugli schermi larghi, con margini laterali vuoti. Portiamo il limite a 1600px, così le tabelle e le griglie sfruttano lo spazio disponibile.

## Cosa cambia

- **Un solo punto di modifica**: il contenitore del layout admin (`src/components/layout/OwnerLayout.tsx`, riga 22), che oggi limita il contenuto a `max-w-7xl` (1280px), passa a `max-w-[1600px]`. Il contenuto resta centrato e mantiene gli spazi interni attuali.
- La sidebar a sinistra, l'intestazione mobile e la navigazione in basso non vengono toccate.
- Le singole pagine admin non hanno un limite proprio: ereditano tutte il nuovo valore, quindi database talenti, casting, candidature, aziende, round e impostazioni si allargano insieme.
- I controlli interni con una loro misura (per esempio il campo di ricerca del database talenti, che resta capped a 800px, o la barra di ricerca di un round) non cambiano: sono scelte di leggibilità del singolo elemento, non il limite della pagina.
- La pagina del design system ha un proprio contenitore indipendente e non è toccata, come le pagine del talent.

## Verifica

- Controllo della build e dell'anteprima su uno schermo largo: il contenuto arriva a 1600px, la sidebar resta fissa a sinistra, nessun scorrimento orizzontale.
- Controllo su schermo medio e su mobile: comportamento identico a oggi.

## Dettagli tecnici

Modifica all'attributo `className` del div contenitore in `src/components/layout/OwnerLayout.tsx`: sostituzione di `max-w-7xl` con `max-w-[1600px]`. Nessuna migrazione, nessuna modifica a database, permessi o regole di accesso.
