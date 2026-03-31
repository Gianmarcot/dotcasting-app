

## Pagina profilo talent in sola lettura

### Panoramica

Creare un nuovo componente `TalentPublicProfile` che mostra il profilo completo di un talent in modalita read-only, con hero section e layout a due colonne. Accessibile da:
- **Talent**: `/talent/profile/preview` — "Visualizza profilo pubblico"
- **Owner**: `/owner/talents/:profileId/view` — dal database talent e dalla pagina edit

### Nuovo file: `src/pages/shared/TalentPublicProfile.tsx`

Un singolo componente che accetta un `profileId` (da URL param o dal profilo dell'utente loggato).

**Struttura della pagina:**

```text
+--------------------------------------------------+
|  [← Indietro]                                    |
+--------------------------------------------------+
|  HERO SECTION                                    |
|  +--------+  Nome Cognome (Nome d'arte)          |
|  | FOTO   |  Eta · Sesso · Citta, Paese          |
|  | GRANDE |  Categorie/Ruoli [badge]              |
|  +--------+  Telefono · Email · Social links      |
+--------------------------------------------------+
|  COLONNA PRINCIPALE (2/3)  |  SIDEBAR (1/3)      |
|  - About me                |  - Contatti          |
|  - Media gallery           |  - Info lavoro       |
|  - Aspetto fisico          |  - Residenza         |
|  - Misure                  |  - Viaggi            |
|  - Competenze/Abilita      |                      |
|  - Lingue                  |                      |
|  - Documenti               |                      |
+--------------------------------------------------+
```

**Dati**: usa `useProfileById(profileId)`, `useTalentAttributesByProfileId(profileId)`, `useTalentMediaByProfileId(profileId)` per caricare tutti i dati. Nessun campo editabile, solo display con Card + label/valore.

**Hero section**: foto profilo grande (200px), a fianco nome completo + nome d'arte, eta calcolata dalla birth_date, sesso, citta/paese, badge per talent_categories, contatti rapidi (telefono, email).

**Sezioni read-only**: ogni sezione e una Card con titolo e griglia di label/valore. Per i campi array (skills, languages, abilities) si usano Badge. La media gallery mostra la griglia immagini/video con lightbox.

### Routing — `src/App.tsx`

Aggiungere due route:
- `<Route path="profile/preview" element={<TalentPublicProfile />} />` dentro le talent routes
- `<Route path="talents/:profileId/view" element={<TalentPublicProfile />} />` dentro le owner routes

### Link "Visualizza profilo pubblico"

**`src/pages/talent/TalentProfile.tsx`**: aggiungere un link/bottone nell'header che punta a `/talent/profile/preview`

**`src/pages/owner/OwnerTalentEdit.tsx`**: aggiungere un bottone nell'header accanto a "Indietro" che punta a `/owner/talents/${profileId}/view`

**`src/components/talents/TalentDetailDialog.tsx`**: aggiungere un bottone "Visualizza profilo" tra le azioni che naviga a `/owner/talents/${talent.id}/view`

### File da creare/modificare

| File | Azione |
|------|--------|
| `src/pages/shared/TalentPublicProfile.tsx` | Creare — pagina read-only completa |
| `src/App.tsx` | Aggiungere 2 route |
| `src/pages/talent/TalentProfile.tsx` | Link "Visualizza profilo pubblico" |
| `src/pages/owner/OwnerTalentEdit.tsx` | Bottone "Visualizza profilo" |
| `src/components/talents/TalentDetailDialog.tsx` | Bottone "Visualizza profilo" |

