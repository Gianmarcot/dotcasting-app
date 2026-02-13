

## Migliorare i campi profilo con Select e UI appropriate

### Analisi dei campi attuali

Dopo aver analizzato tutte le sezioni del profilo, ho identificato i campi che attualmente usano un semplice Input di testo ma che beneficerebbero di un Select (o altro componente piu adatto), dato che hanno un set finito di valori.

### Campi da convertire

#### 1. BasicInfoSection (`src/components/profile/BasicInfoSection.tsx`)

| Campo | Attuale | Nuovo | Note |
|-------|---------|-------|------|
| Genere | Input testo libero | Select | Le opzioni `GENDERS` esistono gia in `profileOptions.ts` |
| Etnia | Input testo libero | Select | Aggiungere `ETHNICITIES` a `profileOptions.ts` |
| Paese | Input testo libero | Select | Aggiungere `COUNTRIES` a `profileOptions.ts` |

#### 2. DocumentsSection (`src/components/profile/DocumentsSection.tsx`)

| Campo | Attuale | Nuovo | Note |
|-------|---------|-------|------|
| Nazionalita | Input testo libero | Select | Aggiungere `NATIONALITIES` a `profileOptions.ts` |

#### 3. WorkInfoSection (`src/components/profile/WorkInfoSection.tsx`)

| Campo | Attuale | Nuovo | Note |
|-------|---------|-------|------|
| Occupazione principale | Input testo libero | Select | Aggiungere `OCCUPATIONS` a `profileOptions.ts` |

#### 4. LanguagesSection (`src/components/profile/LanguagesSection.tsx`)

| Campo | Attuale | Nuovo | Note |
|-------|---------|-------|------|
| Aggiungi lingua | Input testo libero | Select con lista predefinita | Aggiungere `LANGUAGES` a `profileOptions.ts`, selezionare da lista invece di digitare |

### Sezioni gia OK (nessuna modifica)

- **MeasurementsSection**: gia usa Select per taglie, capelli, occhi
- **ContactInfoSection**: gia usa Select per prefissi telefonici
- **PhysicalFeaturesSection**: usa Checkbox (appropriato per booleani)
- **AbilitiesSection**: usa Checkbox da lista predefinita (appropriato)
- **TravelSection**: usa Checkbox per continenti + input libero per paesi specifici (appropriato)
- **AddressSection**: campi indirizzo restano Input (troppo specifici per un Select)
- **AboutMeSection**: textarea (appropriato)

### Dettaglio tecnico

**File: `src/lib/profileOptions.ts`**

Aggiungere le seguenti costanti:

- `ETHNICITIES`: lista di etnie (es. "Caucasica", "Africana", "Asiatica", "Latina", "Mediorientale", "Mista", "Altro")
- `COUNTRIES`: lista di paesi principali europei + extra
- `NATIONALITIES`: lista di nazionalita (es. "Italiana", "Francese", "Tedesca", ecc.)
- `OCCUPATIONS`: lista di occupazioni comuni (es. "Studente", "Impiegato/a", "Libero professionista", "Artista", "Disoccupato/a", "Altro")
- `LANGUAGES`: lista delle lingue piu comuni (es. "Italiano", "Inglese", "Francese", "Spagnolo", "Tedesco", ecc.)

**File: `src/components/profile/BasicInfoSection.tsx`**

- Importare `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` e le costanti `GENDERS`, `ETHNICITIES`, `COUNTRIES`
- Sostituire i 3 campi Input (gender, ethnicity, country) con componenti Select
- Aggiungere `handleSelectChange` per gestire i Select
- Il genere mostrera il `label` (es. "Maschio") ma salvera il `value` (es. "M")

**File: `src/components/profile/DocumentsSection.tsx`**

- Importare Select e `NATIONALITIES`
- Sostituire il campo Input "Nazionalita" con un Select

**File: `src/components/profile/WorkInfoSection.tsx`**

- Importare Select e `OCCUPATIONS`
- Sostituire il campo Input "Occupazione principale" con un Select

**File: `src/components/profile/LanguagesSection.tsx`**

- Importare Select e `LANGUAGES`
- Sostituire il campo Input per aggiungere lingua con un Select che filtra le lingue gia selezionate

### Risultato

Tutti i campi con valori predefiniti useranno Select box, rendendo la compilazione piu rapida, riducendo errori di battitura e garantendo dati coerenti nel database.

