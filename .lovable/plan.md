# Aggiornamento preview profilo talent

## Drawer laterale
- Portare la larghezza desktop a circa 760 px, mantenendo il pannello a tutta larghezza sugli schermi piccoli e senza angoli arrotondati.
- Ridurre la larghezza massima di foto e video, lasciando spazio laterale sufficiente perché le frecce restino completamente fuori dal media.
- Sostituire i pallini delle foto con miniature selezionabili, usando lo stesso linguaggio visivo delle miniature video.
- Inserire foto e video in strisce orizzontali scorrevoli quando il numero di elementi supera lo spazio disponibile.
- Conservare la prima sezione a `100dvh` e i dati sottostanti ad altezza automatica.

## Etichette condivise
- Usare in entrambe le varianti della preview, laterale e a tutta pagina, gli stessi componenti `MinorPill` e `FiscalPill` già presenti nelle viste del Database talenti.
- Mantenere la stessa logica: nessuna etichetta CF quando il codice è valido e nessuna etichetta minore per un adulto.

## Azioni fisse
- Spostare le azioni del drawer in una barra sempre visibile in basso, separata dal contenuto scorrevole.
- Rinominare “Apri profilo completo” in “Modifica profilo” e collegarla alla pagina admin di modifica.
- Conservare “Aggiungi a un casting” e l’eventuale azione contestuale usata negli altri punti dell’area admin.
- Aggiungere spazio finale ai dati affinché la barra fissa non copra gli ultimi contenuti.

## Pagina admin di sola visualizzazione
- Rimuovere la destinazione `/owner/talents/:profileId/view` come pagina autonoma e reindirizzarla alla corrispondente pagina di modifica, così eventuali vecchi link continuano a funzionare.
- Aggiornare i collegamenti interni ancora diretti alla vecchia vista affinché aprano direttamente la modifica profilo.

## Verifica
- Provare il drawer dal Database talenti e dagli altri punti admin che lo riutilizzano.
- Verificare miniature foto/video, scorrimento orizzontale, frecce esterne al media e barra azioni sempre visibile.
- Verificare la preview a tutta pagina per le nuove etichette CF/minore.
- Controllare desktop e mobile, inclusi redirect dei vecchi URL e assenza di contenuti coperti.

## Dettagli tecnici
La galleria e i dati resteranno condivisi nel componente della preview. Solo la variante laterale userà larghezza fissa, miniature fotografiche e barra azioni ancorata; il percorso storico di sola lettura sarà mantenuto come redirect compatibile verso `/owner/talents/:profileId/edit`.
