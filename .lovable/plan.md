# Avviso codice fiscale senza sfondo nel box "Forza del Profilo"

L'avviso sul codice fiscale mancante resta dov'è, ma solo dentro il box "Forza del Profilo" perde il riquadro giallo.

## Comportamento

- Testo e collegamento invariati.
- Nessun fondo colorato e nessun riquadro: restano l'icona triangolo e il testo nel colore di avviso (#C88500), allineati come una riga di nota.
- Gli avvisi nella sezione Documenti e fiscalità mantengono il riquadro giallo attuale.

## Dettagli tecnici

- `src/components/profile/v2/ProfileStrengthCard.tsx`: sostituire `NoticeBox tone="warning"` con una riga `flex gap-3` (icona `AlertTriangle` + testo) che usa il token `--warning`, senza background né padding; mantenere `focusProfileSection("section-documents")` sul collegamento e la classe `mt-8`.
- `NoticeBox` in `src/components/profile/fields/FormFields.tsx` resta invariato.
