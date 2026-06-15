## Selezione talent per invio: filtro per stato o scelta manuale

Estensione dello **Step 1** del `RoundWizardDialog`: oggi mostra solo i talent con `company_status = 'confirmed'`. Diventa una selezione più flessibile basata sugli stati presenti in `role_talents` (`talent_status` ∈ none/invited/confirmed/rejected, `company_status` ∈ none/pending/confirmed).

### UI Step 1 (revisione)

In testa al pannello, un blocco "Modalità di selezione" con due opzioni (segmented control / radio):

1. **Per stato** (default)
   - Mostra dei chip filtro multi-selezione con i preset rapidi più utili:
     - Confermati lato azienda (`company_status = confirmed`) — preselezionato
     - Confermati lato talent (`talent_status = confirmed`)
     - Confermati su entrambi i lati (`talent_status = confirmed AND company_status = confirmed`)
     - Invitati lato talent (`talent_status = invited`)
     - In attesa lato azienda (`company_status = pending`)
   - Logica: i chip si combinano in **OR** (unione dei talent che rispondono ad almeno un filtro attivo). Sotto i chip compare la lista risultante (sola lettura) con conteggio "N talent selezionati".
   - Nessun chip attivo → lista vuota + "Avanti" disabilitato.

2. **Manuale**
   - Mostra **tutti** i talent del ruolo (qualsiasi stato), con badge stato compatto a destra del nome (es. "Conf. azienda", "Invitato"), checkbox per ognuno, "Seleziona tutti / Nessuno" in alto.
   - Stato vuoto se il ruolo non ha talent.

Cambiare modalità non azzera la selezione finché è coerente con i talent disponibili; al cambio mostriamo comunque l'elenco finale calcolato in modo deterministico (in modalità "Per stato" la selezione è derivata dai chip; in "Manuale" è quella esplicita).

Step 2 e Step 3 restano invariati: ricevono l'elenco finale di `roleTalentId`/`profileId` come oggi.

### Modifiche tecniche

- **`useRoleConfirmedTalents.ts`** → rinominato concettualmente in **`useRoleTalentsForRound`** (manteniamo il file, esportando anche il vecchio nome se necessario). Rimuove il filtro `.eq("company_status","confirmed")`, restituisce anche `talentStatus` e `companyStatus` per ogni riga. Nessuna nuova query, una sola fetch per ruolo.
- **`RoundWizardDialog.tsx`** (solo Step 1):
  - Nuovo state `selectionMode: 'by_status' | 'manual'` (default `by_status`).
  - Nuovo state `statusFilters: Set<FilterKey>` con `confirmed_company` attivo di default (replica il comportamento corrente).
  - Helper `applyStatusFilters(rows, filters)` puro per derivare la lista.
  - In manuale, riusiamo il pattern attuale di selezione a checkbox.
  - L'uscita dello Step 1 (`selectedTalents`) è sempre l'array finale, quindi gli step successivi non cambiano.
- In **modalità edit** del wizard: la selezione precaricata dal round entra in modalità `manual` (lista esplicita), così l'utente può rifinirla; può sempre passare a `by_status` per ricalcolarla.
- Copy in italiano, conforme allo stile esistente (Tenor Sans heading, badge senza hover).

### Fuori scope

- Nessuna modifica a `generateRound`, `roundPreset`, `FIELD_REGISTRY`, alle policy RLS o allo schema DB.
- Nessun nuovo hook oltre al rename/estensione di quello esistente.
- Nessuna logica nuova lato cliente pubblico.
