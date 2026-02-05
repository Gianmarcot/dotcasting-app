

## Piano: Implementazione Gestione Target con Criteri di Ricerca e Matching Automatico

### Panoramica
Implementare un sistema completo di Target che permetta agli Owner di:
1. Creare target di ricerca con criteri strutturati per ogni casting
2. Salvare i criteri come template riutilizzabili
3. Eseguire matching automatico dei talenti in base ai criteri
4. Gestire shortlist manuali per ogni target

---

### Architettura del Sistema

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CASTING                                  │
│                           │                                      │
│           ┌───────────────┼───────────────┐                      │
│           ▼               ▼               ▼                      │
│      [TARGET 1]      [TARGET 2]      [TARGET N]                  │
│         │               │               │                        │
│    criteria_json   criteria_json   criteria_json                 │
│         │               │               │                        │
│         ▼               ▼               ▼                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │  MATCHING   │  │  MATCHING   │  │  MATCHING   │               │
│  │  TALENTI    │  │  TALENTI    │  │  TALENTI    │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│         │               │               │                        │
│         ▼               ▼               ▼                        │
│    [SHORTLIST]     [SHORTLIST]     [SHORTLIST]                   │
│  (selezione manuale)                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1. Database Schema

**Nuova tabella: `casting_targets`**

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | uuid | Primary key |
| casting_id | uuid | FK -> castings.id |
| name | text | Nome del target (es. "Modella 20-25 anni") |
| description | text | Descrizione opzionale |
| criteria_json | jsonb | Criteri di filtraggio strutturati |
| created_at | timestamp | Data creazione |
| updated_at | timestamp | Data modifica |
| created_by_user_id | uuid | Chi ha creato il target |

**Nuova tabella: `target_shortlist`**

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | uuid | Primary key |
| target_id | uuid | FK -> casting_targets.id |
| profile_id | uuid | FK -> profiles.id (il talent) |
| status | text | 'pending' / 'contacted' / 'confirmed' / 'rejected' |
| notes | text | Note dell'owner sul talent |
| added_at | timestamp | Quando aggiunto alla shortlist |
| added_by_user_id | uuid | Chi ha aggiunto |

**Struttura `criteria_json`:**

```json
{
  "gender": ["M", "F"],
  "age_min": 18,
  "age_max": 30,
  "cities": ["Milano", "Roma"],
  "categories": ["Modello/Modella", "Attore/Attrice"],
  "height_min": 170,
  "height_max": 185,
  "hair_colors": ["Biondo", "Castano"],
  "eye_colors": ["Azzurri", "Verdi"],
  "skills": ["Nuoto", "Danza classica"],
  "languages": ["Inglese", "Francese"],
  "has_tattoos": false,
  "has_piercings": false
}
```

---

### 2. RLS Policies

```sql
-- casting_targets: Solo Owner/Admin possono gestire
CREATE POLICY "Owners can manage casting targets"
ON public.casting_targets FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- target_shortlist: Solo Owner/Admin possono gestire
CREATE POLICY "Owners can manage shortlists"
ON public.target_shortlist FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));
```

---

### 3. Componenti Frontend

#### 3.1 Pagina OwnerTargets Ristrutturata

**Flusso UI:**
1. Lista casting attivi con conteggio target per ciascuno
2. Click su casting -> mostra i target associati
3. Possibilita' di creare nuovo target per il casting selezionato
4. Per ogni target: visualizza criteri, numero match, shortlist

#### 3.2 Nuovi Componenti

| Componente | Descrizione |
|------------|-------------|
| `CastingTargetsList.tsx` | Lista dei target per un casting |
| `CreateTargetDialog.tsx` | Dialog per creare/modificare un target |
| `TargetCriteriaForm.tsx` | Form multi-step per definire i criteri |
| `TargetMatchResults.tsx` | Visualizza talenti che matchano i criteri |
| `TargetShortlist.tsx` | Gestione della shortlist manuale |
| `ShortlistTalentCard.tsx` | Card talent nella shortlist con status/note |

#### 3.3 Struttura Pagina

