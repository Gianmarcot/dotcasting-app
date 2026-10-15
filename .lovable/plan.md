# Rimuovere il contorno residuo nei menu

## Problema
- All'apertura il menu riceve il focus sul contenitore: il browser lo considera "focus da tastiera" e disegna il contorno grigio attorno a tutto il menu.
- Nella ricerca dentro al menu il campo "Cerca…" riceve il focus in automatico e mostra lo stesso contorno.

## Soluzione
- Il contenitore del menu non mostra più alcun contorno quando è aperto.
- Il campo di ricerca dentro al menu non mostra il contorno: è già evidente perché c'è il cursore che lampeggia.
- Con la tastiera resta visibile la voce attiva (fondo crema + contorno), come oggi.

## Dettagli tecnici
In `src/index.css` (righe 707-711) togliere `.dc-menu:focus-visible` e `.dc-menu [cmdk-input]:focus-visible` dalla regola del contorno e aggiungere `.dc-menu:focus, .dc-menu:focus-visible, .dc-menu [cmdk-input]:focus, .dc-menu [cmdk-input]:focus-visible { outline: none; box-shadow: none; }`. Verifica in anteprima nel Design System: apertura di menu azioni, select e SearchSelect, senza contorno; frecce da tastiera ancora con contorno sulla voce.
