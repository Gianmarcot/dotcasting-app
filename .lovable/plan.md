## Obiettivo

Due modifiche puramente presentazionali sulla pagina Casting.

## 1. Conteggio "Selezione" = tutti i talent (non solo confermati)

Oggi in `useCastings.ts` gli avatar mostrati in `CastingRow` derivano da `role_talents` filtrati con `company_status = "confirmed"`. Il numero totale (`+N`) riflette quindi solo i confermati.

Modifica in `src/hooks/useCastings.ts`:
- Rimuovere il filtro `.eq("company_status", "confirmed")` nella query su `role_talents`.
- Il risultato: `confirmed_talents` conterrà tutti i talent associati ai ruoli del casting, indipendentemente dallo stato di approvazione.
- Nessuna modifica a `CastingRow.tsx`: continuerà a mostrare i primi 3 avatar + `+N` sul totale generale.

Nota: il campo resta chiamato `confirmed_talents` nel tipo per non toccare altri consumatori; se necessario lo rinominiamo in un secondo passaggio.

## 2. Pulsanti pagina Casting → varianti DS

In `src/pages/owner/OwnerCastings.tsx` due bottoni non usano le varianti canoniche del Design System:

- **"Crea casting"** (header): oggi `<Button className="rounded-full">` con `<Plus className="mr-2">`.
  → sostituire con la variante DS: `<Button size="md" iconPosition="left">` (il `rounded-full` è già nel variant `default`, quindi si rimuove la className custom; l'icona a sinistra usa il padding asimmetrico previsto dal DS `pl-4 pr-6`).

- **"Crea il tuo primo casting"** (empty state): oggi `variant="link"`.
  → sostituire con `<Button variant="secondary" size="md">` coerente con gli altri CTA secondari del DS.

Nessun'altra modifica a layout, filtri, tabella o CastingRow (i pulsanti azione hover erano già stati normalizzati a `ghost / icon-md`).

## File toccati

- `src/hooks/useCastings.ts` — rimuovere filtro `company_status`.
- `src/pages/owner/OwnerCastings.tsx` — sostituire i due Button con varianti DS.
