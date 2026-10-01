# Drawer laterale di preview talent

## Obiettivo
Sostituire l’attuale anteprima semplificata del Database talenti con una variante laterale della preview completa già usata nell’area talent.

## Intervento
- Estrarre dalla preview profilo esistente il contenuto condiviso, mantenendo foto, video, navigazione media, badge, dati completi e download PDF.
- Aggiungere una variante laterale per il Database talenti, conservando l’apertura da destra e la larghezza attuale del drawer.
- Disporre le due sezioni verticalmente:
  1. area foto/video alta esattamente `100vh`;
  2. area dati sottostante con altezza automatica e contenuto completo.
- Rendere scorrevole l’intero drawer, così al primo accesso si vede la parte media a tutta altezza e scorrendo si raggiungono i dati.
- Mantenere il comando di chiusura sempre accessibile e conservare le azioni amministrative del drawer: apertura del profilo completo, aggiunta a un casting ed eventuale azione contestuale.
- Riutilizzare la stessa logica e presentazione della preview talent, evitando due implementazioni divergenti.

## Verifica
- Aprire il drawer da tutte e tre le viste del Database talenti.
- Verificare foto, video, frecce, badge, sezioni dati, PDF e azioni finali.
- Controllare desktop e mobile: prima sezione a piena altezza, dati senza altezza forzata, scorrimento continuo e nessuna sovrapposizione.

## Dettagli tecnici
La preview completa diventerà configurabile per layout: `fullscreen` nell’area talent e `side` nel Database talenti. I caricamenti profilo/attributi/media e la costruzione delle sezioni resteranno condivisi; il contenitore laterale gestirà solamente dimensioni, direzione del layout e azioni amministrative.
