# Redesign scheda invio (RoundFolderCard)

Solo presentazione di `src/components/castings/rounds/RoundFolderCard.tsx`. Nessuna modifica a dati, schema, hook, board interna all'invio o cover di PDF/TalentCardWeb.

## 1. Stack foto (ventaglio di default)

- Cap fisso a **5 card** indipendentemente da `total`. Mai card "+N" nello stack (il conteggio va nel footer).
- Se i talent reali sono `< 5`, mostra solo il numero reale di card.
- Ordinamento di presentazione (non muta i dati): card con foto reale davanti (z-index più alto), placeholder con iniziali sempre dietro. Quindi:
  1. separa `withPhoto` e `withoutPhoto` mantenendo ordine stabile,
  2. concatena `[...withPhoto, ...withoutPhoto]` e taglia a 5,
  3. costruisci le `layers` solo da queste 5 entry, **senza** il layer "more".
- Formato card 5:7, `object-cover`, border bianco ~2px (mantenuto), niente ombre pesanti.
- Stack centrato orizzontalmente nella parte alta della card. Altezza riservata fissa (`STACK_HEIGHT = 176`).
- Front-most: l'elemento con la foto reale al primo posto nell'array ordinato. I placeholder restano nello stack ma con z-index inferiore: in pratica, dato che sono già ultimi nell'array, basta mappare `z = n - i` come oggi → automaticamente dietro.

### Posizioni di default (ventaglio)

Riusa l'attuale logica `fanSlots` con `FAN_ROTATIONS = [0, -4, 6, -3, 9]` e `FAN_GAP ≈ 18` (leggera riduzione per stare comodo con 5 card sempre presenti). Rotazione contenuta nel range richiesto (-4°…+9° ok, sostanzialmente già rispettato).

### Hover (solo desktop) — ventaglio "aperto"

L'hover è sull'INTERA card (già così via `onMouseEnter` sul root). Su hover:

- aumenta `FAN_GAP` (es. 18 → 28 px),
- aumenta leggermente la rotazione (moltiplica per ~1.4 con clamp),
- transizione ~200ms ease-out.

NON si passa più alla griglia: rimuovere completamente la logica `gridSlots`, `stripRef`, `stripWidth`, `ResizeObserver`, `SAFE_PADDING`, `GRID_GAP` e il branch `hovered ? grid : fan`. Le card animano solo `x` e `rotate`; dimensioni costanti.

Touch / `@media (hover: none)`: nessun effetto, stack statico. Implementazione: gating dell'hover via `useEffect` + `matchMedia("(hover: hover)")` (oppure semplicemente disabilitando l'aumento di gap quando il media non matcha).

## 2. Footer a tre zone

Sostituire il footer attuale con grid a 3 colonne `grid-cols-[1fr_auto_1fr]` (NON `justify-between`), così il centro resta sull'asse della card.

- **Sinistra**: data invio in formato breve italiano `format(date, "d MMM", { locale: itLocale })` (es. "15 giu"), `text-muted-foreground text-xs`, `justify-self-start`, truncate.
- **Centro**: `"{total} talent"`, `font-medium text-sm text-foreground text-center justify-self-center`.
- **Destra**: UN solo bottone, `justify-self-end`:
  - `isShared` → bottone "Copia link" (icona `LinkIcon`), invoca `copyLink`.
  - non condiviso → bottone "Condividi" (icona `Share2`), invoca `doShare`.

Pulsanti: `size="sm" variant="ghost"` con icona + label visibile su `sm:` (icona sola su mobile per stare in riga). Mantieni `e.stopPropagation()`.

## 3. Menu kebab — Rigenera

Aggiungere in header (accanto al badge stato) un `DropdownMenu` con trigger `Button size="icon" variant="ghost"` e icona `MoreVertical`. Voci:

- "Modifica" → naviga al detail (sostituisce l'icona Edit oggi nel footer per gli invii non condivisi).
- "Rigenera con dati attuali" (icona `RotateCcw`) → `navigate(.../rounds/{id}?regen=1)`. Presente per tutti gli stati (era esposta solo per `shared`).
- Eventuali altre azioni esistenti restano fuori scope.

Tutte le voci con `onSelect={(e) => { e.preventDefault?.(); }}` + stopPropagation per non aprire la card. Trigger del menu deve fare `e.stopPropagation()` su click.

Rimuovere dal footer i bottoni `Edit` e `RotateCcw` (ora coperti dal kebab).

## 4. Responsive

- Mobile (`hover: none`): stack statico al ventaglio di default, nessun hover.
- Footer: la grid a 3 colonne sta in riga su card normali; le label di Sinistra e Destra sono già strette (data corta + icona-only su mobile). Il centro resta prominente (`font-medium`, leggermente più grande). Nessun wrap previsto, ma se accadesse l'auto-fit della grid mantiene il centro centrato.

## 5. Vincoli rispettati

- Niente modifiche a `useRoundPreviewPhotos`, `useShareRound`, `casting_round_talents`, board interna, PDF/web card.
- Header (cartella + titolo + badge stato) invariato salvo l'aggiunta del trigger kebab.

## Dettagli tecnici (per developer)

File toccato: solo `src/components/castings/rounds/RoundFolderCard.tsx`.

Import nuovi: `MoreVertical` da `lucide-react`, `DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem` da `@/components/ui/dropdown-menu`.

Rimozioni: `useLayoutEffect`, `useRef`, `ResizeObserver`, `stripRef`, `stripWidth`, `gridSlots`, costanti `GRID_GAP`, `SAFE_PADDING`, `STACK_HEIGHT * 0.88` hardcoded (estrarre in `CARD_H = 160`, `CARD_W = (CARD_H * 5) / 7`).

Pseudo-snippet ventaglio (hover-aware):

```tsx
const canHover = useCanHover(); // matchMedia('(hover: hover)')
const gap = hovered && canHover ? 28 : 18;
const rotMul = hovered && canHover ? 1.4 : 1;
const fanSlots = Array.from({ length: n }, (_, i) => ({
  x: i * gap - ((n - 1) * gap) / 2,
  rotate: (FAN_ROTATIONS[i] ?? 0) * rotMul,
}));
// motion.div animate={{ x, rotate }} transition={{ duration: 0.2, ease: 'easeOut' }}
```

Footer:

```tsx
<div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 pt-3 pb-2">
  <span className="text-xs text-muted-foreground truncate">{shortDate}</span>
  <span className="text-sm font-medium text-foreground text-center">{total} talent</span>
  <div className="justify-self-end">{isShared ? CopyBtn : ShareBtn}</div>
</div>
```
