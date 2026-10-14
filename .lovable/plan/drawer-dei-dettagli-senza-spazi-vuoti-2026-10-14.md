# Drawer dei dettagli: senza spazi vuoti

## Obiettivo
Il pannello laterale dei dettagli deve essere un blocco unico: la linea di separazione coincide con il bordo sinistro del beige, il beige tocca il bordo superiore, inferiore e destro della finestra, il testo sta 32px a destra della linea.

## Misura attuale (verificata nel preview a 1600x900)
- linea a x=1151, beige a x=1184 → 33px di crema tra linea e drawer
- testo a x=1216 → 65px dalla linea
- beige da y=64 a y=900 → fascia vuota di 64px sopra
- beige fermo a x=1568 → 32px di crema a destra

## Modifiche

### src/components/castings/CastingSidePanel.tsx
- Larghezza del contenitore: 416px (32 di gioco + 384 di drawer) invece di 449: la striscia di 33px tra linea e drawer sparisce e la colonna dei ruoli guadagna 33px.
- Nuovo `--panel-extra` calcolato sul contenitore: `32px + max(0px, (100vw - sidebar - 1600px) / 2)`, cioè la distanza fra il bordo destro dell'area dei 1600px e il bordo destro della finestra.
- Pannello beige: `right: -panel-extra` e larghezza `384px + panel-extra`, così arriva fino al bordo destro della finestra a ogni larghezza. I contenuti stanno in un incarto `h-full max-w-[352px]`, così il testo non si allarga su schermi molto larghi.
- Linea: resta `left-8` e coincide con il bordo sinistro del beige.
- Altezza: `sticky top-0 h-dvh` (oggi `top-16` con `calc(100dvh-4rem)`), così il beige parte dal bordo superiore della finestra.
- Pulsante tondo: `left-3` quando è aperto (resta centrato sulla linea), `right-0` quando è chiuso.
- Sotto i 1280px il drawer resta una sovrimpressione che parte chiusa, angoli arrotondati a sinistra e ombra inclusi, ma con gli stessi bordi (beige fino al bordo della finestra, altezza intera).

### src/pages/owner/OwnerCastingDetail.tsx
- Radice della pagina: `md:-mt-16 md:-mb-8`, cioè il riempimento del contenitore admin viene annullato solo in questa pagina: il drawer può partire da y=0 e restare attaccato in fondo anche a fondo pagina.
- Colonna sinistra: `md:pt-16`, così "Tutti i casting" e il titolo restano esattamente dove sono oggi.
- Nessuna modifica alla card RUOLI, ai dialog, al blocco crema dei dettagli su telefono.

### AGENTS.md
- Una regola: il pannello laterale dei dettagli è a bordo finestra (linea = bordo sinistro del beige, `--panel-extra` per il lato destro, altezza 100dvh, contenuto largo al massimo 352px).

## Verifica (Playwright)
- 1600x900: x della linea == x del pannello; pannello da y=0 a y=900; bordo destro del pannello == larghezza della finestra; testo a linea+32.
- Scroll fino in fondo: il pannello resta a y=0 (niente fascia da 32px).
- 1118x941 (il tuo schermo): drawer chiuso con il suo pulsante, aperto come sovrimpressione a bordo finestra.
- 1920x1080 e 2560x1440: beige sempre fino al bordo destro, testo mai più largo di 352px.
- Telefono (<768): il blocco crema in pagina resta identico.
- Build OK in /tmp/observability/build-errors.log.

## Note tecniche
- `--owner-sidebar-w` (sidebar ridimensionabile 256-384) è ereditato dal layout e usato nel calcolo di `--panel-extra`.
- Su Windows/Linux la barra di scorrimento classica (~15px) resta fuori dal beige: il drawer finisce dove comincia la barra.
- Il testo del drawer passa da 320px a 352px di larghezza, perché recupera la striscia oggi vuota.
