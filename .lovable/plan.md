

## Aggiornare la sezione Informazioni Personali

### Panoramica

Aggiungere i campi dallo screenshot alla sezione "Informazioni personali", escludendo quelli di contatto (telefono, WhatsApp, email) che restano nella sezione Contatti.

### Nuovi campi da aggiungere

| Campo | Tipo UI | Note |
|-------|---------|------|
| Nome d'arte | Input testo | Nuovo campo DB `stage_name` |
| Data di nascita | 3 Select (giorno/mese/anno) | Sostituisce l'input type=date attuale |
| Stato di nascita | Select | Nuovo campo DB `birth_country` |
| Regione | Input testo | Nuovo campo DB `birth_region` |
| Provincia | Input testo | Nuovo campo DB `birth_province` |
| Città di nascita | Input testo | Nuovo campo DB `birth_city` |
| Sesso | Radio (M / F) | Usa il campo `gender` esistente, ma con UI radio |
| Identità di genere | Select | Nuovo campo DB `gender_identity` |
| Rappresentanza | Radio (Agenzia / Freelance) | Usa `representation_type` esistente, spostato qui dalla sezione WorkInfo |

### Step 1 — Migrazione database

Aggiungere colonne alla tabella `profiles`:
- `stage_name` (text, nullable)
- `birth_country` (text, nullable)
- `birth_region` (text, nullable)
- `birth_province` (text, nullable)
- `birth_city` (text, nullable)
- `gender_identity` (text, nullable)

### Step 2 — Aggiornare profileOptions.ts

Aggiungere costanti:
- `MONTHS` — lista mesi in italiano (GENNAIO, FEBBRAIO, ...)
- `GENDER_IDENTITIES` — Maschile, Femminile, Non-binario, Altro

### Step 3 — Aggiornare BasicInfoSection.tsx

Ristrutturare il form per includere tutti i campi dello screenshot:
1. **Nome / Cognome** — 2 colonne (invariato)
2. **Nome d'arte** — campo singolo
3. **Data di nascita** — 3 Select affiancati (giorno 1-31, mese, anno) + checkbox "Confermo di aver compiuto 18 anni"
4. **Stato di nascita / Regione / Provincia / Città** — 4 campi in riga
5. **Sesso** — RadioGroup con M e F
6. **Identità di genere** — Select
7. **Rappresentanza** — RadioGroup (Agenzia / Freelance)
8. Rimuovere **Etnia** e **Paese** da questa sezione (spostati o rimossi)

### Step 4 — Aggiornare hooks

Aggiungere i nuovi campi (`stage_name`, `birth_country`, `birth_region`, `birth_province`, `birth_city`, `gender_identity`) nei tipi di `useUpdateProfile.ts` e `useUpdateProfileById.ts`.

### File da modificare

| File | Modifica |
|------|----------|
| Migrazione DB | Aggiungere 6 colonne a `profiles` |
| `src/lib/profileOptions.ts` | Aggiungere `MONTHS`, `GENDER_IDENTITIES` |
| `src/components/profile/BasicInfoSection.tsx` | Riscrivere il form con nuovi campi e layout |
| `src/hooks/useUpdateProfile.ts` | Aggiungere nuovi campi al tipo updates |
| `src/hooks/useUpdateProfileById.ts` | Aggiungere nuovi campi al tipo updates |

