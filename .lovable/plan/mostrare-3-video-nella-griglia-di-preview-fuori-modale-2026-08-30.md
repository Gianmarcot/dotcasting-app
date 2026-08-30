# Mostrare 3 video nella griglia di preview (fuori modale)

## Obiettivo
La sezione video di `MediaCard` (fuori dalla modale) deve mostrare sempre **3 anteprime** nella griglia di preview, indipendentemente dalla larghezza del contenitore. Attualmente il numero di anteprime è calcolato dinamicamente dalla larghezza (`capacity`) e, in caso di overflow, viene riservato un posto per il pulsante `+N`.

## Modifica unica (solo presentazione)
File: `src/components/profile/v2/MediaCard.tsx`

1. Aggiungere una prop opzionale `previewCount?: number` al componente `MediaStrip`.
   - Quando omessa (foto): comportamento attuale invariato (capacità dinamica + `+N`).
   - Quando valorizzata (video, `previewCount = 3`): il numero di anteprime mostrate è fisso a `min(previewCount, items.length)`.
     - Se `items.length > previewCount`, si mostra il pulsante `+N` come tile aggiuntivo (mantenendo il trattamento grafico esistente).
     - Se `items.length <= previewCount`, si mostrano tutti i video senza `+N`.

2. Aggiornare la chiamata `MediaStrip` per i video passando `previewCount={3}`. La chiamata per le foto resta invariata.

3. La prop non influenza la modale, le categorie, i thumb quadrati, l'ordinamento né il caricamento: resta una pura modifica del conteggio visibile nella preview esterna.

## Non soggetto a modifica
- La modale `MediaGalleryModal`, le categorie video, le RLS, lo schema, il caricamento.
- La sezione foto (comportamento dinamico attuale preservato).

## Verifica
- `tsgo --noEmit` e build OK.
- Verifica visiva: con 5 video caricati, la preview mostra 3 thumb + tile `+2 video`; con 2 video mostra 2 thumb senza `+N`.
