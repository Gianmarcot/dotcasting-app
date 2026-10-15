# Vista compressa della sidebar owner

Obiettivo: la sidebar admin può ridursi a una colonna compatta di sole icone (~72px), lasciando più spazio al contenuto. La scelta viene ricordata tra le sessioni.

## 1. Come si attiva e si disattiva (entrambi i modi)

- **Pulsante dedicato**: piccola freccia nell'header della sidebar, accanto al logo (verso sinistra = comprimi). In forma compressa l'header mostra solo la freccia (verso destra = espandi), centrata.
- **Trascinamento**: trascinando il bordo oltre metà strada verso la forma compatta, la sidebar scatta da sola in forma compressa; trascinandolo di nuovo verso destra oltre la stessa soglia, si riespande alla larghezza precedente.
- Doppio click sul bordo: torna alla larghezza standard espansa (256px), come oggi.
- Larghezza espansa corrente (256–384px, trascinabile) resta invariata e viene ricordata separatamente: espandendo si ritrova la propria larghezza.

## 2. Aspetto della vista compressa

- **Header**: logo nascosto, resta solo il pulsante freccia.
- **Voci di menu**: solo icona centrata, stesso stile attivo/inattivo di oggi; il nome della voce compare in un tooltip al passaggio del mouse.
- **Preferiti**: sezione nascosta del tutto; riappare espandendo.
- **Footer**: solo avatar (centrato), campanella delle notifiche con il contatore dei non letti sovrapposto all'icona, ingranaggio impostazioni e icona di uscita — tutti con tooltip.
- Transizione morbida della larghezza (~300ms) tra le due forme.
- Il contenuto delle pagine e il drawer dettagli dei casting si adattano da soli, perché seguono già la larghezza della sidebar.
- Su telefono e tablet piccoli non cambia nulla: la sidebar resta nascosta come oggi.

## Dettagli tecnici

- `src/hooks/useOwnerSidebarWidth.ts`: nuovo stato `collapsed` (persistito in `dc.owner-sidebar.collapsed`), costante `OWNER_SIDEBAR_COLLAPSED = 72`; `width` restituito è quello effettivo (72 se compressa), con `setCollapsed`/`toggleCollapsed`; la larghezza espansa resta memorizzata a parte. Snap nel drag: soglia a metà tra 72 e 256.
- `src/components/layout/OwnerSidebar.tsx`: rendering condizionale sull stato `collapsed` — etichette sostituite da tooltip (componente `Tooltip` shadcn), logo e sezione preferiti nascosti, badge notifiche riposizionato sull'icona; pulsante freccia (PanelLeftClose/PanelLeftOpen di lucide) nell'header; snap al drag nella `handlePointerMove` esistente; `transition-[width]` sull'aside.
- `src/components/layout/OwnerLayout.tsx`: nessuna modifica di logica — legge già `width` dall'hook, che ora riflette lo stato compresso (anche `--owner-sidebar-w` usato da `CastingSidePanel` si aggiorna di conseguenza).
- `src/index.css`: nessuna nuova classe prevista; il centratura delle icone si ottiene con utility nel componente.
- `AGENTS.md`: nuova regola nella sezione Layout sullo stato compresso della sidebar (stato separato dalla larghezza, icone con tooltip).
- Verifica in anteprima con Playwright: compressione via pulsante e via drag, tooltip, badge notifiche, persistenza dopo ricarica, adattamento del drawer casting.
