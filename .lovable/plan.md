# Campo "Coppa" accanto alla taglia reggiseno

Per i profili di sesso femminile (maggiorenni, come oggi per la taglia reggiseno) il dato viene diviso in due tendine affiancate:

- Taglia reggiseno: solo le misure di fascia — 1ª (70), 2ª (75), 3ª (80), 4ª (85), 5ª (90), 6ª (95), 7ª (100).
- Coppa: solo le lettere — A, B, C, D, E, F.

Le lettere non compaiono più tra le opzioni della taglia reggiseno.

## Dati già inseriti

Chi ha salvato una lettera (es. "B") nella taglia reggiseno se la ritrova nel nuovo campo Coppa, con la taglia reggiseno vuota. Chi ha salvato una misura di fascia la mantiene dov'è. Nessun dato viene perso.

## Dove si vede il risultato

Nella scheda talent, nella comp card e nei PDF il dato viene mostrato unendo i due valori quando presenti (es. "3ª (80) C"), altrimenti solo quello disponibile.

## Dettagli tecnici

- `src/lib/profileOptions.ts`: `BRA_SIZES` limitata alle fasce; nuova `BRA_CUP_SIZES = ["A".."F"]`.
- `src/components/profile/v2/PhysicalCard.tsx`: nuovo `FloatingSelect` "Coppa" subito dopo "Taglia reggiseno", scritto in `talent_attributes.underwear_sizes` come chiave `cup` (JSON già esistente, nessuna colonna nuova).
- `src/lib/roleVisibility.ts`: aggiunta chiave `bra_cup` (label "Coppa") con la stessa condizione di `bra_size` (adulto + `gender === "F"`).
- Migrazione dati: singolo `UPDATE` su `talent_attributes` che, quando `underwear_sizes->>'bra'` è una lettera A–F, la sposta in `cup` e azzera `bra`. Nessun cambio di schema, RLS o grant.
- Lettura: `src/lib/casting/fetchRoundTalents.ts` compone `taglia_reggiseno` da fascia + coppa; verificare i punti che leggono `underwear_sizes` in `talentDetailData.ts` per usare la stessa composizione.
