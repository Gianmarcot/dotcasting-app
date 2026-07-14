Verifica parità visiva tra tabella reale (`OwnerCastings.tsx` + `CastingRow.tsx`) e mock nel Design System. La struttura griglia, gli header, i colori stato e le azioni ghost coincidono già; restano piccole discordanze di rendering.

## Differenze rilevate

1. **Stella preferito**: la riga reale usa `FavoriteCastingStar` (bottone `p-1.5` con hitbox) mentre il mock DS mostra una `<Star>` grafica statica. Il bottone reale sposta la stella per via del padding.
2. **Titolo**: nella riga reale il titolo è dentro `<div className="min-w-0">` con `font-medium`; nel mock DS è un semplice `span` con `truncate`. Peso e comportamento di troncamento diversi.
3. **Header colonne**: identici (Titolo/Selezione/Stato) → nessuna modifica.
4. **Layout griglia** (`grid-cols-[32px_1fr_180px_140px_120px]`): identico → nessuna modifica.
5. **Azioni & chevron**: già allineati (ghost `icon-md`) dopo l'ultimo intervento.
6. **Contatore "+N"**: già allineato (3 avatar + cerchio) dopo l'ultimo intervento.

## Modifiche

Solo presentazione, in `src/pages/DesignSystem.tsx` (mock CastingRow):

- Sostituire lo `<Star>` inline con `FavoriteCastingStar` in modalità visiva (passare un `castingId=""` non funziona perché il componente esegue la mutation). Soluzione: mostrare comunque un `<Star>` ma con lo stesso wrapper `p-1.5 rounded-full text-amber-400` così l'ingombro corrisponde 1:1 al componente reale (evitando side-effect di rete nel DS).
- Aggiornare il titolo del mock a `<div className="min-w-0"><span className="text-foreground font-medium truncate block">{c.title}</span></div>` per uguagliare peso e troncamento.
- Aggiungere `shrink-0` al `ChevronRight` del mock.

Nessuna modifica alla pagina reale (`OwnerCastings.tsx`/`CastingRow.tsx`): sono già la fonte di verità e coincidono col DS dopo questi ritocchi al mock.

## Tecnico
- File modificati: `src/pages/DesignSystem.tsx`.
- Nessun file nuovo. Nessuna modifica a hook, logica o schema.
