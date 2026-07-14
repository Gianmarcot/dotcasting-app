## Modifiche al pulsante secondario e token border

### 1. Aggiornare il token `--border` in `src/index.css`
- Cambiare il valore HSL di `--border` (light mode) per corrispondere a `#C7C7C7` (≈ `0 0% 78%`).
- Valutare se applicare anche in dark mode o mantenere il valore attuale (proposta: mantenere dark mode invariato per non rompere il contrasto sulle superfici scure — da confermare).

### 2. Aggiornare la variante `secondary` in `src/components/ui/button.tsx`
- Background: `bg-white/30` (bianco con opacità 30%) al posto dell'attuale `bg-secondary`.
- Border: aggiungere `border border-border` per usare il nuovo token `#C7C7C7`.
- Testo: mantenere `text-secondary-foreground`.
- Hover: adattare (es. `hover:bg-white/50`) per mantenere feedback visibile.

### 3. Verifica
- Controllare la pagina `/design-system` sezione Buttons per vedere tutte le varianti (sm/md/lg, con icona sx/dx, icon-only) col nuovo stile.
- Verificare che gli altri usi di `variant="secondary"` nella piattaforma (es. "Dettagli ruolo" in `RoleRoundsCompartment`, CTA empty state Casting) rimangano leggibili sui fondi cream/beige.

### Nota
La modifica al token `--border` è globale: influenza tutti i bordi che usano `border-border` (card, input, separatori). Il nuovo `#C7C7C7` è leggermente più scuro/neutro dell'attuale — confermi di voler propagare a tutta la UI, o preferisci un token dedicato solo al pulsante secondario?
