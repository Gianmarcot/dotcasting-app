## Obiettivo

Eliminare la duplicazione sulla pagina `/owner/castings/:castingId`: oggi ogni ruolo compare due volte (lista "Ruoli" in alto + compartimento "Invii per ruolo" sotto). Diventa **un unico blocco per ruolo** che fonde header del ruolo e i suoi invii.

## Cosa cambia in UI

Sezione unica "Ruoli e invii" sotto l'header del casting (header invariato).

Per ogni ruolo, un compartimento `.dc-card`:

- **Header del ruolo** (ex `CastingRoleCard` compresso, senza Card wrapper):
  - Nome ruolo + badge "Confermati N/M"
  - Riga specs: genere · età · budget · location
  - A destra: contatori (totale talent, confermati), menu kebab (Modifica ruolo, Apri dettaglio ruolo, Elimina), pulsante primario "Nuovo invio"
  - Tutto l'header è cliccabile → apre `/owner/castings/:castingId/:roleId` (tranne menu e bottone)
- **Griglia invii** sotto, separata da un divider sottile:
  - `grid-cols-1 md:grid-cols-2` di `RoundFolderCard` esistenti + tile "Aggiungi invio"
  - Se nessun invio: solo il tile "Aggiungi invio" centrato

Stato vuoto pagina (zero ruoli): card unica con CTA "Crea il primo ruolo".

## File coinvolti

**Modifica**
- `src/pages/owner/OwnerCastingDetail.tsx`
  - Rimuovere la sezione "Ruoli (N)" e il blocco `RoundsByRoleBlock`
  - Sostituire con una singola sezione che mappa `roles` → nuovo `RoleBlock`
  - Mantenere fetch e logica esistenti (`useCastingRoles`, `useRoundsByRole`, `confirmedByRole`, dialog modifica/aggiunta ruolo, edit casting)
- `src/components/castings/rounds/RoleRoundsCompartment.tsx`
  - Estende il suo header per includere specs, contatori, menu kebab del ruolo
  - Riceve `role` completo + handler `onEditRole`, `onOpenRole`, `onDeleteRole`
  - Internamente continua a usare `RoundFolderCard` e `CreateRoundDialog`
  - Rinominare concettualmente in "blocco ruolo" (file rimane per minimizzare diff)

**Da deprecare (non eliminare nel diff)**
- `src/components/castings/CastingRoleCard.tsx`: non più usato dalla detail page. Se non è usato altrove, lo rimuoviamo; altrimenti lo lasciamo.

**Non toccare**
- Header casting (titolo, badge, meta, pulsanti Modifica/Nuovo ruolo)
- Hook `useCastingRoles`, `useCastingRounds`, `useRoundsByRole`, `useRoleTalents`
- `RoundFolderCard`, `CreateRoundDialog`, `OwnerRoundDetail`, `OwnerCastingRoleDetail`
- Schema DB

## Dettagli tecnici

```text
OwnerCastingDetail
├── Header casting (invariato)
└── Sezione "Ruoli e invii"
    └── RoleBlock × N  (= RoleRoundsCompartment esteso)
        ├── Header ruolo: nome • badge confermati • specs • kebab • [Nuovo invio]
        ├── Divider
        └── Grid invii: RoundFolderCard… + AddRoundTile
```

- Click sull'header (escluso menu e bottone): `navigate(/owner/castings/:castingId/:roleId)` via `stopPropagation` sui controlli.
- "Elimina ruolo" riusa `useDeleteCastingRole` con conferma toast (stesso comportamento di `CastingRoleCard`).
- Responsive: header del ruolo passa da row a column su `< md`; griglia invii già 1 colonna su mobile.
- Stile: card esterna `.dc-card` (`bg-white border-0 shadow-sm rounded-3xl`) — sostituisce l'attuale `rounded-2xl border bg-white` per allinearsi al design system.

## Risultato

Una sola passata visiva: per ogni ruolo l'utente vede contesto del ruolo e i suoi invii nello stesso blocco. Niente più scroll tra liste parallele.