# Correzione overflow link video nel PDF

## Obiettivo
Impedire al link lungo dello step video di uscire dal riquadro, mantenendo titolo e URL leggibili e allineati.

## Modifica
- Sostituire la riga flessibile con una griglia a due colonne: checkbox a larghezza fissa e contenuto `minmax(0, 1fr)`.
- Applicare il contenimento dell'overflow all'intera riga e alla colonna testuale.
- Troncare l'URL su una sola riga con puntini, senza modificare il valore completo usato nel PDF.
- Verificare il risultato nella modale con un URL lungo e controllare la compilazione.

## Ambito
Solo presentazione nello step di selezione video; nessuna modifica a dati, PDF, database o permessi.
