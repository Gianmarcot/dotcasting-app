# Rendi la pagina di login la homepage

## Obiettivo
Per ora, l'accesso (`/auth`) diventa la homepage: il percorso `/` mostra direttamente la pagina di login/registrazione al posto della landing page attuale.

## Modifiche

- **`src/App.tsx`**: la rotta `/` renderizza `<AuthPage />` invece di `<Index />`.
  - Mantenere la rotta `/auth` invariata (stessa pagina) così i link esistenti restano validi.
  - La `Index` page non viene eliminata; semplicemente non è più la homepage. Le sue importazioni in `App.tsx` possono essere rimosse se non usate altrove.

## Note
- `AuthPage` gestisce già il redirect automatico degli utenti già autenticati (owner → `/owner`, talent → `/talent` o onboarding), quindi la homepage è sicura anche per utenti loggati.
- La landing `Index` resta disponibile in futuro per un eventuale ripristino.
