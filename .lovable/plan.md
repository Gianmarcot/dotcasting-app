## Modifiche componenti UI + Design System

### 1. Slider (`src/components/ui/slider.tsx`)
- Cambiare la traccia da `bg-secondary` (verde oliva) a `bg-muted` (neutro chiaro), coerente con Progress bar.
- Mantenere il riempimento `bg-primary` (bordeaux) per contrasto migliore.

### 2. Avatar — tre misure standard (`src/components/ui/avatar.tsx` + `src/index.css`)
- Introdurre size variants: `sm` = 32px, `md` = 48px (default), `lg` = 64px.
- Aggiornare `.dc-avatar-sm/md/lg` in `index.css` di conseguenza (attualmente md=40, lg=48).
- Nessun refactor dei consumer: le classi esplicite `h-* w-*` esistenti restano valide.

### 3. Tooltip fix
- Verificare `src/components/ui/tooltip.tsx` e wrapping `TooltipProvider` nella Design System page. Se manca il provider al livello app (`App.tsx`), aggiungerlo, oppure garantire che ogni uso in DesignSystem sia wrappato correttamente. Sistemare il delay/z-index se necessario.

### 4. Badge stati casting — semi-bold
- Nel componente/utility che rende i badge di stato casting (probabilmente `Badge` in `src/components/ui/badge.tsx` o wrapper stato), impostare `font-semibold` (600).
- Applicare solo agli status badges (Bozza/Attivo/Archiviato), non a tutti i badge globalmente — a meno che l'utente confermi. Piano: applicarli allo status badge dedicato per non alterare altri contesti.

### 5. Pulsanti — nuove size (`src/components/ui/button.tsx` + `.dc-btn-*` in `index.css`)
- `sm` → h-9 (36px)
- `md` (default) → h-10 (40px)
- `lg` → h-12 (48px)
- Rimuovere `xl` o rimappare `lg`→48px come richiesto.

### 6. Sezione pulsanti Design System + varianti icona
- Aggiungere varianti Button con `iconLeft` e `iconRight` (nuove prop opzionali o esempi con `<Icon />` interno).
- Padding asimmetrico quando c'è icona a sinistra: `pl-3 pr-7` (~12/28px), a destra viceversa. Applicare via classi condizionali nel `Button` in base a props `iconLeft`/`iconRight`, oppure documentare le classi utility da usare.
- Riorganizzare la sezione "Button" in DesignSystem in sottogruppi: **Varianti**, **Size (sm/md/lg)**, **Con icona (sinistra/destra/solo)**.

### 7. Pulsante solo-icona
- Size `icon` deve avere `h` = `w` (quadrato). Definire tre misure coerenti con le size: `icon-sm` 36×36, `icon-md` 40×40, `icon-lg` 48×48. Aggiornare `.dc-btn-icon` e le varianti.

### Note tecniche
- File toccati: `src/components/ui/{slider,avatar,button,badge}.tsx`, `src/index.css` (classi `.dc-btn-*`, `.dc-avatar-*`), `src/pages/DesignSystem.tsx`, `src/App.tsx` (TooltipProvider globale se mancante).
- Nessuna modifica a schema DB o business logic.
- Nessun consumer downstream refactor: le size esistenti restano compatibili (default = md = 40px).

### Domanda aperta
Per il punto 4 ("badge stati casting"): applico `font-semibold` **solo** al badge di stato casting, o a tutti i `Badge` del design system?
