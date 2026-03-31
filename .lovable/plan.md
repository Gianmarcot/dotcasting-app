

## Regioni e Province italiane con Select dinamici

### Panoramica

Quando l'utente seleziona "Italia" come stato di nascita, i campi Regione e Provincia diventano Select a tendina con dati reali italiani. La Provincia dipende dalla Regione selezionata. Se lo stato non e Italia, i campi restano Input di testo libero.

### Modifiche

#### 1. `src/lib/profileOptions.ts` — Aggiungere dati italiani

Aggiungere due costanti:
- `ITALIAN_REGIONS`: array delle 20 regioni italiane
- `ITALIAN_PROVINCES`: oggetto `Record<string, string[]>` che mappa ogni regione alle sue province (es. `"Lombardia": ["Milano", "Bergamo", "Brescia", ...]`)

#### 2. `src/components/profile/BasicInfoSection.tsx` — Logica condizionale

**Stato = "Italia"**:
- Regione → Select con `ITALIAN_REGIONS`
- Provincia → Select con `ITALIAN_PROVINCES[formData.birthRegion]`, disabilitato se nessuna regione selezionata
- Citta → Input testo (invariato)

**Stato ≠ "Italia"**:
- Regione → Input testo (come ora)
- Provincia → Input testo (come ora)  
- Citta → Input testo (invariato)

Quando l'utente cambia stato o regione, resettare i campi dipendenti (cambio stato → reset regione+provincia+citta; cambio regione → reset provincia).

### File da modificare

| File | Modifica |
|------|----------|
| `src/lib/profileOptions.ts` | Aggiungere `ITALIAN_REGIONS` e `ITALIAN_PROVINCES` |
| `src/components/profile/BasicInfoSection.tsx` | Logica condizionale Italia/estero per regione e provincia |

