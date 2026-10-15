# Rimuovere l'outline grigio dalle voci di menu in hover

## Cosa cambia

Quando passi il mouse su una voce di un menu a comparsa, oggi compare un doppio segno: il fondo crema della voce evidenziata e, intorno, un contorno grigio da 2px. Quel contorno è pensato per la navigazione da tastiera, ma sui menu a comparsa viene disegnato anche al passaggio del mouse, dove sembra un errore di rendering.

Dopo la modifica:

- voce sotto al mouse: solo il fondo evidenziato, nessun contorno;
- voce raggiunta con le frecce della tastiera: il contorno resta, come oggi;
- campo di ricerca interno e cornice del menu: comportamento invariato.

Vale per tutte e tre le famiglie di menu (azioni dei tre puntini, campi select, pannelli filtri e liste con ricerca), perché condividono la stessa anatomia.

## Come

Un solo intervento, nella regola di stile condivisa delle voci di menu (`src/index.css`, righe 707-711). Al momento la regola disegna il contorno su due selettori: la voce in `focus-visible` e la voce evidenziata con il focus addosso. A entrambi si aggiunge la condizione «e non ci sta passando il mouse sopra».

```css
/* prima */
.dc-menu-item:focus-visible, .dc-menu-item[data-highlighted]:focus,
.dc-menu:focus-visible, .dc-menu [cmdk-input]:focus-visible {
  outline: 2px solid var(--menu-tertiary);
  outline-offset: -2px;
}

/* dopo */
.dc-menu-item:focus-visible:not(:hover), .dc-menu-item[data-highlighted]:focus:not(:hover),
.dc-menu:focus-visible, .dc-menu [cmdk-input]:focus-visible {
  outline: 2px solid var(--menu-tertiary);
  outline-offset: -2px;
}
```

## Technical notes

- Radix sposta il focus reale sulla voce sotto al puntatore, e il motore del browser la considera a tutti gli effetti `:focus-visible` (verificato in anteprima: la voce in hover restituiva `isFocus: true`, `isFocusVisible: true`, `outline: 2px solid rgb(104,104,104)`). Per questo basta togliere il selettore `[data-highlighted]:focus` non basta: va escluso il caso `:hover`.
- La regola è condivisa da `dropdown-menu.tsx`, `select.tsx`, `context-menu.tsx`, `menubar.tsx`, `command.tsx` e dai pannelli filtri: nessun componente viene toccato.
- La regola di progetto «il contorno di messa a fuoco da tastiera resta visibile» resta rispettata: con la tastiera la voce non è mai in `:hover`, quindi il contorno si vede.
- Verifica fatta in anteprima con la regola iniettata a runtime: hover → `outline: 0px none` con fondo `#f4f0ec` invariato; freccia giù da tastiera → `outline: 2px solid` ancora presente; puntatore che esce dal menu aperto → nessuna traccia residua.
- Nessuna modifica a dati, tabelle o migrazioni.
