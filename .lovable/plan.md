# Chiusura anomalie della mappa campi profilo talent

Tutti i campi vengono aggiunti al form attivo (uguale per talent e admin). Nessuna modifica alla struttura del database: le colonne esistono già.

## 1. Piercing — "Caratteristiche fisiche"
Nuova domanda Sì/No "Ho piercing" accanto a Tatuaggi, salvata su `has_piercings`. Stesso stile delle altre caratteristiche.

## 2. Passaporto e scadenza — "Documenti e fiscalità"
Quando "Ho il passaporto" è attivo, accanto al Paese compare il campo data "Scadenza passaporto" (`passport_expiry`). Se il passaporto viene tolto, si azzerano Paese e scadenza. Avviso non bloccante se la data è già passata.

## 3. Disponibilità a viaggiare — "Esperienza e mobilità"
Nuovo gruppo "Disponibilità a viaggiare" con caselle per continente (lista `CONTINENTS` già esistente), salvato su `travel_availability` nello stesso formato letto oggi da scheda pubblica e PDF, così i dati storici restano compatibili.

## 4. Visti — "Documenti e fiscalità"
Gruppo "Visti" con chip aggiungibili/rimovibili (Paese + scadenza opzionale), salvato su `visas` nel formato già letto da scheda pubblica e PDF.

## 5. P.IVA — Tipologia attività
"Tipologia attività" passa da testo libero a menu con le opzioni `VAT_ACTIVITY_TYPES`. Un valore già salvato non presente in lista resta visibile come voce aggiuntiva, così nessun dato si perde.

## 6. Occupazione principale
Da testo libero a menu con le opzioni `OCCUPATIONS`, con la stessa salvaguardia per i valori già salvati.

## 7. Etnia
Resta salvata dove è oggi (spostarla richiederebbe una migrazione rischiosa). Si uniforma la lettura: un unico punto di accesso usato da scheda dettaglio, schede condivise/PDF e filtri, così non dipende più da quale tabella si interroga. La mappa la segnerà come "storage su profilo, documentato".

## 8. Aggiornamento mappa
Rigenerazione del file Excel come nuova versione (`mappa-form-talent_v2.xlsx`) con le anomalie chiuse rimosse dal foglio "Anomalie".

## Note tecniche
- File: `PhysicalCard.tsx`, `DocumentsCard.tsx`, `WorkTravelCard.tsx` (v2), eventuale helper etnia in `talentDetailData.ts` / `fetchRoundTalents.ts`.
- Formato di `travel_availability` e `visas` ricavato dai lettori esistenti (`TalentPublicProfile`, `travelToText`) prima di scrivere.
- Salvataggio tramite il contesto condiviso `useProfileForm` (auto-save), nessuna nuova query.
- `has_minor_children` non incluso perché non richiesto.
- Verifica in anteprima: compilo i nuovi campi, ricarico e controllo che i valori restino.
