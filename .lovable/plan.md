# Collegare CardPreview a un talent reale (Corrie)

Oggi `/dev/card-preview` usa solo `MOCK_TALENT`. Aggiungiamo un selettore di sorgente dati così la stessa preview (sia PDF che Web, entrambi i preset) può essere renderizzata su un talent reale del DB — partendo da Corrie Burkart (profilo `4dca73b4-deab-436e-b408-2c190c0f34d4`, l'unico con foto e attributi popolati).

## Cosa cambia

1. **Nuovo helper `fetchTalentByProfileId`** in `src/lib/casting/fetchRoundTalents.ts`
   - Stessa `select` annidata già usata da `fetchRoundTalents`, ma su `profiles` filtrato per `id`.
   - Riusa `mapToTalent` per ottenere un `Talent` pronto.
   - Nessuna modifica a registry, preset o template.

2. **`src/dev/CardPreview.tsx`**
   - Nuovo stato `source: "mock" | "corrie"` con due bottoni nella barra (accanto a Preset/Render).
   - ID di Corrie come costante locale: `4dca73b4-deab-436e-b408-2c190c0f34d4`.
   - Negli effetti PDF e Web: se `source === "corrie"` si attende `fetchTalentByProfileId(CORRIE_ID)`, altrimenti si usa `MOCK_TALENT`.
   - `source` aggiunto alle dipendenze degli effetti (insieme a `presetKey`, `mode`, `reloadKey`).
   - Stato di errore già esistente gestisce il caso "talent non trovato".

## Fuori scope

- Nessuna ricerca/autocomplete talent: solo toggle Mock/Corrie, è una preview di dev.
- Nessuna modifica a `roundPreset.ts`, `talentFields.ts`, `TalentCardPDF.tsx`, `TalentCardWeb.tsx`.
- Nessuna modifica RLS: il profilo di Corrie è leggibile dagli owner/admin che usano la preview.

## Verifica

- `/dev/card-preview` → toggle "Corrie" → la card mostra nome reale, foto da `talent-media` e campi anagrafica/misure popolati.
- Switch Mock ↔ Corrie e Preset Essenziale ↔ Completo funzionano sia in modalità PDF che Web.
