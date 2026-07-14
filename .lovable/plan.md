Solo modifiche di UI/presentazione.

## 1. Design System: nuova sezione "Search & Filtri"
In `src/pages/DesignSystem.tsx`, aggiungere un nuovo `SubBlock` che mostra i componenti reali usati nella pagina Casting:
- `CastingFilters` (dropdown stato + input di ricerca con icona + dropdown ordinamento) importato da `src/components/castings/CastingFilters.tsx`, alimentato con state locale nel design system.
- In alternativa/oltre: la search bar isolata (estratta visivamente dallo stesso componente) come esempio a sé stante.

Nessuna estrazione di sotto-componenti: si riusa `CastingFilters` così com'è per garantire 1:1 con la pagina reale.

## 2. CastingRow: azioni hover come ghost medium
In `src/components/castings/CastingRow.tsx`:
- Sostituire i due `Button variant="ghost" size="icon"` (matita + cestino) con `variant="ghost" size="icon-md"` (40×40, coerente col DS).
- Rimuovere le classi custom di colore: il cestino non deve più essere rosso in hover. Entrambi ereditano il colore neutro standard del ghost (`text-foreground`/`text-muted-foreground` di default, hover `bg-muted`).
- Aggiornare in parallelo il mock in `DesignSystem.tsx` (CastingRow demo) con gli stessi bottoni.

## 3. CastingRow: "+ altri N" mancante
Attualmente la logica `extra > 0` esiste già ma con `shown = confirmed.slice(0, 4)` il "+ altri" appare solo con >4 talent. Verificare che la resa sia corretta e che il testo sia visibile anche quando gli avatar riempiono la colonna. 

Correzione: la colonna "Selezione" ha larghezza fissa `180px`; con 4 avatar 48px sovrapposti (-ml-3) + "+ altri N" il contenuto va in overflow. Ridurre il numero mostrato a **3 avatar** e mostrare "+N" compatto (senza "altri") accanto, in cerchio 48px stile avatar oppure come piccolo badge testuale. Preferisco: mantenere 3 avatar visibili + un 4° "cerchio contatore" (`h-12 w-12 rounded-full bg-muted text-xs`) con "+N" quando confirmed.length > 3. Zero avatar → "—" come oggi.

Aggiornare mock in DesignSystem in parallelo per riflettere il caso "+N".

## 4. Button: ribilanciamento padding con icona
In `src/components/ui/button.tsx`, variant `iconPosition`:
- Attuale: `left: "pl-3 pr-7"`, `right: "pl-7 pr-3"`.
- Nuovo: aumentare leggermente il padding lato icona e diminuire lato testo. Proposta:
  - `left: "pl-4 pr-6"` (icona ha più respiro dal bordo, testo più vicino al bordo destro)
  - `right: "pl-6 pr-4"`

Nota: queste classi sovrascrivono il padding orizzontale delle size (sm/md/lg). Va bene: il ribilanciamento vale per tutte e tre le taglie in modo uniforme. Se il visual in DS mostra sm troppo stretto, si può fine-tunare, ma partiamo con questi valori.

## Tecnico
- File modificati: `src/pages/DesignSystem.tsx`, `src/components/castings/CastingRow.tsx`, `src/components/ui/button.tsx`.
- Nessun file nuovo. Nessuna modifica a hook, schema o logica.
