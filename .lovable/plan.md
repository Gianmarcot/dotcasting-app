# Pagine admin più ampie (1600px) e viste del database talenti che sfruttano lo spazio

## Obiettivo

L'area admin oggi limita il contenuto a 1280px, quindi sugli schermi larghi restano ampi spazi vuoti ai lati. Portiamo il limite a 1600px e, dove ha senso, non ci limitiamo ad allargare: nel database talenti la vista a card mostra 5 colonne e la vista a lista mostra 5 immagini quando c'è abbastanza spazio.

## Cosa cambia

### 1. Larghezza del contenuto admin: 1600px

- Il contenitore del layout admin (`src/components/layout/OwnerLayout.tsx`, riga 22) passa da `max-w-7xl` (1280px) a `max-w-[1600px]`. Il contenuto resta centrato e gli spazi interni attuali non cambiano.
- Lo stesso contenitore diventa il punto di riferimento per la larghezza disponibile, così i componenti interni possono adattarsi a quella misura (utile anche in futuro, perché la sidebar è regolabile e lo spazio cambia con essa).
- Sidebar, intestazione mobile e navigazione in basso restano come sono. Le pagine admin non hanno un limite proprio, quindi ereditano tutte il nuovo valore.

### 2. Database talenti, vista a card: fino a 5 colonne

- Oggi la griglia arriva al massimo a 4 colonne (`TalentBoardGrid.tsx`, riga 16).
- Con il contenuto a 1600px, quando la larghezza disponibile raggiunge 1280px compaiono 5 colonne; sotto quella soglia restano 4, poi 3 e 2 su schermi via via più stretti, come oggi.
- Le card mantengono proporzioni, stile e comportamento attuali: cambia solo il numero per riga. A schermo pieno ogni card è circa 300px di larghezza, quindi la foto resta leggibile.

### 3. Database talenti, vista a lista: fino a 5 immagini

- Oggi ogni riga mostra 4 immagini (`TalentPortfolioList.tsx`, righe 38-40).
- Quando c'è spazio sufficiente le immagini diventano 5; il contatore "+N" sopra l'ultima cella si adatta di conseguenza e continua a indicare quante foto non sono mostrate.
- Le colonne informazioni a sinistra (nome, città/età, etichette, contatori foto e video) restano invariate, e su telefono continuamone 2 come oggi.
- Nessun nuovo caricamento dati: le foto sono già recuperate tutte in una sola query, quindi la quinta immagine è disponibile senza cambiare l'accesso al database.

### Perché "larghezza disponibile" e non "larghezza dello schermo"

La sidebar admin si può allargare o restringere, quindi lo spazio reale per il contenuto non dipende solo dal monitor. Le due regole sopra guardano lo spazio effettivo del contenuto: su uno schermo grande ma con sidebar molto ampia il comportamento resta quello attuale, senza card o immagini schiacciate.

### Cosa non viene toccato

- La vista a lista compatta e le altre pagine admin (casting, candidature, aziende, round, target, comunicazioni, impostazioni): nessuna modifica, se non la larghezza maggiore del contenitore.
- I controlli con una misura propria (per esempio il campo di ricerca del database talenti, fermo a 800px, o la barra di ricerca di un round): sono scelte di leggibilità del singolo elemento, non il limite della pagina.
- Le pagine del talent e la pagina del design system, che hanno contenitori独立 propri.

## Verifica

- Anteprima su schermo largo (oltre 1900px): contenuto a 1600px, griglia talenti a 5 colonne, righe della vista a lista con 5 immagini e contatore "+N" corretto.
- Anteprima su schermo medio (1440px): 4 colonne e 4 immagini, identico a oggi.
- Prova a restringere la sidebar: il numero di colonne non scatta in modo incoerente e nessuna card risulta troppo stretta.
- Mobile: vista a card e vista a lista invariate (2 colonne, 2 immagini), nessun scorrimento orizzontale.
- Controllo della build e dei log per escludere errori.

## Dettagli tecnici

- `src/components/layout/OwnerLayout.tsx`: `max-w-7xl` diventa `max-w-[1600px]` e il contenitore viene marcato come contesto di larghezza (utility `@container` di Tailwind, già supportata dalla versione 3.4 in uso, senza nuove dipendenze).
- `src/components/talents/TalentBoardGrid.tsx`: wrapper con `@container` e variante aggiuntiva sulla griglia per le 5 colonne oltre la soglia di 1280px di larghezza disponibile.
- `src/components/talents/TalentPortfolioList.tsx`: griglia immagini della riga con variante per le 5 celle oltre la stessa soglia; l'overlay "+N" usa il numero effettivo di celle mostrate.
- Nessuna migrazione, nessuna modifica a database, permessi o regole di accesso.
