
## Ristrutturazione Castings — Piano di implementazione

### 1. Migrazione Database

Nuova tabella `role_talents` per gestire il flusso individuale di ogni talent per ruolo:

| Campo | Tipo | Note |
|-------|------|------|
| id | uuid | PK |
| casting_role_id | uuid | FK → casting_roles |
| profile_id | uuid | FK → profiles |
| status | text | shortlisted, invited, confirmed_talent, sent_to_company, confirmed_company, rejected_company, rejected_talent |
| status_changed_at | timestamptz | timestamp ultimo cambio stato |
| added_by_user_id | uuid | chi ha aggiunto il talent |
| notes | text | note libere |
| created_at, updated_at | timestamptz | |

Aggiunta colonna `phase` alla tabella `casting_roles`:
- `phase` text DEFAULT 'draft' (draft, talent_search, in_management, completed)

Aggiunta colonne extra a `casting_roles`:
- `gender` text
- `age_min` int
- `age_max` int
- `budget` numeric
- `location` text
- `required_skills` text[]
- `notes` text

RLS: owner/admin full access.

### 2. Routing (App.tsx)

```
/owner/castings                    → lista casting
/owner/castings/:castingId         → dettaglio casting (lista ruoli)
/owner/castings/:castingId/:roleId → dettaglio ruolo (gestione talent)
```

Rimuovere la route `/owner/targets`.

### 3. Navigazione

Rimuovere "Target" dalla sidebar e dal mobile nav. La voce "Castings" copre tutto.

### 4. Componenti nuovi

| Componente | Scopo |
|-----------|-------|
| `OwnerCastingDetail.tsx` | Pagina dettaglio casting con lista ruoli |
| `OwnerCastingRoleDetail.tsx` | Pagina dettaglio ruolo con tabella talent |
| `CastingRoleCard.tsx` | Card per ogni ruolo nella lista |
| `RoleTalentTable.tsx` | Tabella talent con stato, progressione, azioni |
| `AddRoleDialog.tsx` | Form creazione/modifica ruolo |
| `AddTalentToRoleDialog.tsx` | Modale per aggiungere talent dal database |
| `RoleDefinitiveList.tsx` | Sezione talent confermati dall'azienda |

### 5. Hooks nuovi

| Hook | Scopo |
|------|-------|
| `useCastingRoles.ts` | CRUD ruoli con fase e specifiche |
| `useRoleTalents.ts` | CRUD talent per ruolo con cambio stato |

### 6. File da modificare

| File | Modifica |
|------|----------|
| `App.tsx` | Aggiungere route nested, rimuovere /owner/targets |
| `OwnerSidebar.tsx` | Rimuovere voce Target |
| `MobileBottomNavOwner.tsx` | Rimuovere Target dal menu "Altro" |
| `OwnerCastings.tsx` | Mantiene lista, link al dettaglio |
| `CastingCard.tsx` | Aggiungere click per navigare al dettaglio |

### 7. Ordine di esecuzione

1. Migrazione DB (role_talents + colonne casting_roles)
2. Hooks (useCastingRoles, useRoleTalents)
3. Componenti UI (da CastingRoleCard in su)
4. Pagine (OwnerCastingDetail, OwnerCastingRoleDetail)
5. Routing e navigazione
