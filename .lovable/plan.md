# Esportazione mappa form talent in Excel (XLSX)

## Obiettivo
Generare un file `.xlsx` con la mappatura completa del form di registrazione/profilo talent (tutte le sezioni), pronto per il confronto con la piattaforma di riferimento.

## Struttura del file
Un'unica cartella di lavoro `mappa-form-talent.xlsx` con due fogli:

### Foglio 1 — "Mappa campi"
Tabella piatta (una riga per campo) con le 7 colonne richieste:
1. **Nome campo** — label mostrata all'utente
2. **Sezione/Gruppo** — sezione del profilo a cui appartiene
3. **Obbligatorio / Opzionale**
4. **Componente UI** — testo libero, select, select a cascata, radio, checkbox, upload singolo/multiplo
5. **Opzioni** — elenco completo per select/radio/checkbox
6. **Formato valore** — stringa, numero, data, array, booleano, enum
7. **Dipendenze** — condizioni di comparsa, select a cascata, ecc.

Formattazione: intestazioni in bordo brand, filtri attivi (autofilter), larghezze colonne calibrate, celle con testo avvolto. Campi con anomalie (non persistiti o ridondanti) evidenziati con riempimento giallo nella colonna "Nome campo".

### Foglio 2 — "Anomalie"
Riepilogo puntuale di:
- campi presenti nel form ma non salvati/collegati al DB
- campi duplicati/ridondanti tra step (es. gender `male/female` onboarding vs `M/F` profilo; 7 role label onboarding vs 34 nel profilo)
- colonne DB esistenti senza UI corrispondente (es. `ethnicity`, `id_document_url`)
- componenti inutilizzati (es. `AppearanceSection.tsx`)

## Sezioni coperte (ordine nel foglio)
1. Registrazione (solo email/password)
2. Onboarding — step Ruoli / Dati base / Foto profilo
3. Dati anagrafici
4. Contatti
5. Data e luogo di nascita
6. Residenza e domicilio (jsonb)
7. Codice fiscale / Documenti (passaporto, P.IVA)
8. Misure fisiche (`talent_attributes`)
9. Caratteristiche fisiche (capelli, occhi, etnia, segni particolari)
10. Competenze e abilità (struttura a categorie)
11. Lingue
12. Media (foto profilo, foto principali, polaroid, mani, piedi, lavori, video, documento identità)

## Fonti dati
- `src/pages/talent/TalentOnboarding.tsx`
- `src/components/profile/*` (BasicInfo, ContactInfo, Address, Documents, Measurements, PhysicalFeatures, Abilities, Skills, Languages, MediaGallery, WorkInfo, Travel)
- `src/lib/profileOptions.ts` (opzioni di select)
- `src/lib/mediaCategories.ts` (categorie media)
- `src/hooks/useUpdateProfile.ts`, `useTalentAttributes.ts` (campi persistiti)
- Schema Supabase `profiles` / `talent_attributes` (colonne, enum, jsonb)

## Tecnica di generazione
- Python + `openpyxl`
- Conteggio e layout delle colonne calcolati, autofilter attivo, freeze della riga di intestazione
- Verifica finale: rilettura del file e controllo visivo (nessun testo troncato, formattazione corretta)
- Output in `/mnt/documents/exports/mappa-form-talent.xlsx`

## Nota
La mappatura di contenuto deriva dall'analisi già svolta; in questa fase viene solo consolidata e formattata in Excel. Nessuna modifica al codice dell'app.
