

## Piano: Sistema di Rating e Tag per Immagini Talent

### Panoramica
Implementare un sistema che permetta agli Owner di valutare (rating da 1 a 5 stelle) e taggare le immagini/video dei Talent. Questo sistema sara' visibile solo agli Owner e permettera' di organizzare e filtrare il portfolio dei talent in base alla qualita' e ai tag assegnati.

---

### Architettura del Sistema

Il sistema di rating e tagging sara' separato dalla tabella `talent_media` per:
1. Mantenere la separazione delle responsabilita' (media del talent vs valutazioni dell'owner)
2. Permettere a diversi owner di avere valutazioni diverse
3. Facilitare query e filtri

---

### 1. Modifiche al Database

#### Nuova Tabella: `media_ratings`

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | uuid | Chiave primaria |
| `media_id` | uuid | FK a talent_media.id |
| `owner_user_id` | uuid | ID dell'owner che ha valutato |
| `rating` | integer | Valore da 1 a 5 (stelle) |
| `tags` | text[] | Array di tag assegnati |
| `notes` | text | Note private dell'owner |
| `created_at` | timestamp | Data creazione |
| `updated_at` | timestamp | Ultimo aggiornamento |

#### RLS Policies

```text
- Solo Owner/Admin possono creare, leggere, modificare ed eliminare rating
- Ogni owner vede solo i propri rating
- Constraint UNIQUE su (media_id, owner_user_id) per evitare duplicati
```

---

### 2. Nuovi Hook React

#### `src/hooks/useMediaRatings.ts`

| Hook | Descrizione |
|------|-------------|
| `useMediaRating(mediaId)` | Recupera rating e tag per un singolo media |
| `useMediaRatingsForProfile(profileId)` | Recupera tutti i rating per i media di un talent |
| `useSaveMediaRating` | Salva/aggiorna rating, tag e note |
| `useDeleteMediaRating` | Elimina un rating |

---

### 3. Componenti UI

#### 3.1 Componente Rating con Stelle

**File:** `src/components/media/MediaRatingStars.tsx`

```text
┌─────────────────────────────────────┐
│  ★ ★ ★ ★ ☆    Valutazione: 4/5     │
│  (Click su stella per modificare)   │
└─────────────────────────────────────┘
```

- 5 stelle cliccabili
- Stato hover per preview
- Indicatore visivo della valutazione corrente

#### 3.2 Componente Tag Editor

**File:** `src/components/media/MediaTagEditor.tsx`

```text
┌─────────────────────────────────────────────────────┐
│ Tags: [Fashion] [Portrait] [Outdoor] [+ Aggiungi]  │
│                                                     │
│ ┌───────────────────────────────────────────────┐  │
│ │ Digita un tag e premi Invio...                │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ Suggerimenti: Beauty, Runway, Commercial, Sporty   │
└─────────────────────────────────────────────────────┘
```

- Input per aggiungere nuovi tag
- Tag esistenti come badge rimovibili
- Suggerimenti basati su tag usati frequentemente

#### 3.3 Componente Rating Panel Completo

**File:** `src/components/media/MediaRatingPanel.tsx`

Pannello che combina rating, tag e note:

```text
┌─────────────────────────────────────────────────────┐
│ Valutazione Owner                              [X]  │
│─────────────────────────────────────────────────────│
│                                                     │
│ Rating:  ★ ★ ★ ★ ☆                                 │
│                                                     │
│ Tags:                                               │
│ [Fashion] [Portrait] [+ Aggiungi tag]              │
│                                                     │
│ Note private:                                       │
│ ┌───────────────────────────────────────────────┐  │
│ │ Ottima luce, posa naturale. Utile per...      │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│              [Salva]    [Annulla]                   │
└─────────────────────────────────────────────────────┘
```

---

### 4. Integrazione nella UI Esistente

#### 4.1 MediaGridItem (Vista Owner)

Aggiungere overlay con rating visibile nella griglia:

```text
┌─────────────────────────────┐
│                             │
│      [Immagine Talent]      │
│                             │
│───────────────────────────│
│ ★★★★☆  [Fashion][Portrait] │ <- Overlay bottom
└─────────────────────────────┘
```

**Modifiche a `MediaGridItem.tsx`:**
- Prop opzionale `showOwnerRating?: boolean`
- Mostrare mini stelle e tag in overlay
- Click su overlay apre il pannello rating

#### 4.2 MediaLightbox (Vista Owner)

Aggiungere pannello laterale nel lightbox per Owner:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ [<]                         [IMMAGINE GRANDE]                          [>]  │
│                                                                              │
│                             ┌───────────────────┐                           │
│                             │ Valutazione       │                           │
│                             │ ★★★★☆            │                           │
│                             │                   │                           │
│                             │ Tags:             │                           │
│                             │ [Fashion]         │                           │
│                             │ [Portrait]        │                           │
│                             │                   │                           │
│                             │ Note:             │                           │
│                             │ Ottima luce...    │                           │
│                             └───────────────────┘                           │
│                                                                              │
│                              1 / 12                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Modifiche a `MediaLightbox.tsx`:**
- Prop opzionale `isOwnerView?: boolean`
- Pannello laterale con rating/tag/note
- Auto-save al cambio di immagine

---

### 5. File da Creare/Modificare

| Operazione | File | Descrizione |
|------------|------|-------------|
| **CREATE** | `supabase/migrations/xxx_create_media_ratings.sql` | Tabella e RLS |
| **CREATE** | `src/hooks/useMediaRatings.ts` | Hook per CRUD rating |
| **CREATE** | `src/components/media/MediaRatingStars.tsx` | Componente stelle |
| **CREATE** | `src/components/media/MediaTagEditor.tsx` | Editor tag |
| **CREATE** | `src/components/media/MediaRatingPanel.tsx` | Pannello completo |
| **MODIFY** | `src/components/profile/MediaGridItem.tsx` | Aggiungere overlay rating (Owner) |
| **MODIFY** | `src/components/profile/MediaLightbox.tsx` | Aggiungere pannello laterale (Owner) |
| **MODIFY** | `src/components/profile/MediaGallerySection.tsx` | Passare props Owner |
| **MODIFY** | `src/components/talents/TalentDetailDialog.tsx` | Abilitare rating nella galleria |

---

### 6. Tag Suggeriti (Preimpostati)

Lista di tag comuni che verranno suggeriti agli owner:

```text
Categoria Stile:
- Fashion, Beauty, Commercial, Editorial, Runway, Sporty, Casual, Glamour

Categoria Tecnica:
- Portrait, Full-body, Close-up, Profile, Action, Lifestyle

Categoria Ambiente:
- Studio, Outdoor, Indoor, Urban, Nature, Beach

Categoria Qualita':
- Top Pick, Portfolio, Social, Web Only
```

---

### Risultato Atteso

1. Gli Owner possono valutare ogni media dei Talent con 1-5 stelle
2. Gli Owner possono assegnare tag multipli ad ogni immagine
3. Gli Owner possono aggiungere note private
4. Le valutazioni sono visibili nella griglia e nel lightbox
5. Sistema pronto per future feature di filtro/ricerca per rating/tag

