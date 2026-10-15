# Modifica shortlist: salvataggio con conferma

## Cosa cambia per l'utente
- Spunte, "Seleziona tutti", trascinamenti e rimozioni nella finestra non vengono salvati subito: diventano una **bozza**.
- In fondo alla finestra compare la **stessa barra di salvataggio del profilo talent** (pillola scura flottante che sale dal basso, solo se ci sono modifiche): "N modifiche non salvate", "Annulla" e "Salva".
- I talent aggiunti nella bozza mostrano un piccolo segno "Nuovo"; quelli rimossi restano visibili barrati/opachi nella colonna Shortlist finché non salvi, così puoi ripensarci con un clic.
- Chiudendo la finestra (Chiudi, Esc, clic fuori) con modifiche non salvate appare un avviso piccolo: "Hai modifiche non salvate" con "Salva", "Esci senza salvare", "Continua a modificare".
- Al salvataggio: se tra i rimossi c'è chi è già in una selezione o ha un ingaggio pubblicato, compare la conferma che c'è già oggi (una sola, con l'elenco). Poi una notifica "Shortlist aggiornata".
- "Seleziona tutti" resta, ma ora è innocuo: cambia solo la bozza.
- Le notifiche con "Annulla" a ogni spunta spariscono (non servono più).

## Fuori dalla finestra
Le azioni nella pagina Shortlist (rimuovi, escludi dal menu della riga) restano immediate come oggi.

## Dettagli tecnici
- `TalentPicker.tsx`: stato locale `draft: string[]` inizializzato da `shortlistIds` all'apertura; toggle, select-all e drop modificano solo `draft`. Diff = `added`/`removed` rispetto a `shortlistIds`.
- Nuovo callback `onSave(added, removed)` al posto delle scritture per singola spunta; `OwnerCastingRoleDetail.tsx` esegue insert/delete in batch (riusando `pickerAdd`/`pickerRemove` in blocco) e invalida le query.
- Guardia di chiusura su `FullscreenSheet` (`onOpenChange` intercettato quando `dirty`) con `AlertDialog` size sm.
- Pulsante "Salva shortlist" disabilitato durante il salvataggio; errori in toast rosso, bozza conservata.
- Aggiornare la regola in `AGENTS.md` (oggi dice "scrive ogni toggle immediatamente").
