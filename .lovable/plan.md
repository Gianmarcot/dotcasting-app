

## Piano: Espansione completa dei campi profilo talent

### Obiettivo
Aggiungere al profilo talent tutti i campi visibili nei form di onboarding allegati, organizzati in sezioni editabili separate.

### Analisi dei form allegati

Dai tre screenshot di onboarding ho identificato i seguenti campi da aggiungere:

**Step 1 - Competenze e Talenti**
| Campo | Tipo | Note |
|-------|------|------|
| Talenti/Ruoli | Multi-select | 3 gruppi di ruoli (Artistici, Tecnici creativi, Produzione) |
| Tipo rappresentanza | Radio | Agenzia vs Freelance |

**Step 2 - Dati Anagrafici (estesi)**
| Campo | Tipo | Note |
|-------|------|------|
| Telefono | Text + prefisso | Con selezione prefisso internazionale |
| WhatsApp | Text + prefisso | Numero separato |
| Nazionalita | Text/Select | Attualmente mancante |
| CAP | Text | Codice postale |
| Sesso | Radio | M/F (gia presente come gender) |
| Residenza | Object | Stato, Citta, Via, CAP |
| Domicilio | Object | Se diverso da residenza |
| Codice Fiscale | Text | Documento fiscale italiano |
| Citta di partenza | Array | Multiple citta per lavoro |
| Fotocopia documento | File | Upload documento |
| Passaporto | Boolean + Date | Ha passaporto + scadenza |
| Link social | Object | Instagram, TikTok, YouTube, X, Amazon |
| Sito web | Text | URL personale |
| Figli minorenni | Boolean | Checkbox |
| N. scarpe | Text | Numero di scarpe |
| Taglie intimo | Object | Taglia + specifico |
| Occupazione principale | Text | Lavoro attuale |
| Patenti | Multi-select | AM, A, A1, A2, B, C, D, E, BE, CE, DE, Nautica |
| Disponibilita viaggi | Object | Continenti + paesi |
| Visti | Array | Nazioni visitabili + durata |
| Partita IVA | Boolean + Text | Ha P.IVA + numero |

**Step 3 - Dati Fisici (estesi)**
| Campo | Tipo | Note |
|-------|------|------|
| Taglia giacca | Select | XS, S, M, L, XL, XXL |
| Taglia pantaloni | Select | 38, 40, 42, ... |
| Petto | Number (cm) | Misura torace |
| Vita | Number (cm) | Misura vita |
| Fianchi | Number (cm) | Misura fianchi |
| Larghezza spalle | Number (cm) | Misura spalle |
| Misura collo camicia | Number (cm) | Misura collo |
| Misura scarpe | Select | 35-50 |
| Lunghezza capelli | Select | Corti, Medi, Lunghi |
| Tipologia capelli | Select | Lisci, Ricci, Mossi, Ricci Afro, Dread |
| Lentiggini | Boolean | Checkbox |
| Diastema | Boolean | Checkbox |
| Piercing | Boolean | Checkbox |
| Tatuaggi | Boolean | Checkbox |
| Abilita | Multi-select | Danza, Palestra, Strumenti musicali, Canto, Sport |

### Schema Database

Devo aggiungere nuovi campi alle tabelle esistenti:

**Tabella `profiles` - nuovi campi:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  phone_prefix text,
  phone_number text,
  whatsapp_prefix text,
  whatsapp_number text,
  nationality text,
  postal_code text,
  residence_address jsonb,  -- {state, city, street, postal_code}
  domicile_address jsonb,   -- {state, city, street, postal_code}
  fiscal_code text,
  work_cities text[],
  id_document_url text,
  has_passport boolean DEFAULT false,
  passport_expiry date,
  social_links jsonb,       -- {instagram, tiktok, youtube, x, amazon}
  website_url text,
  has_minor_children boolean DEFAULT false,
  main_occupation text,
  driving_licenses text[],
  travel_availability jsonb, -- {continents, countries}
  visas jsonb,              -- [{country, duration}]
  has_vat_number boolean DEFAULT false,
  vat_number text,
  representation_type text  -- 'agency' | 'freelance'
```

**Tabella `talent_attributes` - nuovi campi:**
```sql
ALTER TABLE talent_attributes ADD COLUMN IF NOT EXISTS
  jacket_size text,
  pants_size text,
  chest number,
  waist number,
  hips number,
  shoulder_width number,
  neck_size number,
  shoe_size text,
  underwear_sizes jsonb,
  hair_length text,
  hair_type text,
  has_freckles boolean DEFAULT false,
  has_diastema boolean DEFAULT false,
  has_piercings boolean DEFAULT false,
  has_tattoos boolean DEFAULT false,
  abilities text[]
