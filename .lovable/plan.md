## Modifiche a `src/pages/owner/OwnerRoundDetail.tsx` e `src/components/castings/rounds/ClientPasswordCard.tsx`

Solo UI, nessuna modifica di logica o dati.

### 1. Griglia sempre a 3 colonne
In `OwnerRoundDetail.tsx`, cambiare la griglia da `grid-cols-2 md:grid-cols-3 xl:grid-cols-4` a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` così le card restano a 3 colonne anche a viewport ampi.

### 2. Password card allineata in alto con le card
Attualmente il layout wrappa `[grid + toolbar]` in una colonna e la password card in aside a fianco: la toolbar (search + toggle) spinge le card più in basso della password card.

Ristrutturare così quando `isShared`:
- Container flex/grid `lg:grid-cols-[1fr_340px]` a livello del contenuto principale.
- La toolbar (search + toggle raggruppa + counter) resta sopra, larghezza piena (span di entrambe le colonne) — usare un layout con `grid` esterno e la toolbar in una riga separata, poi riga sottostante con `[griglia | password card]` entrambe allineate a `items-start` così il top della password card coincide col top della prima card.
- La password card perde `lg:sticky lg:top-6` (o lo teniamo, opzionale — la teniamo per comodità).

### 3. Input password come da Design System
In `ClientPasswordCard.tsx` rimuovere `className="rounded-full h-11"` dall'`Input` così eredita lo stile default DS (stesso stile degli altri input della piattaforma).

### 4. Pulsante Back come in OwnerCastingDetail
In `OwnerRoundDetail.tsx` sostituire l'attuale link "Torna al casting" con:
```tsx
<Button variant="ghost" size="sm" onClick={() => navigate(`/owner/castings/${castingId}`)} className="-ml-2">
  <ArrowLeft className="h-4 w-4 mr-1" />
  Torna al casting
</Button>
```
identico per stile/paddings a quello di `OwnerCastingDetail.tsx`.
