# Casting: righe senza divisori e angoli stondati all'hover

## Obiettivo

Nella pagina **Casting** (area agenzia) l'elenco dei casting perde le linee di
separazione tra una riga e l'altra. Al passaggio del mouse la riga si riempie di
una leggera ombreggiatura con **angoli stondati di 8px**, così risulta chiaro che
è quella selezionabile.

## Cosa cambia

`src/components/castings/CastingRow.tsx` — la sola riga dell'elenco casting:

```text
prima:  px-4 h-20 border-b border-border/40 last:border-b-0 hover:bg-muted/30
dopo:   px-4 h-20 rounded-lg hover:bg-muted/30
```

- rimossi i bordi inferiori `border-b border-border/40 last:border-b-0` (nessun
  tra righe, nemmeno sotto l'ultima);
- aggiunta `rounded-lg`, che nel progetto vale esattamente 8px (il token
  `--radius` è `0.5rem` e `rounded-lg` è mappato su di esso). Applicandola in
  modo costante, senza condizioni, non c'è nessun salto visivo quando il mouse
  entra o esce dalla riga;
- il riempimento resta quello attuale (`hover:bg-muted/30`) e la transizione
  colore già presente si occupa della comparsa morbida.

L'effetto è una "pillola" che compare attorno alla riga: il box bianco della
pagina ha 24px di margine interno, quindi gli angoli stondati restano visibili
su tutti e quattro i lati.

## Cosa NON cambia

- intestazione delle colonne (Titolo / Selezione / Stato) e l'allineamento dei
  contenuti: la riga conserva gli stessi 16px di rientro interno;
- comportamento al clic (apertura del dettaglio casting), stellina preferiti,
  pila avatar "Selezione", indicatore di stato e pulsanti Modifica/Elimina;
- altre liste che usano lo stesso stile a divisori (i talent nel dettaglio
  casting e la pagina Design System) restano come sono;
- nessuna modifica a dati, filtri, ordinamento o permessi.

## Verifica

Controllo visivo in anteprima su `localhost:8080/owner/castings`, a schermo
ampio: nessuna linea tra le righe, riempimento grigio con angoli a 8px
passando il mouse su una riga, e stessa verifica sulla vista "Casting
preferiti" (che riusa lo stesso elenco).
