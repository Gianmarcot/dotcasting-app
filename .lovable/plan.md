

## Dropdown status più essenziali

### Problema
I dropdown per "Con il talent" e "Con l'azienda" sono troppo elaborati: il trigger è un badge colorato arrotondato largo 120px, e ogni opzione nel menu contiene a sua volta un badge colorato annidato. Troppi livelli visivi.

### Soluzione

Semplificare entrambi i componenti `TalentStatusSelect` e `CompanyStatusSelect` in `src/pages/owner/OwnerCastingRoleDetail.tsx`:

1. **Trigger**: ridurre a `w-auto` (larghezza automatica), rimuovere `rounded-full`, usare un semplice testo con un piccolo dot colorato a sinistra (pallino 6×6px) per indicare lo stato. Sfondo trasparente, altezza compatta `h-7`.

2. **Opzioni nel dropdown**: rimuovere il badge annidato `<span>` con classi colorate. Mostrare solo il testo dell'etichetta preceduto dal pallino colorato, come testo semplice.

### Dettaglio tecnico

**`src/pages/owner/OwnerCastingRoleDetail.tsx`** (righe 368-406):

Trigger → `<SelectTrigger className="h-7 w-auto border-0 text-xs font-medium bg-transparent px-1.5 gap-1.5">` con dentro `<span className="h-1.5 w-1.5 rounded-full {dotColor}" />` + label testuale.

Opzioni → `<SelectItem>` con solo un dot + testo, senza badge wrapper.

Aggiungere una proprietà `dot` ai status options in `useRoleTalents.ts` per il colore del pallino (es. `dot: "bg-emerald-500"` per confermato, `dot: "bg-red-500"` per rifiutato, `dot: "bg-gray-400"` per neutri).

| File | Modifica |
|------|----------|
| `src/hooks/useRoleTalents.ts` | Aggiungere proprietà `dot` a ogni status option |
| `src/pages/owner/OwnerCastingRoleDetail.tsx` | Riscrivere i due componenti Select con dot + testo semplice |

