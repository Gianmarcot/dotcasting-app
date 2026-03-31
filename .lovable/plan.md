

## Spostare la foto profilo in alto a sinistra

### Layout attuale

La foto profilo è nella sidebar destra (colonna 1/3), mentre BasicInfoSection è nella colonna principale sinistra (2/3).

### Nuovo layout proposto

Aggiungere una riga superiore **sopra** la griglia principale, con la foto profilo a sinistra e il nome/header a destra, affiancati. Poi sotto continua la griglia 2/3 + 1/3 come ora (senza la foto nella sidebar).

```text
┌──────────────┬──────────────────────────────┐
│  Foto        │  Nome, città, genere         │
│  Profilo     │  (header info)               │
└──────────────┴──────────────────────────────┘
┌─────────────────────────┬───────────────────┐
│  BasicInfo              │  Contatti          │
│  AboutMe                │  Indirizzo         │
│  Ruoli, Media, ...      │  Documenti, ...    │
└─────────────────────────┴───────────────────┘
```

### File da modificare

| File | Modifica |
|------|----------|
| `src/pages/talent/TalentProfile.tsx` | Creare una riga flex con ProfilePhotoSection + header nome/città prima della griglia; rimuovere ProfilePhotoSection e header dalla posizione attuale |
| `src/pages/owner/OwnerTalentEdit.tsx` | Stessa modifica: riga superiore con foto + nome, rimuovere foto dalla sidebar |

### Dettaglio

- Riga superiore: `flex items-start gap-6` con foto (larghezza fissa ~200px) e info nome a destra
- La `ProfilePhotoSection` viene rimossa dalla sidebar destra
- Il blocco nome/città/genere in `TalentProfile.tsx` (righe 53-63) viene spostato accanto alla foto
- In `OwnerTalentEdit.tsx` il titolo "Modifica Profilo" e il nome restano nell'header sopra, la foto si aggiunge accanto

