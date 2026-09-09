# Coming Soon — campo email integrato + nuovo sfondo

## Cosa cambia

### 1. Campo email + pulsante integrato (stessa riga)
Sostituire l'attuale `FloatingInput` + `Button` separati con un singolo blocco: input a sfondo bianco con il pulsante "Avvisami" integrato a destra sulla stessa riga, stessa altezza e stesso border-radius del campo.

**Dettagli:**
- Sfondo del campo: bianco (`bg-white`) — il background della pagina è un'immagine, quindi il campo deve staccarsi
- Label/placeholder allineata a sinistra (oggi eredita `text-center` dal container e appare centrata)
- Layout: `flex` orizzontale — input `flex-1` + button `shrink-0` dentro un unico contenitore `rounded-2xl`
- Altezza e border-radius identici per input e button (`h-14 rounded-2xl`)
- Il button mantiene lo stile brand (bordeaux `bg-primary`), testo bianco
- Non modificare il componente `FloatingInput` condiviso — costruire il campo inline in `ComingSoon.tsx` con un `<input>` nativo + label flottante semplice, per avere controllo totale sul layout integrato

### 2. Sfondo
- Sostituire `auth-slide-1` con l'immagine caricata (due modelle su fondo terracotta, `dotc-comin-soon-cover.jpg`)
- L'immagine viene caricata come asset CDN (`lovable-assets create`) e referenziata via `.asset.json`
- Mantenere l'overlay fade (più scuro in basso) e tutti gli altri elementi (logo, titolo, marquee)
- Le figure sono sul lato destro/centrale: verificare che il testo centrato resti leggibile, eventualmente rinforzare l'overlay nella parte bassa

## File coinvolti
- `src/pages/ComingSoon.tsx` — refactor del form + swap sfondo
- `src/assets/` — nuovo `.asset.json` per l'immagine di sfondo

## Cosa NON cambia
- Logica di salvataggio email (supabase insert)
- Struttura generale della pagina (logo in alto, titolo centro, marquee in basso)
- Componenti condivisi del Design System (`FloatingInput`, `field.tsx`, `button.tsx`)
