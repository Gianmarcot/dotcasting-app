# Nuova vista "lista compatta" nel Database talenti

Aggiungo una terza vista al Database talenti: un elenco di righe alte 80px, una per talent, costruito sulla stessa struttura della riga dei Casting (griglia a colonne, angoli a 8px, riempimento grigio chiaro al passaggio del mouse). La riga apre lo stesso pannello di anteprima già in uso nelle altre viste.

```text
┌── dc-card (bianco, p-6) ──────────────────────────────────────────────────────┐
│  Talento                 Città / età      Media              Etichette        │
│  ───────────────────────────────────────────────────────────────────────────  │
│   (•)  Giulia Ameglio    Milano · 16 anni  [📷 8] [▶ 2]      [Minore]          │
│                                                           [CF non inserito]  │
│   (•)  Marco Bianchi     Roma · 32 anni    [📷 6] [▶ 3]                       │
│   (•)  Luca Moretti      Napoli · 41 anni  [📷 5] [▶ 4]      [CF non inserito]│
│                                                              ›               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Cosa si vede

- **Avatar + nome**: avatar da 48px, nome in peso medio a 16px, staccato di 16px dall'avatar. Il nome è quello del talent (nome e cognome) o il nome d'arte, se presente.
- **Città / età**: esattamente come nella vista lista attuale ("Milano · 27 anni"), anche per l'estero.
- **Foto e video**: le stesse due pill con bordo della vista lista attuale, ma con la sola icona e il numero, senza le parole "foto" e "video".
- **Etichette**: colonna dedicata dopo i contatori, con i contrassegni già in uso: "Minore" e gli stati del codice fiscale ("CF non inserito", "CF non valido", "Senza CF italiano"). Sono allineati verticalmente riga per riga; le righe senza etichette restano vuote in quella colonna.
- **Fine riga**: solo la freccia a destra. Nessuna azione rapida di modifica o eliminazione.
- **Passaggio del mouse**: la riga si riempie di grigio chiaro con angoli a 8px, come nella pagina Casting. Nessun divisorio tra le righe.
- **Clic (o Invio da tastiera)**: apre il pannello di anteprima del talent, lo stesso delle altre viste.

## Come viene scelta la vista

- Il selettore di vista in alto a destra guadagna un terzo pulsante, per ultimo, con l'icona a righe con pallini e nome "Vista compatta"; stesso stile dei due attuali (cerchio 48px, bianco con ombra quando attivo).
- La scelta resta salvata tra le visite, come oggi.
- Ricerca, filtri, ordinamento e conteggio risultati funzionano identici anche nella nuova vista.

## Dettagli tecnici

**Nuovo file** `src/components/talents/TalentCompactList.tsx`
- `TalentCompactList({ talents, onSelectTalent })`: contenitore `dc-card overflow-hidden p-6` (come la pagina Casting) con riga di intestazioni ("Talento", "Città / età", "Media", "Etichette") allineata alla griglia, più le righe.
- `TalentCompactRow` (nello stesso file): `role="button"`, `tabIndex={0}`, `onClick`/`onKeyDown` Invio, `grid grid-cols-[minmax(240px,1fr)_180px_140px_260px_20px] items-center gap-4 px-4 h-20 rounded-lg hover:bg-muted/30 transition-colors`.
- Colonna 1: `Avatar size="md"` (con foto profilo; iniziali come alternativa) + `gap-4` + `text-base font-medium truncate`.
- Colonna 2: `buildMeta(talent)` in `text-sm text-muted-foreground`, `truncate`.
- Colonna 3: due pill `rounded-full border border-[#c7c7c7] bg-white px-3 h-9 text-[12px] font-medium` con `Camera` / `Play` (`h-5 w-5 strokeWidth={1.5}`) e il solo numero — stesse classi della vista lista, senza la parola.
- Colonna 4: `MinorPill` e `FiscalPill` (già in `TalentStatusPill.tsx`), `flex flex-wrap gap-2`; al `MinorPill` passo `className="bg-background"` così su fondo bianco resta leggibile (oggi è bianco perché sta sopra le foto scure).
- Colonna 5: `ChevronRight h-4 w-4 text-muted-foreground`.
- Dati: `useTalentsMediaCounts(ids)` e `useTalentsMainPhotos(ids)` (quest'ultimo solo per l'avatar di fallback quando la foto profilo manca), `buildDisplayName` / `buildMeta` da `TalentBoardCard`.
- Responsive: sotto `lg` sparisce la colonna etichette, sotto `md` la colonna media, sotto `sm` città/età; nome e avatar restano.

**Modifiche**
- `src/hooks/useTalentsMediaCounts.ts` (nuovo): sposto lì l'hook `useMediaCounts` oggi interno a `TalentPortfolioList.tsx`, senza cambiare la query; `TalentPortfolioList.tsx` lo importa da lì (nessun effetto visibile).
- `src/pages/owner/OwnerTalents.tsx`: `type ViewMode = "board" | "portfolio" | "compact"`, parsing localStorage aggiornato (`saved === "portfolio" || saved === "compact" ? saved : "board"`), terzo `ToggleGroupItem value="compact"` con `ListChecks` e `aria-label="Vista compatta"`, nuovo ramo di rendering con `TalentCompactList`. Stati di caricamento e "Nessun talent trovato" restano quelli attuali.
- `src/pages/DesignSystem.tsx`: blocco demo "TalentCompactRow" accanto a "CastingRow", con tre righe di esempio (con etichette, senza etichette, in hover) usando il componente reale.

**Verifica**
- Typecheck e log di build.
- Playwright su /owner/talents: selezione della nuova vista da screenshot, controllo di allineamento colonne, conteggi foto/video reali (compreso il caso "solo foto profilo" di Lorenzo Chiabai), etichette "Minore"/"CF non inserito", apertura del pannello di anteprima al clic; prova a 1280px e a 393px.
