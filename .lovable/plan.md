# Nuova pagina dettaglio ruolo (admin)

Riscrittura della pagina del ruolo secondo il documento: niente più stati modificabili, arrivano esclusione dal ruolo e azioni in blocco. Il lavoro è diviso in passi, ognuno verificato nell'anteprima prima del successivo.

## 1. Dati
- Nuove informazioni sul talent nel ruolo: "escluso" (sì/no, predefinito no) e data di esclusione.
- Chi oggi è "Scartato" dal cliente diventa escluso; il resto non si riporta.
- I vecchi due stati (talent e azienda) non vengono più letti né scritti in nessuna pagina, ma restano salvati per un eventuale ritorno.
- Eliminati: le due liste di opzioni, i due aggiornamenti di stato, i due menu a tendina nella riga.

## 2. Struttura pagina
- Colonna contenuti + pannello dettagli ruolo a destra (384px, fondo #ece5de, linea a sinistra), con pulsante tondo bianco sulla linea per aprire/chiudere, stato ricordato.
- Sotto i 1440px il pannello parte chiuso e si sovrappone.
- Intestazione: ritorno + nome ruolo (Tenor Sans 21px maiuscolo).
- Pillole Shortlist / Selezioni / Ingaggi con conteggi; scheda attiva nell'indirizzo.

## 3. Shortlist
- Riga: casella, miniatura 2:3, nome (con etichette Minore e codice fiscale sulla stessa linea), città ed età, etichetta di stato derivata (ingaggiato verde, escluso grigio, "in N selezioni" grigio), indicatore requisiti, menu.
- Clic sulla riga: apre l'anteprima talent laterale già usata nel Database Talenti.
- Indicatore requisiti: nome del requisito mancato o conteggio in ambra, dati mancanti in grigio, "in target" altrimenti; clic apre sotto la riga il dettaglio requisito per requisito.
- Esclusi in fondo, attenuati, con etichetta conteggio; reintegrabili dal menu.

## 4. Azioni in blocco
- Con righe selezionate l'intestazione della scheda diventa: conteggio, "Nuova selezione" (principale), "Ingaggia", "Messaggio", e un menu con "Aggiungi a selezione esistente", "Escludi/Reintegra", "Rimuovi dalla shortlist" (rosso, con conferma).
- Nuova selezione: wizard invii esistente, talent già scelti, parte dal passo campi; esclusi saltati con avviso.
- Ingaggia: conferma con elenco, avviso su senza codice fiscale e minori, "Ingaggia comunque"; usa la pubblicazione esistente.
- Messaggio: 4 testi precompilati, anteprima con nome, modificabile; invio con le comunicazioni esistenti.

## 5. Selezioni
- Elenco invii in sola lettura: nome, numero talent, condivisa e quando, miniature, menu; pulsante tratteggiato "Nuova selezione"; nota sul riscontro del cliente.
- Nella pagina condivisa col cliente si disattiva la scelta dei talent: solo visione.

## 6. Ingaggi
- Elenco pubblicati: miniatura, nome, da quanto, aperto o no, "Sollecita" per chi non ha aperto; messaggio vuoto che spiega l'azione Ingaggia. Il blocco convocazione attuale viene tolto da qui (arriverà dopo).

## 7. Pannello dettagli ruolo
- Titolo, descrizione, gruppo "Requisiti obbligatori" (solo campi valorizzati), link "Modifica ruolo", "Elimina ruolo" rosso ancorato in basso.

## 8. Pagina casting
- Righe ruolo: "X su N ingaggiati", doppia spunta grigia a zero, verde sopra.

## Dettagli tecnici
- Migration: `role_talents.excluded boolean not null default false`, `excluded_at timestamptz`; backfill da `company_status = 'rejected'`; commento DEPRECATED su `talent_status`/`company_status`. Aggiornare `get_shared_round` e rimuovere/disattivare `confirm_round_selection` lato UI.
- `src/lib/roleMatch.ts` → `evaluateRequirements(profile, role)` che restituisce `{ key, label, status: 'met'|'unmet'|'missing', talentValue, requiredValue }[]`, con una lista di valutatori estendibile; `computeMatchScore` derivato da questo per il picker. Test unitari per i tre esiti e per l'etichetta della riga.
- "Ingaggiato" = `published_to_talent = true`. Riuso di `CastingSidePanel` (parametrizzato su soglia 1440 e chiave di memoria), `TalentPreviewDrawer`, `RoundWizardDialog` (nuove prop selezione iniziale + passo iniziale), `useSendCommunication`, componenti UI esistenti.
- Aggiornati `useRoundDetail`, `useRoundPreviewPhotos`, `useRoleConfirmedTalents`, `useOwnerDashboard`, `OwnerRoundDetail`, `SharedRound`/`TalentTile`, `useCompanies`, `useAICasting`, `RoleCard` per non usare più i vecchi stati.
