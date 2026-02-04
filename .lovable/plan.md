
# Piano: Galleria Media per il Profilo Talent

## Obiettivo
Aggiungere una sezione galleria media al profilo talent che permetta di caricare foto aggiuntive e video per mostrare il proprio portfolio.

---

## Panoramica delle Modifiche

La galleria media permettera ai talent di:
- Caricare foto aggiuntive (oltre alla foto profilo principale)
- Caricare video di presentazione o showreel
- Riordinare i media tramite drag & drop
- Eliminare media non piu necessari
- Visualizzare i media in una griglia con lightbox

---

## Modifiche al Database

### 1. Nuova Tabella `talent_media`

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | uuid | Chiave primaria |
| `profile_id` | uuid | Riferimento al profilo |
| `media_type` | text | "photo" o "video" |
| `url` | text | URL del file nello storage |
| `thumbnail_url` | text | URL della thumbnail (per video) |
| `title` | text | Titolo opzionale |
| `sort_order` | integer | Ordine di visualizzazione |
| `created_at` | timestamp | Data creazione |
| `updated_at` | timestamp | Data ultimo aggiornamento |

### 2. Nuovo Bucket Storage `talent-media`

- Bucket pubblico per foto e video dei talent
- Organizzazione: `{user_id}/{media_type}/{filename}`

### 3. Politiche RLS

- Visualizzazione pubblica dei media
- Solo il proprietario puo inserire/modificare/eliminare i propri media

---

## Nuovi File da Creare

### Componenti UI

```text
src/components/profile/
  MediaGallerySection.tsx    <- Componente principale galleria
  MediaUploadButton.tsx      <- Bottone upload con selezione tipo
  MediaGridItem.tsx          <- Singolo elemento nella griglia
  MediaLightbox.tsx          <- Visualizzazione fullscreen
```

### Hooks

```text
src/hooks/
  useTalentMedia.ts          <- Query e mutations per i media
```

---

## Dettagli Implementativi

### MediaGallerySection.tsx

Componente principale che:
- Mostra una griglia responsive di foto/video
- Include bottone per aggiungere nuovi media
- Permette di eliminare media esistenti
- Gestisce stati di caricamento

```text
+--------------------------------------------------+
|  GALLERIA MEDIA                          [+ Add] |
+--------------------------------------------------+
|  +-------+  +-------+  +-------+  +-------+      |
|  | Foto  |  | Foto  |  | Video |  | Foto  |      |
|  |   1   |  |   2   |  |   1   |  |   3   |      |
|  +-------+  +-------+  +-------+  +-------+      |
|                                                  |
|  +-------+  +-------+                            |
|  | Foto  |  |  + +  |  <- Placeholder upload     |
|  |   4   |  |       |                            |
|  +-------+  +-------+                            |
+--------------------------------------------------+
```

### useTalentMedia.ts

Hook con:
- `useTalentMedia()` - Query per recuperare i media del profilo
- `useUploadMedia()` - Mutation per caricare nuovi file
- `useDeleteMedia()` - Mutation per eliminare media
- `useUpdateMediaOrder()` - Mutation per riordinare

### Flusso Upload

1. Utente clicca "Aggiungi Media"
2. Seleziona tipo (foto/video) e file
3. File caricato su storage bucket `talent-media`
4. Record creato in tabella `talent_media`
5. Griglia aggiornata automaticamente

---

## Integrazione nel Profilo

Il componente `MediaGallerySection` verra aggiunto nella colonna principale del profilo, dopo la sezione "About Me":

```tsx
// TalentProfile.tsx
<div className="lg:col-span-2 space-y-6">
  <AboutMeSection />
  <MediaGallerySection />  // <- Nuova sezione
  <AppearanceSection />
  <SkillsSection />
  <LanguagesSection />
</div>
```

---

## Limiti e Validazioni

| Parametro | Valore |
|-----------|--------|
| Max dimensione foto | 10MB |
| Max dimensione video | 100MB |
| Formati foto | JPG, PNG, WEBP |
| Formati video | MP4, MOV, WEBM |
| Max numero media | 20 per profilo |

---

## Riepilogo File

| File | Azione |
|------|--------|
| Database | Creare tabella `talent_media` |
| Storage | Creare bucket `talent-media` |
| `src/hooks/useTalentMedia.ts` | Creare nuovo |
| `src/components/profile/MediaGallerySection.tsx` | Creare nuovo |
| `src/components/profile/MediaUploadButton.tsx` | Creare nuovo |
| `src/components/profile/MediaGridItem.tsx` | Creare nuovo |
| `src/pages/talent/TalentProfile.tsx` | Aggiungere MediaGallerySection |
| `src/lib/i18n.ts` | Aggiungere traduzioni galleria |

