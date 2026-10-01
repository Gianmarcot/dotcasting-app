# Area admin: contenuto a 1600px, viste del database talenti più ricche, spazi e CTA coerenti

## Obiettivo

Quattro interventi collegati nell'area admin:

1. il contenuto delle pagine passa da 1280px a 1600px;
2. nel database talenti, dove serve, lo spazio in più viene davvero usato: vista a card a 5 colonne e vista a lista con 5 immagini quando lo schermo è abbastanza grande;
3. nel database talenti aumenta lo spazio tra la parte alta (ricerca, ordinamento, filtri) e l'elenco, con 48px;
4. le azioni principali di ogni pagina ("Nuovo talent" e simili) diventano il pulsante grande del design system.

## Cosa cambia

### 1. Larghezza del contenuto admin: 1600px

- Il contenitore del layout admin (`src/components/layout/OwnerLayout.tsx`, riga 22) passa da `max-w-7xl` (1280px) a `max-w-[1600px]`, restando centrato e con gli spazi interni attuali.
- Lo stesso contenitore diventa il riferimento per la larghezza disponibile: i componenti interni potranno quindi regolarsi sullo spazio effettivo, che dipende anche dalla larghezza della sidebar, regolabile dall'utente.
- Sidebar, intestazione mobile e navigazione in basso restano invariati. Le pagine admin non hanno un limite proprio e ereditano tutte il nuovo valore.

### 2. Database talenti, vista a card: fino a 5 colonne

- Oggi la griglia arriva al massimo a 4 colonne (`TalentBoardGrid.tsx`, riga 16).
- Quando la larghezza disponibile raggiunge 1280px compaiono 5 colonne; sotto quella soglia restano 4, poi 3 e 2 su schermi più stretti, come oggi.
- Card invariate per stile, proporzioni e comportamento: cambia solo il numero per riga. A contenuto pieno ogni card è circa 300px di larghezza.

### 3. Database talenti, vista a lista: fino a 5 immagini

- Oggi ogni riga mostra 4 immagini (`TalentPortfolioList.tsx`, righe 38-40); con spazio sufficiente diventano 5.
- Il contatore "+N" sull'ultima cella si adatta e continua a indicare quante foto non sono mostrate.
- Colonna informazioni a sinistra (nome, città/età, etichette, contatori foto e video) invariata; su telefono continuamone 2.
- Nessun nuovo caricamento dati: le foto sono già recuperate tutte in una sola query.

### 4. Database talenti: 48px tra filtri ed elenco

- Oggi tra la barra con ricerca/ordinamento/vista, la riga dei filtri e l'elenco ci sono 24px.
- Il blocco alto (titolo, ricerca, filtri ed etichette dei filtri attivi) resta unito al suo interno, mentre lo spazio che lo separa dall'elenco diventa 48px, in tutte e tre le viste e anche negli stati di caricamento e "nessun risultato".

### 5. CTA principali come pulsante grande del design system

Il design system definisce il pulsante grande con altezza 48px, testo 16px e icone 20px (`size="lg"` in `src/components/ui/button.tsx`, documentato nella pagina del design system come "lg · 48"). Oggi le azioni principali delle pagine admin sono in taglio medio (40px) o nel taglio predefinito.

Li portiamo al taglio grande, nelle pagine:

| Pagina | Azione | Oggi |
| --- | --- | --- |
| Database talenti | "Nuovo talent" | medio (40px) |
| Casting | "Nuovo casting" | medio (40px) |
| Dashboard | "Nuovo casting" | predefinito (40px) |
| Aziende | "Nuova Azienda" | predefinito (40px) |
| Dettaglio azienda | "Nuovo casting" | predefinito (40px) |
| Target | "Nuovo target" | predefinito (40px) |
| Dettaglio casting | "Nuovo ruolo" | medio (40px) |
| Dettaglio ruolo | "Aggiungi talent" | medio (40px) |
| Dettaglio round | "Condividi" | medio (40px) |

- I pulsanti secondari nella stessa riga d'intestazione ("Modifica", "Rigenera PDF") passano al taglio grande insieme al principale, così le altezze restano allineate; variante e stile non cambiano.
- Le icone dentro queste azioni seguono il pulsante (20px) invece di una misura scritta a mano, allineandosi al resto dell'app.
- Restano come sono i pulsanti dentro card, modali e stati vuoti ("Crea il primo target", il salvataggio di una nota, i pulsanti piccoli di servizio): non sono azioni principali di pagina.

## Verifica

- Schermo largo (oltre 1900px): contenuto a 1600px, griglia a 5 colonne, righe della vista a lista con 5 immagini e "+N" corretto, 48px tra filtri ed elenco, "Nuovo talent" alto 48px.
- Schermo medio (1440px): 4 colonne e 4 immagini, identico a oggi.
- Sidebar allargata e ristretta: il numero di colonne non scatta in modo incoerente, nessuna card troppo stretta.
- Ogni pagina admin elencata: azione principale alta 48px e allineata con le altre nella stessa riga.
- Mobile: vista a card e a lista invariate (2 colonne, 2 immagini), nessun scorrimento orizzontale.
- Controllo di build e log per escludere errori.

## Dettagli tecnici

- `src/components/layout/OwnerLayout.tsx`: `max-w-7xl` diventa `max-w-[1600px]`; il contenitore viene marcato come contesto di larghezza con l'utility `@container` di Tailwind (versione 3.4 in uso, nessuna nuova dipendenza).
- `src/components/talents/TalentBoardGrid.tsx`: wrapper `@container` sulla griglia e variante aggiuntiva per le 5 colonne oltre la soglia di 1280px di larghezza disponibile.
- `src/components/talents/TalentPortfolioList.tsx`: griglia immagini della riga con variante per 5 celle oltre la stessa soglia; l'overlay "+N" usa il numero effettivo di celle mostrate.
- `src/pages/owner/OwnerTalents.tsx`: il raggruppamento attuale (`space-y-6` sulla radice, riga 126) viene sostituito da un blocco alto compatto e da un margine superiore di 48px (`mt-12`) sull'area elenco; il pulsante "Nuovo talent" (riga 130) passa a `size="lg"`.
- `src/pages/owner/OwnerCastings.tsx`, `OwnerDashboard.tsx`, `OwnerCompanies.tsx`, `OwnerCompanyDetail.tsx`, `OwnerTargets.tsx`, `OwnerCastingDetail.tsx`, `OwnerCastingRoleDetail.tsx`, `OwnerRoundDetail.tsx`: azioni principali e loro compagni di riga portati a `size="lg"`, con icone senza misura esplicita.
- Nessuna migrazione, nessuna modifica a database, permessi o regole di accesso.
