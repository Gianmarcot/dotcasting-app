# Centra "I miei casting" e allinea la larghezza massima al Profilo

## Obiettivo
Portare le pagine `TalentCastings` e `TalentCastingDetail` a condividere la stessa larghezza massima e centratura della pagina `TalentProfileV2`.

## Stato attuato
- `TalentProfileV2.tsx` usa `mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28`.
- `TalentCastings.tsx` e `TalentCastingDetail.tsx` usano già `max-w-[1040px]`, ma manca `mx-auto` e non hanno il padding inferiore / spacing coerente con il Profilo.

## Modifiche
1. **`src/pages/talent/TalentCastings.tsx`**
   - Sostituire il wrapper `<div className="w-full max-w-[1040px] animate-fade-up">` con `mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28`.
   - Verificare che il contenuto interno (header, tabs, lista) mantenga la sua gerarchia visiva; il `space-y-6` si applichi correttamente ai blocchi principali.

2. **`src/pages/talent/TalentCastingDetail.tsx`**
   - Stesso aggiornamento del wrapper: `mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28`.
   - Mantenere i layout interni a due colonne e la logica di caricamento / errore invariati.

3. Verificare la build / preview per assicurarsi che il contenuto sia centrato rispetto alla stessa colonna del Profilo, anche su diverse viewport.
