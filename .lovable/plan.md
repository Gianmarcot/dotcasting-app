# Pagina Coming Soon

Landing page a tutto schermo che sostituisce la home (`/`). L'attuale `AuthPage` si sposta su `/auth`. Usa le componenti del Design System (`Surface inverse`, `FloatingInput`, `Button`) e le slide già presenti nel carosello auth come sfondo.

## 1. Database — tabella email

Nuova tabella `public.coming_soon_emails` per raccogliere le email lasciate dai visitatori.

```sql
CREATE TABLE public.comoming_soon_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

- Vincolo `UNIQUE` su `email` per evitare duplicati.
- `GRANT INSERT ON public.coming_soon_emails TO anon;` — la pagina è pubblica, nessun utente autenticato.
- `GRANT ALL ON public.coming_soon_emails TO service_role;` — lettura lato admin.
- `GRANT SELECT` non concesso a `anon`/`authenticated`: nessuno può leggere la lista delle email dal client.
- RLS abilitata, policy `INSERT` per `anon` senza condizioni; nessuna policy di `SELECT`/`UPDATE`/`DELETE` per ruoli web.

## 2. Componente pagina — `src/pages/ComingSoon.tsx`

Layout full-screen, tre zone verticali:

```
┌──────────────────────────────────┐
│  [logo-white]            (top)    │
│                                  │
│                                  │
│        Titolo centrato           │
│   "Lascia la tua email per       │
│    restare aggiornato"           │
│      [ campo email ]             │
│      [ pulsante Avvisami ]       │
│                                  │
│                                  │
│  ← Coming Soon • Coming Soon •→  │  (marquee)
└──────────────────────────────────┘
```

- **Sfondo**: immagine a pieno schermo (`auth-slide-1.jpg`, riusata). `object-cover`, `fixed`/`absolute inset-0`.
- **Overlay fade**: gradiente lineare verticale `from-black/40 via-black/20 to-black/70` sopra l'immagine (più scuro in basso). Garantisce contrasto per testo bianco e campo.
- **Contesto surface**: tutto avvolto in `<Surface variant="inverse">` così i token `--field-*` producono campo scuro con testo bianco, coerente col fondo.
- **Logo in alto**: `logo-white.png`, centrato, padding top.
- **Centro**: titolo Tenor Sans (`font-display uppercase`) + sottotitolo DM Sans + `FloatingInput` (type email) + `Button` (variant `default`, lg). Stato di caricamento e toast di conferma via `sonner`.
- **Marquee in basso**: striscia animata con testo "Coming Soon" ripetuto, scorre orizzontalmente. Aggiungo keyframe `marquee` in `tailwind.config.ts` (o CSS inline in `index.css`) e classe `animate-[marquee_18s_linear_infinite]`.

### Logica submit
- Validazione email lato client (regex semplice).
- `supabase.from("coming_soon_emails").insert({ email })` con `upsert: false` (gestisce il `UNIQUE`: se già presente, toast "Sei già registrato").
- On successo: toast "Ti avviseremo all'apertura", campo svuotato.
- On errore: toast di errore.

## 3. Routing — `src/App.tsx`

- `/` → `ComingSoon` (pubblica, nessun auth).
- `/auth` → `AuthPage` (spostata da `/`).
- Gli altri redirect interni (`getAuthRedirectBase` in `src/lib/appUrl.ts`) puntano già a basi relative: verificare che non si rompano col cambio di home. `AuthPage` redirect su login resta `/owner` o `/talent`.

## 4. SEO / Head
- Aggiorno `<title>` e `meta description` in `index.html` per riflettere la landing Coming Soon.

## Note tecniche
- Nessuna modifica a RLS esistenti o a tabelle utenti; solo nuova tabella pubblica in sola scrittura.
- La pagina è pubblica: niente `ProtectedRoute`.
- Componenti riusati: `FloatingInput`, `Button`, `Surface` — niente stile hardcoded fuori dai token.
- Le slide auth sono già importate come asset JSON (`auth-slide-*.jpg.asset.json`); si riutilizza `slide1.url`.

## File coinvolti
- `supabase/migrations/...coming_soon_emails.sql` (nuova migration via tool)
- `src/pages/ComingSoon.tsx` (nuovo)
- `src/App.tsx` (rotta `/` e `/auth`)
- `tailwind.config.ts` o `src/index.css` (keyframe marquee)
- `index.html` (title/meta)
