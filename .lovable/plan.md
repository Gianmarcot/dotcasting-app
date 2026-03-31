

## Ridisegno pagina Database Talent — Layout a due colonne con pannello filtri

### Panoramica

La pagina OwnerTalents viene completamente ristrutturata con un layout a due colonne fisse: pannello filtri verticale a sinistra (220px) e lista risultati a destra. Il pannello filtri usa accordion con badge conteggio filtri attivi. La lista risultati mostra righe talent con avatar, info, tag e metriche.

### Struttura dei file

| File | Azione |
|------|--------|
| `src/hooks/useTalents.ts` | Estendere `TalentFilters` e `TalentWithAttributes` con tutti i nuovi campi; estendere la query per fetchare tutti i dati necessari |
| `src/components/talents/TalentFilterPanel.tsx` | **Nuovo** — Pannello filtri laterale con accordion |
| `src/components/talents/TalentResultsList.tsx` | **Nuovo** — Lista risultati con header, chip filtri attivi, righe talent |
| `src/components/talents/TalentResultRow.tsx` | **Nuovo** — Singola riga talent nella lista |
| `src/pages/owner/OwnerTalents.tsx` | Riscrivere con layout a due colonne |
| `src/components/talents/TalentFilters.tsx` | Rimosso (sostituito da TalentFilterPanel) |

### Dettaglio tecnico

#### 1. `useTalents.ts` — Estensione filtri e query

**Nuovo `TalentFilters`:**
```typescript
export interface TalentFilters {
  search?: string;
  // Ruolo & disponibilità
  roles?: string[];
  availability?: string;
  // Anagrafica
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  nationality?: string;
  city?: string;
  genderIdentity?: string;
  representationType?: string;
  // Aspetto fisico
  ethnicity?: string;
  eyeColor?: string;
  hairColor?: string;
  hairLength?: string;
  // Misure
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  shoeMin?: number;
  shoeMax?: number;
  chestMin?: number;
  chestMax?: number;
  hipsMin?: number;
  hipsMax?: number;
  clothingSize?: string;
  // Competenze & lingue
  skill?: string;
  language?: string;
  // Info lavoro & viaggi
  hasVat?: boolean;
  travelAvailability?: string;
}
```

**Nuovo `TalentWithAttributes`** — aggiungere:
- `nationality`, `ethnicity`, `representation_type`, `gender_identity`, `stage_name`, `has_vat_number`, `travel_availability`, `fiscal_code`
- `attributes` esteso con: `chest`, `waist`, `hips`, `shoe_size`, `hair_length`, `jacket_size`, `shirt_size`, `pants_size`, `abilities`

**Query estesa**: selezionare tutti i campi profiles + talent_attributes necessari. Filtri server-side dove possibile (gender, city, nationality, ethnicity, representation_type, hair_color, eye_color, hair_length). Filtri client-side per: search (nome/cognome/stage_name), età (calcolata), range misure, skills, languages.

Aggiungere **`useTalentCount`** per il contatore "N su totale" — query separata senza filtri per il totale.

#### 2. `TalentFilterPanel.tsx` — Pannello filtri laterale

Componente con larghezza fissa `w-[220px]` con sfondo `bg-muted/50`, bordo destro `border-r`, altezza piena con scroll interno.

**Struttura:**
- Header: "Filtri" + link "Reset tutto" (dc-link-action)
- Campo ricerca con icona Search
- 6 gruppi Accordion (usando `@radix-ui/react-accordion` già installato):

**Gruppo 1 — Ruolo & disponibilità:**
- Ruolo talent: checkbox multipli (da `TALENT_ROLES` flat)
- Disponibilità: select

**Gruppo 2 — Anagrafica:**
- Sesso: select (da `GENDERS`)
- Età min/max: due input number
- Nazionalità: select (da `NATIONALITIES`)
- Città: input testo
- Identità di genere: select (da `GENDER_IDENTITIES`)
- Rappresentanza: select (da `REPRESENTATION_TYPES`)

**Gruppo 3 — Aspetto fisico:**
- Carnagione: select (da `ETHNICITIES`)
- Colore occhi: select (da `EYE_COLORS`)
- Colore capelli: select (da `HAIR_COLORS`)
- Lunghezza capelli: select (da `HAIR_LENGTHS`)

