## Obiettivo
Allineare la pagina `/owner/castings/:castingId/:roleId` (dettaglio ruolo con selezione talent) al Design System già usato in `OwnerCastings` e `OwnerCastingDetail`. Solo presentazione, nessun cambio di logica o schema.

## Modifiche

### 1. Header (in `src/pages/owner/OwnerCastingRoleDetail.tsx`)
Riprodurre la stessa struttura del casting detail:
- Back button: `Button variant="ghost" size="sm"` con label "Torna al casting", `-ml-2` (già presente, invariato).
- Titolo ruolo: `font-display uppercase text-3xl tracking-wide text-foreground` (attualmente `text-2xl` senza display font).
- Descrizione: `text-sm text-muted-foreground max-w-3xl whitespace-pre-wrap`.
- Metadata row: sostituire le "pill" custom (`bg-muted rounded-full px-3 py-1`) con la stessa `flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground` del casting detail, usando icone inline (`Users`, `MapPin`, `Wallet`) senza pillole colorate.
- Skills come pill neutre inline nella stessa riga.
- CTA a destra: `Button size="md" iconPosition="left"` per "Aggiungi talent", coerente col pulsante "Nuovo ruolo" del casting detail.

### 2. Nuovo componente `RoleTalentRow`
Creare `src/components/castings/RoleTalentRow.tsx` prendendo come base `CastingRow.tsx`:
- Struttura `div role="button"` con `grid grid-cols-[80px_1fr_160px_160px_140px] items-center gap-4 px-4 py-4 border-b border-border/40 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group`. Altezza riga leggermente maggiore per accogliere la foto portrait (~112px).
- **Colonna 1 — Foto portrait**: `div` `w-20 aspect-[2/3] rounded-xl overflow-hidden bg-muted` con `<img className="w-full h-full object-cover" />` per la foto profilo. Fallback: iniziali centrate su `bg-muted text-muted-foreground text-sm font-medium`. Sostituisce l'`Avatar` circolare.
- **Colonna 2 — Anagrafica**: nome (`font-medium`) + subtitle (`text-sm text-muted-foreground`: età · città · data d'aggiunta).
- **Colonna 3/4 — Status pill** "Con il talent" / "Con l'azienda": mantenere i `Select` esistenti, spostare i componenti helper (`TalentStatusSelect`, `CompanyStatusSelect`) dentro il nuovo file per riuso.
- **Colonna 5 — Azioni** allineate a destra, revealed on hover come `CastingRow`:
  - Send/Resend invito → `Button variant="ghost" size="icon-md"` (rimuovere lo sfondo primary attuale — non è pattern DS per icon actions in riga).
  - Messaggio → `variant="ghost" size="icon-md"`.
  - Rimuovi → `variant="ghost" size="icon-md"` con classe destructive.
  - `ChevronRight` sempre visibile a fine riga.
- Click sulla riga (fuori dai controlli): apre il profilo talent (`/owner/talents/:profileId`). Celle status/actions usano `e.stopPropagation()`.

### 3. Wrapping list
In `OwnerCastingRoleDetail.tsx`, sostituire `<Card><CardContent><table>` con:
```
<div className="dc-card overflow-hidden p-6">
  <div className="grid grid-cols-[80px_1fr_160px_160px_140px] gap-4 px-4 pb-3 text-xs uppercase tracking-wider text-muted-foreground">
    <span></span><span>Talent</span><span>Con il talent</span><span>Con l'azienda</span><span className="text-right">Azioni</span>
  </div>
  {talents.map(rt => <RoleTalentRow ... />)}
</div>
```
Stesso padding `p-6` del box casting in `OwnerCastings.tsx`, stessa gestione bordi (nessun divider sopra all'header colonne, nessun bordo inferiore sull'ultima riga).

### 4. Empty state
Sostituire il blocco `text-center py-12` con un `dc-card p-10 text-center text-muted-foreground` + `Button variant="secondary" size="md"` — stesso pattern dello stato vuoto dei ruoli in `OwnerCastingDetail`.

### 5. Pulizia
Rimuovere da `OwnerCastingRoleDetail.tsx`: import `Card`, `CardContent`, `Separator`, `Avatar`, `getInitialColor`, palette hardcoded. Rimuovere il fallback `bg-primary` custom sui bottoni invito.

## Note
- Nessun cambio a hook, RPC, tipi o RLS.
- Le opzioni/colori dei due status pill restano quelle definite in `TALENT_STATUS_OPTIONS` / `COMPANY_STATUS_OPTIONS`.
- Nessuna modifica al `AddTalentToRoleDialog`.