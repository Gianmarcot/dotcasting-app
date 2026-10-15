## Azioni complete nel menu tre puntini della riga shortlist

Il menu di ogni riga mostrerà le stesse azioni della barra in blocco, applicate solo a quel talent:

```text
Nuova selezione
Ingaggia
Messaggio
─────────────
Aggiungi a una selezione esistente  >  (elenco selezioni con numero talent)
─────────────
Escludi dal ruolo / Reintegra nel ruolo
Rimuovi dalla shortlist   (rosso)
```

"Aggiungi a una selezione esistente" è un sottomenu (un solo livello, consentito nella famiglia azioni); se non ci sono selezioni mostra "Nessuna selezione" disattivato.

## Dettagli tecnici

- `OwnerCastingRoleDetail.tsx`: rendere le azioni parametriche sugli id. `startNewRound(ids?)`, `addToRound(roundId, ids?)`; per Ingaggia/Messaggio aggiungere uno stato `targetIds` (null = usa `selected`) così `EngageDialog`/`BulkMessageDialog` ricevono le righe del singolo talent; reset alla chiusura.
- `RoleShortlistRow.tsx`: nuove prop `onNewRound`, `onEngage`, `onMessage`, `rounds: {id,label,size}[]`, `onAddToRound(roundId)`; sottomenu con `DropdownMenuSub` dentro `MenuSubLevel`. Ordine e stile come sopra, voce distruttiva `text-destructive`.
- Verifica in anteprima che il menu si apra e i dialoghi mostrino solo il talent della riga (senza confermare azioni reali).
