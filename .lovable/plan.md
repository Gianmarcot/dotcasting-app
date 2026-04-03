## CRM Aziende — Piano di implementazione

### 1. Migrazione database
- Aggiungere colonne `email` e `vat_number` alla tabella `companies`
- Creare tabella `company_notes` (id, company_id, body, created_at, created_by_user_id) con RLS per owner/admin
- Policies: solo owner/admin possono gestire le note

### 2. Hook `useCompanies.ts`
- `useCompaniesWithStats()` — lista aziende con contatori derivati (casting totali, talent impiegati, ultimo contatto)
- `useCompany(id)` — singola azienda con dettagli completi
- `useCompanyCastings(companyId)` — casting collegati
- `useCompanyConfirmedTalents(companyId)` — talent con `company_status = 'confirmed'` nei ruoli dei casting dell'azienda
- `useCompanyNotes(companyId)` — note cronologiche
- `useCreateCompany`, `useUpdateCompany`, `useDeleteCompany`
- `useCreateCompanyNote`

### 3. Pagina lista aziende (`OwnerCompanies.tsx`)
- Sostituire mock data con dati reali
- Header con contatore, ricerca, filtro settore, ordinamento
- Card con iniziali, nome, settore, città, referente, 3 statistiche

### 4. Pagina dettaglio azienda (`OwnerCompanyDetail.tsx`)
- Header con iniziali, nome, settore badge, città, sito, email
- 3 stat card: casting totali, talent impiegati, ultimo contatto
- Pulsanti Modifica e "+ Nuovo casting" (apre CastingFormDialog con company_id precompilato)
- Colonna sx: casting collegati, talent confermati (chip), note cronologiche
- Colonna dx: referenti (da contacts_json), informazioni generali

### 5. Dialog creazione/modifica azienda (`CompanyFormDialog.tsx`)
- Form con: nome, settore, sede, email, sito web, P.IVA, note interne

### 6. Routing e integrazioni
- Aggiungere rotta `/owner/companies/:companyId` in App.tsx
- Aggiornare `CastingFormDialog` per accettare `defaultCompanyId` prop

### File da creare/modificare

| File | Azione |
|------|--------|
| Migrazione DB | Aggiungere colonne + tabella `company_notes` |
| `src/hooks/useCompanies.ts` | Creare — tutti gli hook |
| `src/pages/owner/OwnerCompanies.tsx` | Riscrivere — lista reale |
| `src/pages/owner/OwnerCompanyDetail.tsx` | Creare — profilo azienda |
| `src/components/companies/CompanyFormDialog.tsx` | Creare — form CRUD |
| `src/App.tsx` | Aggiungere rotta dettaglio |
| `src/components/castings/CastingFormDialog.tsx` | Aggiungere prop `defaultCompanyId` |
