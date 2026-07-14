## Obiettivo
Creare una pagina pubblica `/design-system` (dev-only, non linkata dalla nav) che raccoglie in un'unica vista tutti gli elementi del sistema UI dotCasting, per rivedere e iterare rapidamente sullo stile centrale (index.css / componenti condivisi).

## Rotta
- Nuova route pubblica `/design-system` in `src/App.tsx`, montata FUORI da `ProtectedRoute` e da `OwnerLayout` (nessuna sidebar admin, nessun redirect auth).
- Nessun link in `OwnerSidebar` / `TalentSidebar`: si raggiunge solo via URL.

## Layout della pagina
File nuovo: `src/pages/DesignSystem.tsx`.

Struttura a sidebar interna sticky (indice sezioni) + contenuto scrollabile. Sfondo cream standard, `max-w-7xl mx-auto`, sezioni separate da `<section id="...">` per anchor link.

```text
┌──────────────┬────────────────────────────────────┐
│ Indice       │ 1. Tokens                          │
│ - Tokens     │ 2. Typography                      │
│ - Typography │ 3. Primitive shadcn                │
│ - Primitive  │ 4. Pattern dotCasting              │
│ - Pattern    │ 5. Blocchi complessi               │
│ - Blocchi    │                                    │
└──────────────┴────────────────────────────────────┘
```

Ogni sottosezione ha: titolo Tenor Sans uppercase, breve caption con il nome del token/componente e il file sorgente da editare (es. `src/index.css`, `src/components/ui/button.tsx`), poi la preview.

## Contenuti

### 1. Token
Letti dalle CSS variables di `src/index.css` (renderizzati come swatch + label + valore HSL/hex risolto a runtime via `getComputedStyle`).

- **Colori semantici**: background, foreground, card, primary/foreground, secondary, muted, accent, destructive, border, input, ring, success, warning, info, olive, charcoal — swatch quadrato `rounded-2xl` + nome token + valore.
- **Colori sidebar admin**: sidebar-background/foreground/primary/accent/border/ring.
- **Radius**: `--radius` e derivati (`sm`, `md`, `lg`) con box campione.
- **Shadow**: elenco delle shadow custom (se presenti come var) + `shadow-sm/md/lg/xl` Tailwind.
- **Spacing scale**: barre orizzontali per `p-1 … p-16`.

### 2. Typography
- Font stack: Tenor Sans (display) e DM Sans (body) — mostra pangram in ogni peso.
- Scala titoli: h1..h6 con classi effettive usate nel progetto (`text-2xl`, `text-5xl`, ecc.) applicando `font-display uppercase` dove è la regola del progetto.
- Body: `text-sm`, `text-base`, `text-lg` con DM Sans regular/medium.
- Utility: `.dc-link-action` esempio.

### 3. Primitive shadcn
Griglia responsive; ogni card mostra tutte le variant/stati principali.

- Button: variant `default | secondary | outline | ghost | link | destructive` × size `sm | default | lg | icon`, + stato disabled + pill (`rounded-full`).
- Input, Textarea, Select, Checkbox, Radio, Switch, Slider — normali + disabled.
- Badge: `default | secondary | outline | destructive`.
- Avatar: singolo, con fallback, stack sovrapposto (pattern usato in CastingRow).
- Progress: 0%, 40%, 100% (verifica il fix contrasto già applicato).
- Tabs, Tooltip, Popover, Dialog (con trigger), Dropdown Menu, Toast (trigger button).
- Skeleton, Separator, Accordion.
- Table (mini esempio).

### 4. Pattern dotCasting
Componenti/classi custom del progetto.

- `.dc-card` — card vuota + card con contenuto.
- Badge stati casting: Bozza (ambra), Attivo (verde `#729128`), Archiviato (grigio) — con pallino + label, così come usati in `CastingRow`.
- Badge stati talent (charcoal / success / warning / destructive) usando i token `success/warning/olive/charcoal`.
- `FavoriteCastingStar` in variante ambra (attiva/inattiva).
- Link azione `.dc-link-action`.
- Anteprima sidebar admin: un mock statico di 240px larghezza che mostra logo+ADMIN, nav item attivo/inattivo, sezione Preferiti, footer utente (senza dati reali — dati hardcoded per la preview).
- Anteprima mobile bottom nav owner/talent (mock statico).

### 5. Blocchi complessi
Renderizzati con dati mock già presenti in `src/dev/mockTalent.ts` e `src/pages/shared/sharedRoundMock.ts`, oppure oggetti letterali locali.

- `TalentBoardCard` (importato) con `mockTalent`.
- `ActionableStatCard` in due stati: neutro (value 0, fondo chiaro) e "attenzione" (value > 0, fondo olive).
- `CastingRow` con casting mock (titolo, avatar stack, stato) — passare `onEdit`/`onDelete` come `() => {}`.
- `TriageTalentCard` mock.
- Tile talent della pagina cliente (`TalentTile` di `SharedRound`) se estraibile facilmente; altrimenti screenshot statico linkato — decisione in build: se il tile è definito inline in `SharedRound.tsx`, ricreare qui un piccolo `<div>` equivalente per evitare import complessi.

## Note tecniche
- Nessuna modifica ai componenti esistenti: la pagina è puramente consumer.
- Per swatch dei token, un piccolo helper `useTokenValue(name)` che legge `getComputedStyle(document.documentElement).getPropertyValue('--' + name)` in `useEffect`.
- Wrappare i blocchi complessi che dipendono da React Query in un `QueryClientProvider` — già presente a livello di `App`, quindi ok.
- I blocchi che richiedono dati Supabase reali (es. `useProfile` nella sidebar admin) NON vanno importati: usare la versione mock/statica descritta sopra.
- Aggiungere `<title>Design System · dotCasting</title>` via `document.title` in un `useEffect`.

## Fuori scopo
- Nessun playground/editor live di token.
- Nessuna persistenza.
- Nessuna modifica ai componenti UI o a `index.css`.
- Nessuna voce di menu nella sidebar admin/talent.
