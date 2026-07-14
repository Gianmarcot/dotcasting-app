Solo modifiche di UI/presentazione. Nessuna logica di business.

## 1. Progress bar al 100% → verde success
`src/components/ui/progress.tsx`: sostituire il fill di completamento da `bg-[hsl(var(--olive))]` a `bg-[hsl(var(--success))]` (token `--success` già presente, verde più saturo e leggibile). Traccia neutra invariata.

## 2. Badge stati casting in Semi Bold
`CastingRow.tsx` è già `font-semibold`. Da aggiornare:
- `src/components/castings/CastingCard.tsx`: aggiungere `font-semibold` alle etichette di stato.
- `src/pages/DesignSystem.tsx`: nel mock CastingRow (righe ~819) aggiungere `font-semibold` all'etichetta stato per coerenza visiva.

## 3. Sezione pulsanti riorganizzata in `DesignSystem.tsx`
Sostituire l'attuale blocco "Button · …" con una visualizzazione tabellare/ordinata a griglia che copra tutte le combinazioni:

- **Varianti** (una riga per ciascuna, size = md): `default`, `secondary`, `outline`, `ghost`, `link`, `destructive`, `olive`, `charcoal`, `disabled`.
- **Sizes** (per variante primaria): `sm 36px`, `md 40px`, `lg 48px` — mostrate affiancate con label altezza.
- **Con icona a sinistra**: per ciascuna size (sm/md/lg), variante default + secondary.
- **Con icona a destra**: per ciascuna size, variante default + secondary.
- **Solo icona (quadrati)**: `icon-sm 36×36`, `icon-md 40×40`, `icon-lg 48×48` in default, outline, ghost.
- **Stati**: hover (nota testuale), disabled, loading (opzionale se già usato altrove — altrimenti skip).

Ogni riga con label a sinistra (es. "Default / md / icon left") e componenti sulla stessa riga, sfondo `dc-card`, hairline separatore fra righe per leggibilità.

## 4. CastingRow: avatar Medium (48px)
`src/components/castings/CastingRow.tsx` righe 80-82: cambiare `h-7 w-7` (28px) in `h-12 w-12` (48px = size medium del design system). Aggiornare anche il negative margin di overlap (`-ml-2` → `-ml-3`) e il fallback text-size (`text-[10px]` → `text-xs`) per proporzione.
Aggiornare in parallelo il mock in `DesignSystem.tsx` (righe ~834-847) con le stesse classi.

## 5. Talent tile pagina cliente: riusare il componente reale
Nella `SubBlock "Talent tile (pagina cliente)"` di `DesignSystem.tsx`:
- Estrarre `TalentTile` (attualmente locale in `src/pages/shared/SharedRound.tsx`) in un file dedicato `src/pages/shared/TalentTile.tsx` ed esportarlo. `SharedRound.tsx` continua ad usarlo tramite import.
- Nel design system importare `TalentTile` reale e mostrarlo con 4 righe mock (usando `sharedRoundMock.ts` già esistente) su fondo scuro `#0F0F0F` (rispecchiando il contesto d'uso), in una griglia 2/4 colonne — così l'anteprima è 1:1 con la pagina cliente.
- Rimuovere l'attuale placeholder inline con `<img>` pravatar.

## Tecnico
- File modificati: `progress.tsx`, `CastingCard.tsx`, `CastingRow.tsx`, `DesignSystem.tsx`.
- File nuovo: `src/pages/shared/TalentTile.tsx` (semplice estrazione, stesso markup).
- Nessuna modifica a schema DB, hook, o logica.