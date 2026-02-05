

## Piano: Rendere Tutti i Campi del Profilo Modificabili dagli Owner

### Panoramica
Implementare la funzionalita' che permette agli Owner di visualizzare e modificare tutti i campi dei profili dei talent direttamente dall'area backoffice.

---

### Architettura della Soluzione

```text
+------------------+       +-----------------------+       +------------------+
|  OwnerTalents    | --->  | TalentDetailDialog    | --->  | OwnerTalentEdit  |
|  (Lista talents) |       | (Preview + Btn Edit)  |       | (Full Edit Page) |
+------------------+       +-----------------------+       +------------------+
                                                                    |
                                                                    v
                                                          +------------------+
                                                          | Profile Sections |
                                                          | (con profileId   |
                                                          |  prop opzionale) |
                                                          +------------------+
```

---

### Fasi di Implementazione

#### Fase 1: Aggiornamento Database e RLS

Aggiungere policy RLS per permettere agli Owner di aggiornare profili e attributi.

**Modifiche SQL:**

| Tabella | Nuova Policy |
|---------|--------------|
| `profiles` | Owner/Admin possono UPDATE qualsiasi profilo |
| `talent_attributes` | Owner/Admin possono INSERT/UPDATE qualsiasi attributo |
| `talent_media` | Owner/Admin possono gestire i media di qualsiasi talent |

---

#### Fase 2: Creazione Hooks Flessibili

Creare versioni dei hooks che accettano un `targetProfileId` opzionale per l'editing da parte degli Owner.

**File: `src/hooks/useProfileById.ts`** (nuovo)

Hook per caricare un profilo specifico tramite ID:
- Parametro: `profileId: string | null`
- Restituisce i dati del profilo specificato

**File: `src/hooks/useUpdateProfileById.ts`** (nuovo)

Hook per aggiornare un profilo specifico:
- Parametro nella mutation: `{ profileId, updates }`
- Invalida la query corretta

**File: `src/hooks/useTalentAttributesByProfileId.ts`** (nuovo)

Hook per caricare/aggiornare attributi di un profilo specifico:
- Simile a `useTalentAttributes` ma con `profileId` esplicito

---

#### Fase 3: Modifica Componenti Profilo

Aggiungere props opzionali a tutti i 20 componenti del profilo per supportare l'editing esterno.

**Pattern comune da applicare:**

```tsx
interface ProfileSectionProps {
  externalProfileId?: string;  // Se fornito, usa questo invece del profilo utente
  readOnly?: boolean;          // Opzionale: forza modalita' sola lettura
}

const BasicInfoSection = ({ externalProfileId, readOnly }: ProfileSectionProps) => {
  // Se externalProfileId e' fornito, usa useProfileById invece di useProfile
  const { data: profile } = externalProfileId 
    ? useProfileById(externalProfileId)
    : useProfile();
    
  const updateProfile = externalProfileId
    ? useUpdateProfileById()
    : useUpdateProfile();
  
  // ...resto del componente invariato
};
```

**Componenti da modificare:**

| Componente | Utilizza |
|------------|----------|
| BasicInfoSection | profiles |
| AboutMeSection | profiles |
| TalentRolesSection | profiles |
| ContactInfoSection | profiles |
| AddressSection | profiles |
| DocumentsSection | profiles |
| WorkInfoSection | profiles |
| TravelSection | profiles |
| ProfilePhotoSection | profiles + storage |
| MeasurementsSection | talent_attributes |
| PhysicalFeaturesSection | talent_attributes |
| AbilitiesSection | talent_attributes |
| SkillsSection | talent_attributes |
| LanguagesSection | talent_attributes |
| MediaGallerySection | talent_media |

---

#### Fase 4: Nuova Pagina Owner Talent Edit

**File: `src/pages/owner/OwnerTalentEdit.tsx`** (nuovo)

Pagina completa per modificare un talent, accessibile da `/owner/talents/:profileId/edit`.

**Layout:**
- Header con nome talent e pulsante "Torna alla lista"
- Layout identico a `TalentProfile.tsx` ma con tutti i componenti che ricevono `externalProfileId`

**Struttura:**

```tsx
const OwnerTalentEdit = () => {
  const { profileId } = useParams();
  const { data: profile } = useProfileById(profileId);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft /> Torna indietro
          </Button>
          <h1>Modifica profilo: {profile?.first_name}</h1>
        </div>
      </div>
      
      {/* Profile sections con externalProfileId */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BasicInfoSection externalProfileId={profileId} />
        <AboutMeSection externalProfileId={profileId} />
        {/* ... altri componenti ... */}
      </div>
    </div>
  );
};
```

---

#### Fase 5: Integrazione Navigazione

**Modifica: `src/components/talents/TalentDetailDialog.tsx`**

Aggiungere pulsante "Modifica profilo" nel dialog:

```tsx
<Button onClick={() => navigate(`/owner/talents/${talent.id}/edit`)}>
  <Pencil className="h-4 w-4 mr-2" />
  Modifica profilo
</Button>
```

**Modifica: `src/App.tsx`**

Aggiungere route per la nuova pagina:

```tsx
<Route path="talents/:profileId/edit" element={<OwnerTalentEdit />} />
```

---

### Sezione Tecnica

#### Nuovi File da Creare

| File | Descrizione |
|------|-------------|
| `src/hooks/useProfileById.ts` | Fetch profilo per ID |
| `src/hooks/useUpdateProfileById.ts` | Update profilo per ID |
| `src/hooks/useTalentAttributesByProfileId.ts` | Fetch/update attributi per profile ID |
| `src/pages/owner/OwnerTalentEdit.tsx` | Pagina modifica talent |

#### File da Modificare

| File | Modifica |
|------|----------|
| `src/App.tsx` | Aggiunta route `/owner/talents/:profileId/edit` |
| `src/components/talents/TalentDetailDialog.tsx` | Pulsante "Modifica profilo" |
| 15 componenti in `src/components/profile/` | Props `externalProfileId` |

#### Migrazione Database

```sql
-- Policy UPDATE per profiles
CREATE POLICY "Owners can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Policy INSERT per talent_attributes (per owner)
CREATE POLICY "Owners can insert talent attributes"
ON public.talent_attributes FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Policy UPDATE per talent_attributes (per owner) 
CREATE POLICY "Owners can update talent attributes"
ON public.talent_attributes FOR UPDATE
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Policy per talent_media (per owner)
CREATE POLICY "Owners can manage all media"
ON public.talent_media FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));
```

---

### Risultato Atteso

1. Gli Owner potranno cliccare su un talent nella lista e vedere il dialog di preview
2. Dal dialog, potranno cliccare "Modifica profilo" per aprire la pagina completa di editing
3. Nella pagina di editing, tutte le sezioni saranno modificabili esattamente come fa il talent stesso
4. Le modifiche verranno salvate direttamente nel profilo del talent
5. L'esperienza utente sara' identica a quella del talent nella sua area personale

