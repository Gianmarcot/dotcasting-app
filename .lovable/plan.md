# Audit generazione PDF invii — bug e fix

## Cosa ho verificato

Ho tracciato il flusso completo: wizard di creazione invio → `fetchRoundTalents` / `mapToTalent` → `resolveCard` → `TalentCardPDF` (renderer PDF) → RPC `get_shared_round` → drawer talent in `SharedRound.tsx`.

## Bug e discrepanze trovate

### 1. Categorie foto: la feature non esiste (punto 1)
Il wizard `RoundWizardDialog` **non ha alcun selettore di categorie foto**. Ha solo un dropdown "3 / 6 / tutte le foto" (`preset.photoCount`).

Sia `mapToTalent` (in `fetchRoundTalents.ts`) sia la RPC `get_shared_round` filtrano hardcoded a `category === 'main_photos'`. Quindi: solo le "Foto principali" finiscono sia nel drawer sia nel PDF. Nessuna delle altre 4 categorie foto (polaroids, mani, piedi, lavori) è mai selezionabile o mostrata.

→ Se questa deve essere una feature, va aggiunta esplicitamente (nuovo `preset.photoCategories: string[]`, UI di selezione nello step 2 del wizard, propagazione a `mapToTalent` e alla RPC).

### 2. Drawer cliente ≠ PDF sullo stesso invio (punti 2, 3, 10)
- Drawer (`SharedRound → TalentDetailSheet`): mostra **tutte** le `main_photos` del talent nell'ordine `sort_order`.
- PDF (`resolveCard`): usa `photos[0]` e `photos[1]` come cover, poi `photos.slice(2)` limitate da `preset.photoCount`.

Con `photoCount = 3` e 8 foto in DB: il drawer mostra 8 immagini, il PDF ne mostra 5 (2 cover + 3 gallery). Ordine coerente, ma **set diverso**.

→ Fix: normalizzare la sorgente. Opzioni:
- (a) drawer rispetta anche lui `preset.photoCount` (esporre il numero dalla RPC),
- (b) PDF include tutte le foto (rimuovere il limit di default) e il dropdown "3/6/tutte" viene mantenuto ma si applica coerentemente a entrambi.
Preferisco (a): meno rischio di rompere PDF già condivisi.

### 3. Griglia PDF non è 3-col fissa (punto 4) — BUG CONFERMATO
In `src/lib/casting/TalentCardPDF.tsx`, le pagine galleria fanno:
```tsx
{photos.map((src) => <View style={s.col}><Image ... /></View>)}
```
`s.col` ha `flex: 1`. Con `chunk(limited, 3)` l'ultima pagina può avere 1 o 2 foto: quelle immagini si espandono a metà/piena pagina, non restano nella cella 1/3.

→ Fix: nel `.map` della galleria, paddare l'array a lunghezza 3 e renderizzare `<View style={s.col} />` vuoto per gli slot mancanti.

### 4. Aspect ratio disallineato tra drawer / PDF / web card (punto 5) — BUG CONFERMATO
- Drawer condiviso: `aspect-[3/4]` (0.75, verticale alto).
- `TalentCardWeb` (preview interno wizard): `lg:aspect-[2/3]` (0.67).
- PDF: pagina 842×472, colonna ≈278pt di larghezza, altezza cella ≈454pt → ratio ≈ **3:5** (0.61, molto più stretta).

Le foto usano `objectFit: cover` ovunque, quindi vengono **croppate in modo diverso** in ciascuna vista.

→ Fix: allineare tutti e tre a uno stesso ratio (proposta: 2:3, comune nell'industria). Nel PDF significa cambiare formato pagina o l'altezza cella; nel drawer sostituire `aspect-[3/4]` con `aspect-[2/3]`.

### 5. Rigenerazione non automatica alla modifica foto (punti 8, 9)
`useUpdateRound` rigenera i PDF solo se: (a) preset cambiato, (b) talent aggiunti. Se il talent modifica il proprio profilo/foto **dopo** che l'invio è già stato condiviso, il PDF resta con dati vecchi finché l'utente non clicca manualmente "Rigenera" su `OwnerRoundDetail`.

→ Fix minimo: banner/warning su `OwnerRoundDetail` quando esiste almeno un talent la cui `profiles.updated_at` o `talent_media.updated_at` è successiva a `casting_round_talents.generated_at`, con CTA "Rigenera".
→ Fix completo (opzionale): trigger DB che marca il round come "stale" quando cambia una foto/profilo di un talent incluso.

## Non-bug (verifiche OK)

- **Punto 6 (mescolamento gallerie)**: ogni PDF è per singolo talent (`castings/{castingId}/rounds/{roundId}/{slug-nome}.pdf`). Nessun mix possibile.
- **Punto 7 (categorie vuote)**: `chunk([], 3)` → `[]`, nessuna pagina generata. Nessun layout rotto.
- **Punto 8 (dati cover)**: al momento della rigenerazione i dati sono freschi (fetch DB live). Il problema è quando non si rigenera (vedi #5).

## Piano di fix proposto (ordine consigliato)

1. **PDF grid fixed 3-col** (bug #3): patch `TalentCardPDF.tsx` per paddare la galleria a multipli di 3 con celle vuote.
2. **Aspect ratio uniforme 2:3** (bug #4): drawer `SharedRound`, `TalentCardWeb`, cella PDF.
3. **Set foto coerente drawer/PDF** (bug #2): la RPC `get_shared_round` restituisce `photo_count` dal preset e il drawer applica lo slice; oppure il drawer riflette esattamente la logica `resolveCard`.
4. **Warning "PDF non aggiornato"** su `OwnerRoundDetail` (bug #5): confronto `updated_at` vs `generated_at` con badge + CTA rigenera.
5. **[Feature opzionale]** Selezione categorie foto nel wizard: da confermare se serve davvero o se "solo main_photos" è per design.

## Dettagli tecnici

**Bug #3 fix esempio** (`TalentCardPDF.tsx`):
```tsx
{card.galleryPages.map((photos, i) => {
  const padded = [...photos, ...Array(3 - photos.length).fill(null)].slice(0, 3);
  return (
    <Page key={i} size={PAGE} style={s.page}>
      {padded.map((src, j) => (
        <View key={j} style={s.col}>
          {src && <Image src={src} style={s.cover} />}
        </View>
      ))}
    </Page>
  );
})}
```

**Bug #2 fix**: aggiungere `photo_count` al payload di `get_shared_round` (jsonb builder RPC) e in `SharedRound.tsx` fare `photos.slice(0, photoCount ?? photos.length)`.

## Domanda per confermare lo scope

Ti va bene procedere con i **fix 1–4** (bug puri, no cambio di funzionalità)? Il punto 5 (selezione categorie foto) è una **nuova feature**: dimmi se lo vuoi in questo giro o se lo trattiamo separatamente.
