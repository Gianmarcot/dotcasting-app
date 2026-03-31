

## Spostare BasicInfoSection nel lato sinistro e aggiornare Rappresentanza

### Modifiche

#### 1. Layout — Spostare BasicInfoSection nella colonna principale

In entrambi i file `TalentProfile.tsx` e `OwnerTalentEdit.tsx`:
- Spostare `<BasicInfoSection>` dalla sidebar destra (colonna 1/3) alla colonna principale sinistra (colonna 2/3), posizionandola come prima sezione sopra "About Me"
- Questo dara piu spazio ai campi del form

#### 2. Rappresentanza — Aggiornare le label

In `src/lib/profileOptions.ts`, cambiare le label di `REPRESENTATION_TYPES`:
- `"Freelance"` → `"Sono un Freelance"`
- `"Con Agenzia"` → `"Sono rappresentato in esclusiva da una Agenzia"`

#### File da modificare

| File | Modifica |
|------|----------|
| `src/pages/talent/TalentProfile.tsx` | Spostare BasicInfoSection nella colonna sinistra |
| `src/pages/owner/OwnerTalentEdit.tsx` | Spostare BasicInfoSection nella colonna sinistra |
| `src/lib/profileOptions.ts` | Aggiornare label REPRESENTATION_TYPES |

