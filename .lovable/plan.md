## Modifiche a `src/pages/owner/OwnerCastings.tsx` e `src/components/castings/CastingRow.tsx`

Solo presentazione, nessuna logica.

### 1. Padding del box coerente con i ruoli
In `OwnerCastings.tsx` (riga 126) cambiare il container della lista:
- Da: `<div className="dc-card overflow-hidden p-2">`
- A: `<div className="dc-card overflow-hidden p-6">` (stesso padding di `RoleRoundsCompartment`)

Adattare anche il padding interno degli stati di loading/empty per allinearsi (rimuovere `p-2` ridondante nel blocco skeleton).

### 2. Rimuovere il primo divider
Nell'header di colonna (riga 136), rimuovere `border-b border-border/60`:
- Da: `... py-2 text-sm font-medium text-muted-foreground border-b border-border/60`
- A: `... py-2 text-sm font-medium text-muted-foreground`

### 3. Rimuovere l'ultimo divider
In `CastingRow.tsx` (riga 55), aggiungere `last:border-b-0` alla className della riga, così l'ultima riga della lista non mostra la linea inferiore:
- `... border-b border-border/40 last:border-b-0 ...`

Risultato: box con padding `p-6` come il box dei ruoli, nessuna hairline sopra la prima riga né sotto l'ultima; i divider tra le righe restano invariati.