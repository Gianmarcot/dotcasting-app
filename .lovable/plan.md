## Ristrutturazione AuthPage — Split screen

Modifica solo `src/pages/AuthPage.tsx`. Nessun cambio a logica auth, AuthContext, routing o backend.

### Layout desktop (≥ md)
- Contenitore root: `min-h-screen grid md:grid-cols-2`, rimuovo il centering attuale.
- **Pannello sinistro** (`hidden md:block relative`):
  - `<img>` full-bleed (`absolute inset-0 w-full h-full object-cover`), `rounded-r-[2rem]` per coerenza col linguaggio admin.
  - Padding interno `p-10 flex flex-col justify-between` con overlay leggero (gradient bordeaux→trasparente in basso) per leggibilità.
  - In alto: logo bianco (`logo-white.png`).
  - In basso: claim editoriale breve in Tenor Sans ALL CAPS + sottotitolo DM Sans (es. "La piattaforma di casting" / "Gestisci talent, ruoli e shortlist in un unico spazio").
- **Pannello destro** (`flex items-center justify-center p-6 md:p-12 bg-background`):
  - Card `.dc-card` `max-w-md w-full` con il form esistente (email, password, conferma password in signup, toggle Login/Registrati, link "Password dimenticata?" se già presente — mantengo lo stato attuale).
  - Logo bordeaux piccolo sopra il titolo (solo mobile, dato che a sinistra c'è già).

### Mobile (< md)
- Pannello sinistro nascosto (`hidden md:block`).
- Form centrato come oggi, con logo in cima.

### Immagine
- L'utente fornirà la foto. Nel frattempo uso un placeholder `src/assets/auth-hero.jpg` (genero immagine fast coerente con palette bordeaux/crema: scena editoriale cinematografica). L'utente potrà sostituirla caricando il file via chat in un secondo momento.

### Vincoli rispettati
- Italiano (it-IT), Tenor Sans/DM Sans, palette brand, `.dc-card`, logo asset rules.
- Nessuna modifica a `signIn`/`signUp`, redirect, o validazioni.
- Responsive: stack mobile pulito, split su desktop.
