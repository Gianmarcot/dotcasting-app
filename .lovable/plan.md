## Redesign pagina dettaglio invio (`OwnerRoundDetail`)

Solo modifiche di layout/estetica su `src/pages/owner/OwnerRoundDetail.tsx`. Usa componenti dal Design System (Button variants, Input, Switch, dc-card, TalentTile style dal DS).

### Header
- Link "← Torna al casting" come `Button variant="link"` con underline, allineato in alto a sinistra (rimuove lo stile ghost attuale).
- Titolo `h1` in font-display uppercase (text-3xl, come `OwnerCastingDetail`), senza pill di stato accanto (la pill "Condiviso/Bozza" viene rimossa dall'header — lo stato è già chiaro dalla presenza della password card / azioni).
- Azioni a destra su stessa riga: due `Button variant="secondary" size="md"` pill:
  - "Copia Link" (icona `Link`) — visibile solo se `isShared`
  - "Rigenera" (icona `RotateCcw`) — sempre visibile
  - "Condividi" (primary md) — solo se non ancora condiviso
  - "Modifica" (secondary md, icona `Pencil`) — solo se non condiviso

### Toolbar filtri
- Search full-width `Input` con `rounded-full h-12` + icona search a sinistra, placeholder "Cerca un talent in questo invio".
- A destra sulla stessa riga: `Switch` "Raggruppa per stato" e contatore "{filtered.length} di {total} risultati" in muted.

### Layout a due colonne (quando `isShared`)
- Grid `grid-cols-[1fr_320px] gap-6`:
  - Colonna sinistra: griglia talent
  - Colonna destra: `ClientPasswordCard` (già esistente, resa `dc-card` con icona lucchetto in cima, titolo "PASSWORD CLIENTE" in etichetta base, descrizione, input "Nuova password", pulsante bordeaux "Salva" + link "Rimuovi").
- Quando non condiviso: colonna singola full-width.

### Griglia talent
- 4 colonne desktop (`grid-cols-2 md:grid-cols-3 xl:grid-cols-4`), gap 4.
- Ogni card: immagine `aspect-[3/4] rounded-2xl overflow-hidden`, con overlay in basso semitrasparente bordeaux, nome talent in `font-display uppercase text-white` e sotto la città in regular chiaro.
- Click apre `TalentPreviewDrawer` (invariato).
- Usa `VirtualBoardGrid` esistente se compatibile con il nuovo tile, altrimenti nuovo componente `RoundTalentTile` riprendendo lo stile del `TalentTile` del DS ma con overlay nome/città (verrà aggiunto anche a DesignSystem page).

### ClientPasswordCard
- Aggiornare styling interno: `dc-card` con `p-6`, icona `Lock` in alto, titolo etichetta base "PASSWORD CLIENTE", testo descrittivo muted, input rounded-full, riga con `Button` primary "Salva" e link "Rimuovi" (`dc-link-action`).

### Note tecniche
- Nessuna modifica di logica (hook, RPC, share, regen, wizard rimangono invariati).
- Rimozione della barra progress standalone durante rigenerazione (mantenuta la logica ma renderizzata compatta sopra la griglia).
- File toccati: `src/pages/owner/OwnerRoundDetail.tsx`, `src/components/castings/rounds/ClientPasswordCard.tsx`, nuovo `src/components/castings/rounds/RoundTalentTile.tsx`, aggiunta esempio a `src/pages/DesignSystem.tsx`.