```

### Nuovi componenti profilo

Creare nuove sezioni per il profilo:

| Componente | Descrizione |
|------------|-------------|
| `TalentRolesSection.tsx` | Selezione ruoli/talenti con i 3 gruppi |
| `ContactInfoSection.tsx` | Telefono, WhatsApp, social links |
| `AddressSection.tsx` | Residenza e domicilio |
| `DocumentsSection.tsx` | Codice fiscale, passaporto, P.IVA, documento |
| `WorkInfoSection.tsx` | Occupazione, citta di partenza, patenti |
| `TravelSection.tsx` | Disponibilita viaggi e visti |
| `MeasurementsSection.tsx` | Tutte le misure corporee dettagliate |
| `PhysicalFeaturesSection.tsx` | Caratteristiche fisiche (lentiggini, piercing, ecc.) |
| `AbilitiesSection.tsx` | Abilita specifiche (danza, sport, ecc.) |

### Struttura aggiornata TalentProfile.tsx

```text
TalentProfile
├── Header (nome, location, genere)
├── Main Content (2/3)
│   ├── AboutMeSection (esistente)
│   ├── TalentRolesSection (NUOVO)
│   ├── MediaGallerySection (esistente)
│   ├── MeasurementsSection (NUOVO - sostituisce AppearanceSection)
│   ├── PhysicalFeaturesSection (NUOVO)
│   ├── AbilitiesSection (NUOVO)
│   ├── SkillsSection (esistente)
│   └── LanguagesSection (esistente)
└── Sidebar (1/3)
    ├── ProfilePhotoSection (esistente)
    ├── BasicInfoSection (esistente, esteso)
    ├── ContactInfoSection (NUOVO)
    ├── AddressSection (NUOVO)
    ├── DocumentsSection (NUOVO)
    ├── WorkInfoSection (NUOVO)
    └── TravelSection (NUOVO)
```

### Opzioni per i select

**Ruoli/Talenti (3 gruppi):**
```javascript
const TALENT_ROLES = {
  artistic: [
    "Modello/Modella", "Attore/Attrice", "Real people", "Steward/Promoter",
    "Piedista", "Manista", "Presentatore/Presentatrice", "Speaker radiofonico",
    "Doppiatore/Doppiatrice", "Stuntman", "Cantante", "Musicista",
    "Ballerino/Ballerina", "Performer"
  ],
  creative: [
    "Truccatore/Truccatrice", "Parrucchiere/Parrucchiera", "Fotografo/Fotografa",
    "Social Media Manager", "DOP", "Direttore di produzione", "Videomaker",
    "Content Creator", "Influencer", "Regista"
  ],
  production: [
    "Attrezzista", "Fonico", "Assistente di produzione", "Operatore/Operatrice",
    "Steadicam", "Driver", "Focus Puller", "Producer", "Location Manager", "Macchinista"
  ]
};
```

**Tipologia capelli:**
```javascript
const HAIR_TYPES = ["Lisci", "Ricci", "Mossi", "Ricci Afro", "Dread"];
```

**Patenti:**
```javascript
const DRIVING_LICENSES = [
  "AM", "A", "A1", "A2", "B", "C", "D", "E", "BE", "CE", "D+E", "Patente Nautica"
];
```

**Abilita:**
```javascript
const ABILITIES = ["Danza", "Palestra", "Strumenti musicali", "Canto", "Sport"];
```

### Piano di implementazione

1. **Migrazione database**: Aggiungere tutti i nuovi campi alle tabelle `profiles` e `talent_attributes`

2. **Aggiornare hooks**: Estendere `useUpdateProfile` e `useUpdateTalentAttributes` per gestire i nuovi campi

3. **Aggiornare traduzioni**: Aggiungere tutte le nuove label in `src/lib/i18n.ts`

4. **Creare nuovi componenti**: Implementare le 9 nuove sezioni del profilo

5. **Aggiornare TalentProfile**: Integrare tutte le nuove sezioni nel layout

6. **Rifattorizzare AppearanceSection**: Rinominare in `MeasurementsSection` e aggiungere tutti i campi misure

### Gestione dati strutturati

Per i campi complessi uso JSONB:
- `residence_address`: `{state, city, street, postal_code}`
- `social_links`: `{instagram, tiktok, youtube, x, amazon}`
- `travel_availability`: `{continents: [], countries: []}`
- `visas`: `[{country, duration}]`
- `underwear_sizes`: `{size, specific}`

### File da creare/modificare

| File | Azione |
|------|--------|
| Migrazione SQL | Creare nuovi campi database |
| `src/hooks/useProfile.ts` | Nessuna modifica (gia dinamico) |
| `src/hooks/useUpdateProfile.ts` | Estendere con nuovi campi |
| `src/hooks/useTalentAttributes.ts` | Estendere con nuovi campi |
| `src/lib/i18n.ts` | Aggiungere traduzioni |
| `src/lib/profileOptions.ts` | NUOVO - costanti per select |
| `src/components/profile/TalentRolesSection.tsx` | NUOVO |
| `src/components/profile/ContactInfoSection.tsx` | NUOVO |
| `src/components/profile/AddressSection.tsx` | NUOVO |
| `src/components/profile/DocumentsSection.tsx` | NUOVO |
| `src/components/profile/WorkInfoSection.tsx` | NUOVO |
| `src/components/profile/TravelSection.tsx` | NUOVO |
| `src/components/profile/MeasurementsSection.tsx` | NUOVO (sostituisce AppearanceSection) |
| `src/components/profile/PhysicalFeaturesSection.tsx` | NUOVO |
| `src/components/profile/AbilitiesSection.tsx` | NUOVO |
| `src/pages/talent/TalentProfile.tsx` | Aggiornare layout |

### Risultato atteso

- Profilo talent completo con tutti i campi visibili nei form di onboarding
- Sezioni organizzate logicamente e editabili indipendentemente
- Dati salvati correttamente nel database
- UI coerente con il design system esistente (classi `dc-*`)
- Tutti i campi opzionali per non bloccare l'utente

