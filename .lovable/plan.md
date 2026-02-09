

## Piano: Aggiornare il logo in tutte le pagine

### Situazione attuale

Il logo appare in 4 punti dell'applicazione:

| Pagina | File | Formato attuale |
|--------|------|-----------------|
| Sidebar Talent | `TalentSidebar.tsx` | Immagine `logo.png` (versione scura) |
| Sidebar Owner | `OwnerSidebar.tsx` | Immagine `logo-white.png` (versione bianca su sfondo scuro) |
| Landing page (header) | `Index.tsx` | Testo HTML ("dot" + "Casting") |
| Pagina Login/Signup | `AuthPage.tsx` | Testo HTML ("dot" + "Casting") |

La sidebar Talent e Owner usano gia le immagini corrette per il rispettivo sfondo. Le pagine **Index** e **AuthPage** usano invece un logo testuale e non l'immagine.

### Modifiche previste

Sostituire il logo testuale con l'immagine `logo.png` (versione scura) nelle due pagine su sfondo chiaro:

**1. `src/pages/Index.tsx` (header della landing page, riga 11-14)**
- Importare `logo from "@/assets/logo.png"`
- Sostituire i due `<span>` con `<img src={logo} alt="dotCasting" className="h-7" />`

**2. `src/pages/AuthPage.tsx` (sopra il form, riga 120-123)**
- Importare `logo from "@/assets/logo.png"`
- Sostituire i due `<span>` con `<img src={logo} alt="dotCasting" className="h-8" />`

### Nessuna modifica necessaria

- **TalentSidebar**: usa gia `logo.png`
- **OwnerSidebar**: usa `logo-white.png` (corretto per sfondo scuro)

### Risultato

Il logo immagine sara coerente in tutta l'app, con la versione scura su sfondi chiari e quella bianca su sfondo scuro admin.