```text
┌────────────────────────────────────────────────────────────┐
│  TARGET E SHORTLIST                                        │
│  Gestisci i target di ricerca per i tuoi casting           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Dropdown: Seleziona Casting]                             │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  TARGET PER "NOME CASTING"                [+ Nuovo Target] │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Target: Modella 20-25 anni                           │  │
│  │ Criteri: F, 20-25 anni, Milano/Roma, 170-180cm       │  │
│  │ Match: 45 talenti  |  Shortlist: 8 talenti           │  │
│  │ [Vedi Match] [Gestisci Shortlist] [Modifica] [...]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Target: Attore giovane                               │  │
│  │ Criteri: M, 25-35 anni, skills: Recitazione          │  │
│  │ Match: 23 talenti  |  Shortlist: 5 talenti           │  │
│  │ [Vedi Match] [Gestisci Shortlist] [Modifica] [...]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 4. Hooks React

| Hook | Funzione |
|------|----------|
| `useTargets(castingId)` | Fetch target per un casting |
| `useCreateTarget()` | Mutation per creare target |
| `useUpdateTarget()` | Mutation per modificare target |
| `useDeleteTarget()` | Mutation per eliminare target |
| `useTargetMatches(targetId)` | Esegue matching e ritorna talenti |
| `useShortlist(targetId)` | Fetch shortlist per un target |
| `useAddToShortlist()` | Aggiunge talent a shortlist |
| `useRemoveFromShortlist()` | Rimuove talent da shortlist |
| `useUpdateShortlistStatus()` | Aggiorna status nella shortlist |

---

### 5. Logica di Matching

Il matching avviene lato client per flessibilita', utilizzando la funzione esistente `useTalents` come base:

```typescript
// Pseudocodice della logica di matching
function matchTalentsWithCriteria(talents, criteria) {
  return talents.filter(talent => {
    // Genere
    if (criteria.gender?.length && !criteria.gender.includes(talent.gender)) 
      return false;
    
    // Eta'
    const age = calculateAge(talent.birth_date);
    if (criteria.age_min && age < criteria.age_min) return false;
    if (criteria.age_max && age > criteria.age_max) return false;
    
    // Citta'
    if (criteria.cities?.length && !criteria.cities.includes(talent.city)) 
      return false;
    
    // Categorie
    if (criteria.categories?.length) {
      const hasCategory = criteria.categories.some(c => 
        talent.talent_categories?.includes(c)
      );
      if (!hasCategory) return false;
    }
    
    // Altezza
    if (criteria.height_min && talent.attributes?.height < criteria.height_min) 
      return false;
    if (criteria.height_max && talent.attributes?.height > criteria.height_max) 
      return false;
    
    // Colore capelli/occhi
    if (criteria.hair_colors?.length && 
        !criteria.hair_colors.includes(talent.attributes?.hair_color)) 
      return false;
    
    // Skills, lingue, tatuaggi, piercing...
    // ... logica simile
    
    return true;
  });
}
```

---

### 6. File da Creare/Modificare

| File | Azione | Descrizione |
|------|--------|-------------|
| `supabase/migrations/xxx_create_targets.sql` | Creare | Schema DB |
| `src/hooks/useTargets.ts` | Creare | CRUD target |
| `src/hooks/useShortlist.ts` | Creare | Gestione shortlist |
| `src/hooks/useTargetMatching.ts` | Creare | Logica matching |
| `src/components/targets/CastingTargetsList.tsx` | Creare | Lista target |
| `src/components/targets/CreateTargetDialog.tsx` | Creare | Dialog creazione |
| `src/components/targets/TargetCriteriaForm.tsx` | Creare | Form criteri |
| `src/components/targets/TargetCard.tsx` | Creare | Card singolo target |
| `src/components/targets/TargetMatchResults.tsx` | Creare | Risultati match |
| `src/components/targets/TargetShortlist.tsx` | Creare | Gestione shortlist |
| `src/components/targets/ShortlistTalentCard.tsx` | Creare | Card in shortlist |
| `src/pages/owner/OwnerTargets.tsx` | Modificare | Pagina principale |
| `src/lib/i18n.ts` | Modificare | Traduzioni |
| `src/integrations/supabase/types.ts` | Auto-generato | Tipi aggiornati |

---

### 7. Fasi di Implementazione

**Fase 1: Database**
- Creare tabelle `casting_targets` e `target_shortlist`
- Configurare RLS policies
- Aggiungere foreign keys

**Fase 2: Hooks Base**
- `useTargets` con CRUD completo
- `useShortlist` con gestione membri

**Fase 3: UI Lista Target**
- Ristrutturare `OwnerTargets.tsx`
- Creare `CastingTargetsList` e `TargetCard`
- Selettore casting

**Fase 4: Creazione Target**
- `CreateTargetDialog` con form criteri
- Validazione e salvataggio `criteria_json`

**Fase 5: Matching**
- Implementare `useTargetMatching`
- `TargetMatchResults` con griglia talenti
- Pulsante "Aggiungi a Shortlist"

**Fase 6: Gestione Shortlist**
- `TargetShortlist` con lista membri
- Status management (pending/contacted/confirmed)
- Note per ogni talent

---

### Risultato Atteso

1. Sistema completo per creare target di ricerca strutturati
2. Matching automatico basato su criteri multipli
3. Gestione shortlist con stati e note
4. Interfaccia intuitiva integrata con i casting esistenti
5. Dati persistenti in database con RLS appropriato

