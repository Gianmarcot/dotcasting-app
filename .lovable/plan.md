# Rinomina "Invio/Invii" → "Selezione/Selezioni"

## Obiettivo
Tutte le etichette visibili che chiamano gli invii (le "rounds" di casting) devono usare il termine "Selezione / Selezioni". Non si toccano i nomi interni (tabelle, campi, componenti) né le occorrenze di "Invio" non correlate (invio di email/messaggi, tasto Invio).

## Stringhe da modificare

**RoundWizardDialog.tsx**
- Etichetta predefinita: `1° invio - <ruolo>` → `1° selezione - <ruolo>`
- Toast "Invio creato" / "Invio aggiornato" → "Selezione creata" / "Selezione aggiornata"
- `selectionLabel="Invio"` → "Selezione"
- Campo "Etichetta invio" → "Etichetta selezione"
- Testo conferma rimozione: "verranno rimossi dall'invio" → "dalla selezione"
- Titoli "Nuovo invio" / "Modifica invio" → "Nuova selezione" / "Modifica selezione"
- Bottone "Crea invio e genera PDF" → "Crea selezione e genera PDF"

**RoleRoundRow.tsx**
- Toast "Invio condiviso" → "Selezione condivisa"
- Tooltip "Elimina invio" → "Elimina selezione"
- Alert "Eliminare l'invio?" e corpo con `L'invio "…" verrà eliminato…` → forma con "la selezione"
- Toast "Invio eliminato" → "Selezione eliminata"

**RoundFolderCard.tsx** — stessi testi di RoleRoundRow (condivisi/elimina).

**OwnerRoundDetail.tsx**
- Placeholder "Cerca un talent in questo invio" → "… in questa selezione"
- Voce menu "Comp card di questo invio" → "… di questa selezione"
- Alert "Rigenerare i PDF di questo invio?" → "… di questa selezione?"
- Titolo dialog "Invio condiviso" → "Selezione condivisa" (più eventuali testi interni allo stesso dialog)

**SharedRound.tsx** (vista condivisa lato talent)
- "questo invio è stato superato da uno più recente" → forma con "questa selezione"
- "Nessun talent in questo invio" → "… in questa selezione"

**OwnerCastingDetail.tsx** — conferma eliminazione: "tutti i ruoli/invii associati" → "tutti i ruoli/selezioni associati".

**BroadcastDialog.tsx** (invio messaggi multiplo)
- Sorgente "Talent di un invio" → "Talent di una selezione"
- Select `label="Invio"` → `label="Selezione"`
- Resta invariato il titolo "Invio a più talent" (parla dell'invio dei messaggi).

**DesignSystem.tsx** (scenari demo)
- Etichette demo "1° invio / 2° invio / 3° invio" → "1° selezione / …"
- "Aggiungi invio" → "Aggiungi selezione"

**Commenti nel codice** (coerenza, nessun impatto UI): RoleRoundsPanel, CastingBreadcrumbs, generateRound, useUpdateRound, RoleRoundRow.

## Note
- Le selezioni già create in database conservano la loro etichetta salvata (es. "1° invio"): la rinomina vale per quelle nuove e per tutte le UI. Riusare "Modifica selezione" e salvare aggiorna l'etichetta.
- I termini "invito/inviti" (invitazioni ai casting) restano invariati.

## Verifica
- Typecheck (`tsgo --noEmit`) e build senza errori.
- Controllo nell'anteprima: wizard nuova selezione, riga selezione (menu tre puntini), dettaglio selezione, e dialog messaggi multiplo.
