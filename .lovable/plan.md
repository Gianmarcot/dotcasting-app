## Obiettivo

Rifare il modale di dettaglio talent nella pagina cliente (`/round/:token` — `SharedRound.tsx`) passando dal pannello scuro attuale a un modale ampio chiaro, con galleria a sinistra + scheda a destra + navigazione tra talent in alto. Nessun cambio di dati o logica: solo layout e tema.

## Ambito

- File toccato: `src/pages/shared/SharedRound.tsx` (solo il sotto-componente `TalentDetailSheet` e il suo trigger).
- Nessuna modifica a hook, RPC, generazione PDF, contatore selezione o barra "Prosegui" (che restano fuori dal modale, come oggi).
- Uso di componenti DS: `Dialog`, `Button` (bordeaux come `primary`), `ScrollArea`, `Avatar` per gli avatar dei talent nel selettore.

## Struttura nuovo modale

```text
┌──────────────────────────────────────────────────────────────┐
│  [Avatar+Nome] [Avatar+Nome] [•Avatar+Nome•] …  [⬇] [✕]     │  header sticky
├───────────────────────────────────────┬──────────────────────┤
│                                       │  NOME TALENT (H1)    │
│         IMMAGINE PRINCIPALE           │  ─────────────────   │
│              (aspect 2:3)             │  GENERALE            │
│                                       │  Età · Genere · Città│
│                                       │                      │
│                                       │  ASPETTO             │
├───────────────────────────────────────┤  Altezza · Peso …    │
│  [thumb][thumb][thumb][thumb][thumb]  │                      │
│         filmstrip scrollabile         │  MISURE              │
│                                       │  Maglia · Pantaloni …│
├───────────────────────────────────────┴──────────────────────┤
│           [ Seleziona talent / Deseleziona ]  (bordeaux)     │  footer sticky
└──────────────────────────────────────────────────────────────┘
```

### Header (sticky, sfondo crema)

- Selettore talent: strip orizzontale scrollabile con pill `[Avatar 24px + Nome]` per ogni talent del round; quello attivo con bordo bordeaux + testo bordeaux, gli altri neutri.
- A destra restano solo le due icone attuali: **Download PDF** e **Chiudi** — stesso comportamento, restilizzate su tema chiaro (hover `bg-muted`).

### Colonna sinistra — Galleria (~60% larghezza, `lg:col-span-3` su 5)

- Contenitore con **scroll indipendente** (`overflow-y-auto`).
- **Immagine hero** in alto: aspect `2/3`, `rounded-2xl`, `object-cover`, click → apre lightbox esistente.
- **Filmstrip** sotto: riga orizzontale scrollabile di miniature (aspect `2/3`, larghezza fissa ~72px, `rounded-lg`); click su una miniatura la promuove a hero (stato locale `activeIndex`).
- Se le foto sono ≤ 1: nessuna filmstrip.
- Placeholder `ImageOff` se il talent non ha foto.
- Il set foto rispetta `photoCountFromRound` come oggi.

### Colonna destra — Scheda info (~40%, `lg:col-span-2`)

- **Scroll indipendente** (`overflow-y-auto`, `overscroll-contain` per non propagare alla galleria).
- Header locale: `NOME TALENT` in `font-tenor uppercase` grande, sottotitolo con status pill (Confermato/Scartato) se presente.
- Sezioni invariate (contenuti già mappati in `buildTalent`):
  - **GENERALE**: Età, Genere, Città
  - **ASPETTO**: Altezza, Peso, Colore occhi, Colore capelli, Lunghezza capelli, Tipo capelli, Segni particolari
  - **MISURE**: Taglia maglia, Taglia pantaloni, Taglia giacca, Scarpe, Petto, Vita
- Titoli sezione (`DetailSection`) restilizzati: `font-tenor uppercase tracking-widest text-xs text-primary`
- `DetailRow`: label `text-muted-foreground` `uppercase text-[10px]`, value `text-foreground text-sm`.

### Footer (sticky, sfondo crema, bordo top)

- Bottone **Seleziona talent** / **Deseleziona** a piena larghezza (o allineato a destra), `variant="default"` bordeaux, `size="lg"`; disabilitato se `!selectable`. Stessa funzione `onToggle` di oggi.
- La barra flottante esterna "X di Y selezionati / Prosegui" resta come oggi, sotto il modale — non viene toccata.

## Tema chiaro (design tokens)

- Superficie modale: `bg-background` (crema/bianco) su overlay scuro standard del Dialog DS.
- Testo: `text-foreground`, secondari `text-muted-foreground`.
- Accenti (titoli sezione, pill talent attivo, bottoni primari, download icon hover): `text-primary` / `bg-primary` bordeaux.
- Bordi/hairline: `border-border`.
- Rimossi tutti i colori hardcoded (`#0F0F0F`, `#F5F0E8`, `bg-white/10`, ecc.) dal componente modale.

## Comportamento nuovi elementi

1. **State locale**: `activeIndex` (foto attiva) reset a `0` ogni volta che cambia `row.role_talent_id`.
2. **Navigazione talent**: click su una pill → il parent passa `detailsId` diverso; il modale resta aperto, il contenuto si aggiorna, `activeIndex` reset.
3. **Scroll isolato**: la galleria (sinistra) e la scheda (destra) hanno ciascuna `overflow-y-auto` + `overscroll-contain`; il body del modale non scrolla.
4. **Responsive**: sotto `lg` il layout collassa a colonna singola (galleria sopra, scheda sotto), stessa logica ma senza sticky laterale.

## Dettagli tecnici implementativi

- `TalentDetailSheet` riceve nuovi prop: `talents: RpcTalentRow[]`, `onSelectTalent: (id: string) => void`, `selectedSet: Set<string>` (per marcare visivamente le pill già selezionate).
- Il parent (`SharedRound`) passa l'array completo `talents` e sostituisce `onToggle` con `() => toggle(row.role_talent_id)` calcolato al volo.
- Riuso di `MediaLightbox`/lightbox esistente per l'hero click.
- `DialogContent`: `max-w-6xl w-[95vw] max-h-[90vh] p-0 rounded-3xl overflow-hidden grid grid-rows-[auto_1fr_auto] lg:grid-cols-[3fr_2fr]` (header e footer span colonne).

## Fuori scope

- Nessun cambio a PDF, RPC, generazione, mock, `TalentTile`, header pagina, floating bar di conferma.
- Nessuna nuova query o campo aggiuntivo: si usa quanto già ritornato da `get_shared_round`.