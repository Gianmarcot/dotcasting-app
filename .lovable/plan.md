# Riorganizzazione UI sezione Casting (owner)

Solo UI/composizione: nessuna modifica a hook, query, schemi o logica di mutazione.

## 1. Lista casting → righe compatte

Nuovo componente `src/components/castings/CastingRow.tsx` (sostituisce `CastingCard` nella lista; il file vecchio resta per eventuali altri usi ma può essere rimosso se non referenziato altrove).

Struttura riga (allineamento a colonne fisse, anche con dati mancanti → `—`):

```text
●  Titolo casting           Azienda · data/luogo                 N candidature   ⋮
```

- **Pallino stato** (`h-2 w-2 rounded-full`):
  - `active` → verde (`bg-[hsl(var(--success))]` o token equivalente già usato)
  - `draft` → grigio chiaro
  - `closed` → grigio scuro
  - Parola dello stato esposta tramite `Tooltip` sul pallino e ripetuta come label nel menu kebab.
- **Titolo**: `font-medium`, click sull'intera riga → `navigate(/owner/castings/:id)` (riuso navigazione esistente).
- **Metadati tenui** (`text-muted-foreground text-sm`): `azienda · (data formattata it-IT | primo luogo | —)`. Riusa `formatDates` già presente in `CastingCard`.
- **Contatore candidature**: `applications[0]?.count` con etichetta "N candidature" (`text-sm text-muted-foreground`).
- **Kebab** (`MoreVertical`): identico `DropdownMenu` di oggi (Apri, Modifica, transizioni di stato, Elimina) — copio le azioni da `CastingCard` senza modificarle. `stopPropagation` per non triggerare il click riga.

Contenitore unico in `OwnerCastings.tsx`:
```tsx
<div className="rounded-2xl border bg-white divide-y divide-border/60 overflow-hidden">
  {castings.map(c => <CastingRow … />)}
</div>
```
Densità ~56 px per riga su desktop ⇒ 8–10 visibili senza scroll.

**Mobile** (`sm:` breakpoint): riga in due livelli — riga 1 `[pallino] [titolo] [kebab]`; riga 2 metadati + contatore. Layout via flex/wrap, nessun nuovo componente.

Le **tab di stato** (`CastingFilters`, già presente) + ricerca restano sopra la lista nella stessa barra di oggi. Nessuna modifica a quel componente.

Skeleton: 6× riga `h-14` invece dei 3× `h-32` attuali.

## 2. Rimozione del box "Crea Casting con AI" dalla lista

In `src/pages/owner/OwnerCastings.tsx`: rimuovere `<AICastingCreator />` e il relativo import. Il componente `AICastingCreator.tsx` viene riusato (spostato concettualmente) nel passo 0 del dialog — vedi sotto.

## 3. Passo 0 nel dialog "Crea Casting"

Modifica a `src/components/castings/CastingFormDialog.tsx` (il dialog di creazione/modifica esistente — non c'è un vero wizard multi-step, lo step 0 vive come schermata interna allo stesso dialog).

Nuovo stato locale `step: "choose" | "form"`:

- **Apertura in modalità "create"** (`casting === null`) → parte da `step = "choose"`.
- **Apertura in modalità "edit"** (`casting !== null`) → parte direttamente da `step = "form"` (nessuna regressione UX).

### Schermata "choose"

Due opzioni affiancate (su desktop) / impilate (mobile), come due card cliccabili dentro `DialogContent`:

1. **Descrivi con AI** (icona `Sparkles`)
   - Espande inline il blocco AI: `Textarea` + esempi (`SUGGESTED_PROMPTS`) + bottone "Genera", **riusando `AICastingCreator`** o estraendone il body in un piccolo `AICastingPromptPanel` se serve incapsulare la callback di successo.
   - Modifica minima a `useAICasting`: nessuna. Il flusso esistente `generateCasting` → `createCastingFromAI` rimane identico; al termine il dialog si chiude e (riuso del `queryClient.invalidateQueries(["owner-castings"])` già presente) la lista si aggiorna. Coerente con il vincolo "nessuna modifica alla logica di creazione".
   - Comportamento richiesto "deposita l'utente negli step precompilati": dato che oggi il form manuale non gestisce i ruoli (quelli si aggiungono nella pagina di dettaglio), dopo la creazione AI navighiamo a `/owner/castings/:id` dove l'utente vede titolo/azienda/luoghi/ruoli generati già presenti e modificabili con la UI esistente. Questo è l'equivalente più fedele rispetto all'attuale architettura del form; non viene introdotto un nuovo editor di ruoli.

2. **Parti da zero** (icona `FilePlus`)
   - `onClick` → `setStep("form")`. Mostra l'attuale form manuale invariato.

Header del dialog: titolo "Nuovo Casting" + breadcrumb minimo `Scegli metodo › Compila` quando si è in `step="form"` da create, con bottone "Indietro" che riporta a `choose`. In modalità edit nessun breadcrumb.

Reset di `step` su chiusura del dialog.

## File toccati

- `src/pages/owner/OwnerCastings.tsx` — rimuove `AICastingCreator`, sostituisce mappa `CastingCard` con contenitore + `CastingRow`, aggiorna skeleton.
- `src/components/castings/CastingRow.tsx` — nuovo, basato sulle azioni di `CastingCard`.
- `src/components/castings/CastingFormDialog.tsx` — aggiunge step 0 (chooser) e branching AI/manuale; nessun cambio ai campi form esistenti.
- (Opzionale) piccolo refactor: estrarre il body di `AICastingCreator` in un sub-componente riusabile dentro il dialog; il file esistente continua a funzionare ma non è più montato nella pagina lista.

Nessuna modifica a: `useCastings`, `useAICasting`, `useCreateCasting/Update/Delete`, edge function `generate-casting`, schema DB, `CastingFilters`, pagina dettaglio.
