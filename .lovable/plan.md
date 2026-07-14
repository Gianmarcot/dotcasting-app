## Contesto

Nel drawer `TalentDetailSheet` di `src/pages/shared/SharedRound.tsx` ci sono due problemi:

- **Overflow**: lo swiper header usa `transform: scale()` su pill di larghezza variabile con `px-[40%]` hack e `mask-image`; le pill scalate escono dal box, l'attivo può traboccare a destra sopra le action, e le frecce a `-left-6 / -right-6` cadono fuori dal contenuto arrotondato. La colonna gallery ha un `max-h-[65vh]` con `maxWidth` calcolato inline che, su viewport lunghi, esce dal container. Il footer sticky con "Seleziona talent" si sovrappone al contenuto quando la colonna info è corta.
- **Usabilità switcher**: pill di taglia diversa a seconda del nome + scala progressiva rendono il tap target instabile, la mask taglia gli avatar ma resta un residuo scrollabile, e non è chiaro dove sto nella lista.

Ambito: solo presentazione, file `src/pages/shared/SharedRound.tsx`, sotto-componente `TalentDetailSheet`. Nessuna modifica a dati, RPC, PDF.

## Nuovo layout

### 1. Header ridisegnato (sostituisce lo swiper scala-variabile)

Riga singola, altezza fissa, tre zone chiare:

```text
[← 3 / 8 →]   [•  Nome talent attivo  (✓)]   [Scarica PDF] [×]
```

- **Cluster navigazione a sinistra**: pulsante prev icona, contatore `currentIdx+1 / talents.length` in font tenor 13px, pulsante next icona. Sostituisce le frecce esterne `-left-6/-right-6` (rimosse: creavano overflow e non sono scopribili). Disabilitati agli estremi.
- **Identità talent al centro**: singola pill grande con avatar + nome + eventuale check di selezione. Un solo elemento, sempre della stessa forma, `truncate` sul nome con `max-w` proporzionale allo spazio residuo. Niente scala progressiva, niente lista adiacenti nell'header.
- **Azioni a destra**: "Scarica PDF" (outline pill) + `×` chiudi. Invariato funzionalmente.
- **Rotellina talent (nuovo, opzionale)**: sotto l'header, una seconda riga sottile con mini-avatar tutti alla stessa scala (32px), scroll orizzontale nativo con snap (`snap-x snap-mandatory`), avatar attivo con ring bordeaux e auto-centrato via `scrollIntoView`. Nessuna trasformazione di scala, nessuna mask (i bordi sfumano solo con un gradient overlay `absolute` di 24px sinistra/destra sopra la riga, che non taglia il tap target). Ogni avatar mostra tooltip con nome; il check di selezione appare come pastiglia in alto a destra sull'avatar. Questa riga è opzionale: se `talents.length <= 1` non viene renderizzata.

Risultato: l'header ha altezza prevedibile, non trabocca mai, e la navigazione è raggiungibile sia da tastiera/click (prev/next contatore) sia da lista compatta (rotellina avatar).

### 2. Tastiera

- `ArrowLeft` / `ArrowRight` → talent prev/next (già presente lo swipe touch, resta).
- `Escape` → chiudi (già gestito dal Dialog).

### 3. Colonna gallery

- Rimuovere `maxWidth: "min(100%, calc(65vh * 2/3))"` inline e `max-h-[65vh]`. Sostituire con contenitore `flex items-center justify-center` che ospita l'immagine con `max-h-full max-w-full object-contain` all'interno di un wrapper `aspect-[2/3]` ma vincolato dal `min-h-0` del grid parent. In pratica: la gallery riempie l'altezza disponibile della riga, l'immagine si adatta senza mai eccedere. Nessuna barra orizzontale di overflow.
- Filmstrip miniature: mantenuto sotto, `overflow-x-auto` con classi corrette (`[&::-webkit-scrollbar]:hidden`, era scritto `[scrollbar-hide::-webkit-scrollbar]:hidden` che è invalido).

### 4. Colonna info + footer

- Rendere la colonna destra un `grid-rows-[1fr_auto]`:
  - Riga 1: contenuto scrollabile (`overflow-y-auto overscroll-contain`).
  - Riga 2: footer "Seleziona talent" — non più `sticky`, semplicemente ultima riga del grid con `border-t`. Elimina la sovrapposizione e il glitch quando il contenuto è corto.
- Footer sempre presente quando `selectable`, larghezza piena, pill bordeaux o outline (invariato).

### 5. DialogContent

- Rimuovere `overflow-visible` (serviva solo per le frecce esterne, ora rimosse) e tornare a `overflow-hidden`, così `rounded-3xl` si applica correttamente senza wrapper interno di clipping.
- Grid contenitore diventa `grid-rows-[auto_auto_1fr]` (header + rotellina avatar + body) su desktop; su mobile la rotellina resta visibile ma la gallery/info stackano come già oggi.

### 6. Pulizia stile

- `text-primary` residui su titoli sezione già portati a `text-[#1A1A1A]` in un giro precedente: verifica che non ne rimanga.
- Rimuovere `useRef` di `slotRefs` legati al vecchio switcher; il nuovo scroll-into-view usa un singolo `ref` sull'avatar attivo.

## Fuori scope

- Nessuna modifica a `SharedRound` fuori dal drawer, alla RPC, alla generazione PDF, ai dati o al design system globale.
- Nessun cambio al layout a due colonne o alle sezioni dati.
