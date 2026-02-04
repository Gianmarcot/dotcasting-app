
# Piano: Gestione Completa Casting lato Owner

## Panoramica
Implementare un sistema completo per creare, modificare, eliminare e gestire lo stato dei casting dalla sezione Owner. La pagina attuale utilizza dati mock - la trasformeremo in un'interfaccia funzionale collegata al database.

## Funzionalita Principali

### 1. Lista Casting con Dati Reali
- Visualizzazione di tutti i casting dal database (tabella `castings`)
- Conteggio candidature in tempo reale dalla tabella `applications`
- Filtri per stato (bozza, attivo, chiuso)
- Nome azienda recuperato dalla tabella `companies`

### 2. Creazione/Modifica Casting
Form completo con tutti i campi disponibili:
- Titolo (obbligatorio)
- Descrizione
- Categoria (film, spot, moda, evento, ecc.)
- Azienda cliente (selezione da companies esistenti)
- Location (array di citta)
- Date (inizio e fine)
- Compenso (importo + tipo + valuta)
- Immagine di copertina (opzionale)

### 3. Gestione Stato
- Transizioni: Bozza -> Attivo -> Chiuso
- Pulsanti rapidi per cambiare stato
- Conferma prima di chiudere un casting attivo

### 4. Eliminazione
- Eliminazione soft o hard con conferma
- Verifica candidature esistenti prima di eliminare

---

## Dettagli Tecnici

### Nuovi File da Creare

```text
src/hooks/useCastings.ts
   - Hook principale per fetch, create, update, delete casting
   - Query con join su companies e count applications

src/components/castings/CastingFormDialog.tsx
   - Dialog modale per creazione/modifica
   - Form con validazione Zod
   - Selezione azienda da dropdown

src/components/castings/CastingCard.tsx
   - Card singola con info casting
   - Menu azioni (modifica, cambia stato, elimina)

src/components/castings/CastingFilters.tsx
   - Filtri per stato e ricerca testuale

src/components/castings/DeleteCastingDialog.tsx
   - Dialog conferma eliminazione
```

### Modifiche a File Esistenti

```text
src/pages/owner/OwnerCastings.tsx
   - Rimozione mock data
   - Integrazione hooks reali
   - Stati loading/empty/error

src/lib/i18n.ts
   - Nuove traduzioni per form e messaggi
```

### Schema Hook `useCastings`

```typescript
// Query - lista con relazioni
const { data, isLoading } = useQuery({
  queryKey: ["owner-castings", filters],
  queryFn: async () => {
    const { data } = await supabase
      .from("castings")
      .select(`
        *,
        company:companies(id, name),
        applications(count)
      `)
      .order("created_at", { ascending: false });
    return data;
  }
});

// Mutations
- useCreateCasting()
- useUpdateCasting()
- useDeleteCasting()
- useUpdateCastingStatus()
```

### Form Fields Mapping

| Campo UI | Colonna DB | Tipo |
|----------|-----------|------|
| Titolo | title | text (required) |
| Descrizione | description | text |
| Categoria | category | text |
| Azienda | company_id | uuid (FK) |
| Location | locations | text[] |
| Data Inizio | start_date | date |
| Data Fine | end_date | date |
| Importo | compensation_amount | numeric |
| Tipo Compenso | compensation_type | text |
| Valuta | currency | text |
| Cover | cover_image_url | text |
| Stato | status | text |

### Flusso UX

```text
1. Owner apre /owner/castings
   -> Vede lista casting reali (o empty state)

2. Click "Crea Casting"
   -> Apre dialog con form vuoto
   -> Compila campi -> Salva come bozza

3. Click su card casting
   -> Menu con opzioni:
      - Modifica (apre dialog precompilato)
      - Pubblica / Chiudi (cambia stato)
      - Elimina (conferma)

4. Filtri in alto per stato
   -> Aggiorna query in tempo reale
```

### Gestione Immagine Cover (Opzionale)
- Upload su Supabase Storage bucket `casting-covers`
- Resize/ottimizzazione lato client
- Preview nel form

---

## Passaggi Implementazione

1. **Hook useCastings** - Logica dati completa
2. **CastingCard** - Componente card riutilizzabile
3. **CastingFormDialog** - Form creazione/modifica
4. **DeleteCastingDialog** - Conferma eliminazione
5. **CastingFilters** - Barra filtri
6. **OwnerCastings refactor** - Integrazione componenti
7. **Traduzioni i18n** - Testi italiani

---

## Note
- Il database ha gia la tabella `castings` con RLS policies per owner/admin
- Nessuna migrazione necessaria - lo schema e gia pronto
- Le companies sono gestite separatamente (pagina OwnerCompanies)
