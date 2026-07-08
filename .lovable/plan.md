
## Obiettivo
Permettere a owner/admin di marcare un casting come "preferito" (stella) e mostrare i preferiti in una sezione dedicata della sidebar sotto le voci principali.

## Ambito
Preferiti **condivisi dal team**: la stella è un flag sul casting, visibile e modificabile da tutti gli staff.

## 1. Database
Nuova migrazione che aggiunge una colonna al casting:

- `ALTER TABLE public.castings ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;`
- Indice parziale `CREATE INDEX ON public.castings (updated_at DESC) WHERE is_favorite;` per la lista sidebar.

Nessuna nuova tabella, nessun cambio di RLS/GRANT (le policy esistenti su `castings` coprono già l'update da parte di owner/admin).

## 2. Hook / dati
- `src/hooks/useCastings.ts`: aggiungere `useToggleCastingFavorite({ id, is_favorite })` che fa `update({ is_favorite }).eq('id', id)` e invalida `owner-castings`, `favorite-castings`, `casting-detail`.
- Nuovo hook `useFavoriteCastings()` in `src/hooks/useFavoriteCastings.ts`: `select id, title, status` da `castings` con `is_favorite = true`, ordinati per `updated_at desc`, limit 20. Query key `["favorite-castings"]`.

## 3. UI stella su casting
Aggiungere un pulsante stella (icona `Star` di lucide, filled quando attiva, colore bordeaux) che chiama `useToggleCastingFavorite`:

- `src/components/castings/CastingCard.tsx` — angolo in alto a destra.
- `src/components/castings/CastingRow.tsx` — prima cella o accanto al titolo.
- `src/pages/owner/OwnerCastingDetail.tsx` — accanto al titolo H1, prima del badge di stato.

Click sulla stella: `stopPropagation` per non aprire il dettaglio, toast di conferma ("Aggiunto ai preferiti" / "Rimosso dai preferiti").

## 4. Filtro nella lista casting
`src/pages/owner/OwnerCastings.tsx`: leggere `?favorites=1` dalla query string e, se presente, filtrare lato client (o estendere `CastingFilters` con `favoritesOnly` e applicarlo in `useCastings`). Aggiungere titolo dinamico "Casting preferiti" quando il filtro è attivo.

## 5. Sidebar
`src/components/layout/OwnerSidebar.tsx`: sotto la `<ul>` delle voci principali e prima del footer, aggiungere una nuova sezione:

```text
──────────────
★ Preferiti          [Vedi tutti →]
  • Titolo casting 1
  • Titolo casting 2
  • Titolo casting 3
  ...fino a 8
```

- Header "Preferiti" con icona `Star`, cliccabile → `/owner/castings?favorites=1`.
- Sotto, lista dei primi 8 casting preferiti da `useFavoriteCastings()`; ogni voce è un `Link` a `/owner/castings/:id` con testo troncato.
- Se lista vuota: piccolo testo muted "Nessun preferito".
- Sezione collassabile (default aperta), stato locale nel componente.
- Nascondere del tutto la sezione quando la sidebar è in stato collapsed (icon-only), in linea con il pattern esistente.

## 6. Fuori scopo
- Nessuna modifica alla pagina pubblica del round o al portale talent.
- Nessuna notifica associata al preferito.
- Nessun preferito per talent, aziende o applications.

## Dettagli tecnici
- Icona: `Star` da `lucide-react`, `fill="currentColor"` quando attiva, altrimenti solo stroke.
- Colore attivo: `text-primary` (bordeaux del design system), non hardcoded.
- Ordinamento sidebar: `updated_at desc` per riflettere le modifiche recenti in cima.
- Nessuna paginazione: limit 20 in query, 8 mostrati in sidebar.
