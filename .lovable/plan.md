# Stile dei link "Password dimenticata" e "Registrati"

## Cosa cambia
- Il testo "Password dimenticata?" diventa "Password dimenticata", senza punto interrogativo.
- "Password dimenticata" assume lo stesso colore rosso brand di "Registrati", con lo stesso peso del testo.
- Entrambi i link ("Password dimenticata" e "Registrati"/"Accedi") si sottolineano al passaggio del mouse.

## Dettagli tecnici
- `src/lib/i18n.ts`: `auth.forgotPassword` → "Password dimenticata".
- `src/pages/AuthPage.tsx`:
  - pulsante password dimenticata: classi `text-sm text-primary font-medium hover:underline transition-colors`.
  - link registrazione/accesso: aggiungere `hover:underline` allo `span` con `text-primary font-medium`.
- Nessuna modifica alla logica di autenticazione.
