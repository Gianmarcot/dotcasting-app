# Dettaglio casting: stile righe, pulsanti e drawer

Quattro ritocchi alla pagina `/owner/castings/:id`, senza cambiare logica o dati.

## 1. Pulsante "Tutti i casting"

Come il pulsante "Torna al casting" del dettaglio ruolo (`OwnerCastingRoleDetail.tsx`):
sostituire l'attuale `dc-link-action` con:

```tsx
<Button variant="ghost" size="sm" onClick={...} className="-ml-2">
  <ArrowLeft className="h-4 w-4 mr-1" />
  Tutti i casting
</Button>
```

## 2. Hover delle righe dei ruoli

`RoleCard.tsx`: aggiungere alle righe lo stesso effetto della lista casting
(`CastingRow`: `hover:bg-muted/30 transition-colors`), con `-mx-4 px-4` in modo che
la banda evidenziata arrivi dove arrivano quelle della lista casting dentro la card.

## 3. Drawer dettagli (`CastingSidePanel.tsx`)

- Rimuovere `rounded-l-3xl` dal pannello quando va in overlay (sotto 1280px).
- Sostituire la linea di separazione disegnata a parte con un vero `border-l border-border`
  sul pannello stesso (il bordo color `border` sta sul margine sinistro del drawer, in
  docked e in overlay). La transizione di scomparsa resta collegata al pannello.

## 4. Pulsante "Modifica" nell'header quando il drawer è chiuso

- Spostare lo stato `open` del drawer in `OwnerCastingDetail` (hook esportato da
  `CastingSidePanel.tsx`, es. `useCastingDetailsPanel`, che espone `open`, `wide`, `toggle`);
  il pannello diventa controllato e riceve `open`/`onToggle`. Nessun cambiamento di
  persistenza: la chiave localStorage resta la stessa.
- Nella riga del titolo dell'header (a destra) comparirà, su `md:` in su e solo quando il
  drawer è chiuso, un pulsante secondario "Modifica" (`Button variant="secondary"`) che
  apre lo stesso `CastingFormDialog` già usato dal pannello. Su telefono non compare:
  i dettagli in pagina hanno già la loro voce Modifica.

## Verifica

- Build pulita e check in preview via Playwright: hover delle righe, pulsanti header,
  drawer in overlay senza raggi e con bordo sinistro, pulsante Modifica visibile a drawer
  chiuso e assente a drawer aperto.
- Aggiornare la regola del drawer in `AGENTS.md` (bordo sinistro al posto della linea).
