# Immagini nella vista card dei talent

## Obiettivo
- Usare come immagine principale della card la prima foto disponibile del talent, dando priorità alla foto profilo.
- Se esiste una seconda foto distinta, mostrarla al passaggio del mouse senza cambiare dimensioni o contenuti della card.

## Implementazione
- Comporre l’elenco immagini della card partendo dalla foto profilo e proseguendo con le foto principali già ordinate, evitando duplicati.
- Sovrapporre la seconda immagine alla prima con una transizione discreta attiva solo al passaggio del mouse; su dispositivi touch resterà visibile la prima immagine.
- Conservare iniziali, label Minore/CF, metadati e apertura del drawer esistenti.

## Verifica
- Controllare una card con almeno due immagini e una con una sola immagine.
- Verificare la vista su desktop e mobile e confermare che la pagina compili senza errori.
