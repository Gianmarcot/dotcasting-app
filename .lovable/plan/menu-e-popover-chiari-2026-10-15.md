# Menu e popover chiari

Dropdown, popover, menu contestuali e menu a tendina tornano chiari, ispirati all'esempio ma nello stile della piattaforma. Le **tooltip restano scure**, come i toast.

## Cosa cambia per te
- **Fondo bianco**, angoli molto arrotondati (come le card `.dc-card`), una sottile linea di bordo e un'ombra morbida e diffusa che stacca il menu dal fondo crema.
- **Voci più ariose**: più spazio in alto e in basso, icone allineate a sinistra nel colore del testo.
- **Al passaggio del mouse** o con la tastiera, la voce prende un leggero fondo crema arrotondato (non grigio come nell'esempio).
- **Separatori** a tutta larghezza in tono `border`; i titoli dei gruppi in grigio scuro, in DM Sans.
- **Azioni distruttive** (Elimina, Rimuovi dalla shortlist) in rosso bordeaux, con fondo rosato al passaggio.
- Restano invariati la posizione, le animazioni e il funzionamento.

## Dove si applica
Menu "…" delle righe (casting, ruoli, shortlist), menu dei breadcrumbs, notifiche, filtri dei talent, menu a tendina dei campi, ricerca a comando, menu del Design System.

## Dettagli tecnici
- In `src/components/ui/` (popover, hover-card, dropdown-menu, context-menu, menubar, command, navigation-menu) sostituire `bg-[#0f0f0f] text-white` con `bg-popover text-popover-foreground border border-border shadow-[var(--shadow-menu)] rounded-3xl p-1.5`; voci `rounded-2xl px-3 py-2.5 focus:bg-secondary`; separatori `bg-border`; Label/Shortcut `text-muted-foreground`.
- In `src/index.css`: `.dc-select-content`/`.dc-select-item` con gli stessi token, e un nuovo token `--shadow-menu` (ombra morbida e diffusa). Verifico che `--popover` sia bianco.
- Ripulire nelle pagine le classi chiare pensate per il fondo scuro (`text-white`, `bg-white/10`, ad esempio in `NotificationBell.tsx`, `TalentFilterBar.tsx`, `CastingBreadcrumbs` e nei menu delle righe), cercandole con `rg`.
- In `AGENTS.md` aggiornare la regola sulle superfici flottanti: menu e popover chiari, tooltip e toast scuri. Aggiornare anche la memoria "Dark floating surfaces".
- Verifica in anteprima: menu riga casting, Select, popover notifiche.
