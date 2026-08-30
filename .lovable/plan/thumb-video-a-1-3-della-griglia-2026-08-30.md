# Thumb video a 1/3 della griglia

## Problema
Il `tileClass` condiviso è `w-[min(140px,calc((100%_-_32px)/3))]`. Su contenitori larghi (es. colonna profilo ~800px) il cap di 140px vince, quindi ogni thumb video occupa ~140px ≈ 1/6 della griglia. Deve invece occupare 1/3.

## Modifica (solo presentazione)
File: `src/components/profile/v2/MediaCard.tsx`

1. Resizzare il tile in base a `previewCount` quando è valorizzato:
   - Con `previewCount = 3` e gap 16px (2 gap): `w-[calc((100%-32px)/3)]` — niente cap di 140px, così ogni thumb è esattamente 1/3 del contenitore.
   - Senza `previewCount` (foto): resta il `tileClass` attuale `w-[min(140px,calc((100%_-_32px)/3))]`.

2. Applicare la classe corretta sia ai thumb dei video sia al tile `+N` (stessa larghezza).

3. Il `containerRef` non serve più per i video (capacity non usata quando `previewCount` è impostato): nessun cambiamento richiesto oltre al tile width.

## Non soggetto a modifica
- Sezione foto, modale, categorie, RLS, caricamento.

## Verifica
- Build OK.
- Visivo: 3 thumb video riempiono esattamente la larghezza della griglia (1/3 ciascuno); con >3 video, il tile `+N` occupa anch'esso 1/3 e la rigola resta di 3 tile visibili (overflow nascosto).
