## Auth: form senza card + slider immagini

Modifiche solo in `src/pages/AuthPage.tsx` + upload 4 immagini come Lovable Assets.

### 1) Slider sinistro
- Upload `001.jpg`, `002.jpg`, `003.jpg`, `017.jpg` via `lovable-assets` → `src/assets/auth-slide-*.jpg.asset.json`. Rimuovo `src/assets/auth-hero.jpg` (placeholder generato).
- Sostituisco `<img>` singolo con uno slider autoplay (no librerie extra):
  - State `index` 0→3, `useEffect` con `setInterval` 5s, transizione crossfade (opacity 700ms) sovrapponendo le immagini in `absolute inset-0`.
  - Pausa su hover (opzionale, semplice).
  - Frecce in basso-destra (come screenshot Webflow): due bottoni circolari `←` `→` per navigazione manuale.
  - Mantengo logo bianco in alto e claim editoriale in basso con overlay gradient per leggibilità.

### 2) Form senza card
- Rimuovo `<Card>/<CardHeader>/<CardContent>` attorno al form.
- Layout pulito stile Webflow: titolo grande centrato, sotto i campi e bottone full-width, link toggle login/signup sotto. Niente bordi, niente shadow, niente background bianco — sta sul `bg-background` cream.
- Mantengo invariata tutta la logica (`handleSubmit`, stati, redirect, validazioni).

### Vincoli
- Italiano, Tenor Sans titoli ALL CAPS, DM Sans body.
- Nessun tocco a AuthContext, routing, backend.
- Mobile: slider nascosto (`hidden md:block`), form centrato come prima ma senza card.
