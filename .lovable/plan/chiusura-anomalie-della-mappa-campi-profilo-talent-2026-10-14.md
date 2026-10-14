# Chiusura anomalie della mappa campi profilo talent

Nessuna modifica alla struttura del database: le colonne non più usate restano dove sono, segnate come dismesse.

## 1. Piercing — rimosso
Tolto da scheda dettaglio, schede condivise/PDF e criteri dei target. La colonna resta ma non viene più letta né mostrata.

## 2. Passaporto e scadenza — aggiunto
In "Documenti e fiscalità", quando "Ho il passaporto" è attivo compare "Scadenza passaporto" accanto al Paese. Se il passaporto viene tolto si azzerano Paese e scadenza. Avviso non bloccante se la data è già passata.

## 3. Disponibilità a viaggiare — rimossa
Tolta da scheda pubblica e schede condivise/PDF; nessun campo nel form.

## 4. Visti — rimossi
Tolti da scheda pubblica e schede condivise/PDF; nessun campo nel form.

## 5–6. Tipologia attività P.IVA e Occupazione — restano testo libero
Si eliminano le liste di opzioni mai collegate, così non sembrano più in uso.

## 7. Etnia — lettura uniformata
Resta salvata dove è oggi. Un unico punto di lettura usato da scheda dettaglio, schede condivise/PDF e filtri.

## 8. Mappa aggiornata
Nuova versione `mappa-form-talent_v2.xlsx` con queste anomalie chiuse e la scadenza passaporto nella sezione documenti.

## Note tecniche
- Form: `DocumentsCard.tsx` (scadenza passaporto, campo `passport_expiry`).
- Rimozione letture: `talentDetailData.ts`, `fetchRoundTalents.ts`, `TalentPublicProfile.tsx`, `TargetCriteriaForm.tsx` / matching target.
- Liste da eliminare in `profileOptions.ts`: `VAT_ACTIVITY_TYPES`, `OCCUPATIONS`, `CONTINENTS` (dopo aver verificato che restino usate solo dal form legacy non raggiungibile, da cui si tolgono i riferimenti).
- Migrazione solo di commento: colonne `has_piercings`, `travel_availability`, `visas` marcate "DEPRECATED".
- Verifica in anteprima: imposto la scadenza, ricarico e controllo che resti; apro la preview profilo per verificare che piercing/viaggi/visti non compaiano più.