**Gruppo 4 — Misure:**
- Altezza min/max: input number (cm)
- Peso min/max: input number (kg)
- Taglia abbigliamento: select (shirt sizes)
- Scarpe min/max: input number
- Busto min/max: input number (cm)
- Fianchi min/max: input number (cm)

**Gruppo 5 — Competenze & lingue:**
- Competenza: input testo libero
- Lingua: select (da `LANGUAGES`)

**Gruppo 6 — Info lavoro & viaggi:**
- P.IVA: select sì/no
- Disponibilità viaggi: select

Ogni accordion trigger mostra una freccia che ruota (`transition-transform rotate-180`) e un badge blu con conteggio filtri attivi in quel gruppo (solo se > 0).

#### 3. `TalentResultsList.tsx` — Lista risultati

**Header:**
- Contatore "N talent su {totale}"
- Select ordinamento (Nome A-Z, Nome Z-A, Più recenti, Più vecchi, Completamento profilo)
- Bottone "Esporta CSV"

**Chip filtri attivi:** riga di badge con `×` per rimuovere singolarmente ogni filtro attivo. Ogni chip mostra label leggibile (es. "Sesso: Donna", "Altezza: 170-180 cm").

**Lista:** renderizza `TalentResultRow` per ogni talent.

#### 4. `TalentResultRow.tsx` — Riga talent

Layout riga orizzontale clickabile:
- Avatar con iniziali colorato (colore derivato dal nome)
- Nome completo, età, città
- Punto colorato disponibilità (verde/giallo/rosso)
- Tag con ruoli (primi 2-3) e caratteristiche principali
- A destra: percentuale completamento profilo (barra circolare piccola o testo), numero casting a cui ha partecipato

Il click apre `TalentDetailDialog` esistente.

#### 5. `OwnerTalents.tsx` — Layout principale

```text
┌──────────────────────────────────────────────┐
│  H1 "Database Talent"     [+ Nuovo Talent]   │
├──────────┬───────────────────────────────────┤
│ Filtri   │  Header: N su totale | Ordina |CSV│
│ ──────── │  [chip] [chip] [chip ×]           │
│ 🔍 Cerca │  ┌─────────────────────────────┐  │
│          │  │ Avatar Nome  Età  Città  ... │  │
│ ▸ Ruolo  │  │ Avatar Nome  Età  Città  ... │  │
│ ▸ Anagr. │  │ Avatar Nome  Età  Città  ... │  │
│ ▸ Aspett │  │ ...                          │  │
│ ▸ Misure │  └─────────────────────────────┘  │
│ ▸ Comp.  │                                   │
│ ▸ Lavoro │                                   │
└──────────┴───────────────────────────────────┘
```

Layout: `flex` con pannello filtri fisso a sinistra e contenuto flex-1 a destra. Il pannello filtri ha `sticky top-0` con altezza piena e scroll interno. Su mobile il pannello filtri viene nascosto e sostituito da un bottone che apre un Sheet.

#### 6. Completamento profilo per ogni talent

Per calcolare la percentuale di completamento nella lista, replicare la logica di `useProfileCompletion` come funzione pura `calculateProfileCompletion(profile, attributes, mediaCount)` riutilizzabile, applicata inline sui dati già fetchati.

#### 7. Conteggio casting

Aggiungere alla query un count delle applications per ogni talent (join client-side o query separata) per mostrare il numero di casting a cui ha partecipato.

### Mappatura filtri → campi DB

| Filtro | Tabella | Campo |
|--------|---------|-------|
| Ruolo | profiles | talent_categories (contains) |
| Sesso | profiles | gender |
| Nazionalità | profiles | nationality |
| Città | profiles | city (ilike) |
| Identità genere | profiles | gender_identity |
| Rappresentanza | profiles | representation_type |
| Carnagione | profiles | ethnicity |
| P.IVA | profiles | has_vat_number |
| Colore occhi | talent_attributes | eye_color |
| Colore capelli | talent_attributes | hair_color |
| Lunghezza capelli | talent_attributes | hair_length |
| Altezza | talent_attributes | height |
| Peso | talent_attributes | weight |
| Scarpe | talent_attributes | shoe_size |
| Busto | talent_attributes | chest |
| Fianchi | talent_attributes | hips |
| Taglia | talent_attributes | shirt_size |
| Competenze | talent_attributes | skills / abilities |
| Lingue | talent_attributes | languages |
| Età | profiles | birth_date (calcolata) |
| Viaggi | profiles | travel_availability (jsonb) |

