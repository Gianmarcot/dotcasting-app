

## Correzioni UX dettaglio ruolo casting

### 1. Specifiche del ruolo — tornare al formato precedente

Attualmente le specifiche sono piccole `Badge variant="secondary"` compatte. Ripristinare il formato più leggibile usato prima: chip più grandi con sfondo muted, padding maggiore, testo leggermente più grande.

**`src/pages/owner/OwnerCastingRoleDetail.tsx`** (righe 164-172): sostituire i badge compatti con chip più spaziosi usando classi `bg-muted text-foreground rounded-full px-3 py-1 text-sm` inline su `<span>`, senza usare il componente Badge.

### 2. Avatar circolari e pulsanti icon-only rotondi

**Avatar** (riga 217): attualmente `h-10 w-14 rounded-md` — rettangolare. Cambiare in `h-10 w-10` (circolare, il rounded-full è già default dell'Avatar). Rimuovere `rounded-md` anche dal Fallback (riga 221).

**Pulsanti icon-only** (righe 258, 274, 292, 305): attualmente `h-8 w-8` con il default `rounded-full` dei pulsanti del design system. Verificare che siano effettivamente rotondi — aggiungere esplicitamente `rounded-full` se serve.

### 3. Ridurre i colori dei badge di stato

Troppi colori diversi (blu, verde, rosso, ambra, viola) creano rumore visivo. Semplificare la palette:

**`src/hooks/useRoleTalents.ts`** — aggiornare i colori:

| Status | Attuale | Nuovo |
|--------|---------|-------|
| Talent: none | bg-muted | bg-muted (invariato) |
| Talent: invited | bg-blue-100 text-blue-700 | bg-muted text-foreground |
| Talent: confirmed | bg-emerald-100 text-emerald-700 | bg-emerald-100 text-emerald-700 (invariato) |
| Talent: rejected | bg-red-100 text-red-700 | bg-red-100 text-red-700 (invariato) |
| Company: none | bg-muted | bg-muted (invariato) |
| Company: pending | bg-amber-100 text-amber-700 | bg-muted text-foreground |
| Company: proposed | bg-purple-100 text-purple-700 | bg-muted text-foreground |
| Company: confirmed | bg-emerald-100 text-emerald-700 | bg-emerald-100 text-emerald-700 (invariato) |
| Company: rejected | bg-red-100 text-red-700 | bg-red-100 text-red-700 (invariato) |

Solo 3 colori semantici: neutro (muted) per stati intermedi, verde per confermato, rosso per rifiutato/scartato.

### File da modificare

| File | Modifica |
|------|----------|
| `src/pages/owner/OwnerCastingRoleDetail.tsx` | Chip specifiche più grandi, avatar circolare, pulsanti rotondi |
| `src/hooks/useRoleTalents.ts` | Semplificare palette colori status |

