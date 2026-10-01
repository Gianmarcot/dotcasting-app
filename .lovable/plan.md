# Unificare la modifica profilo admin e talent

## Obiettivo

Sostituire l’attuale pagina admin a due colonne con la stessa esperienza a colonna unica già usata dal talent: stesse sezioni, campi, controlli, validazioni, barra di salvataggio e protezione dalle modifiche non salvate. La modalità admin lavorerà sul profilo selezionato e aggiungerà la gestione del tutore e la valutazione privata delle immagini.

## Interventi

1. **Rendere condiviso il modulo profilo**
   - Estendere il contenitore del form perché possa caricare e aggiornare sia il profilo dell’utente corrente sia un profilo indicato dall’admin.
   - Applicare lo stesso criterio agli attributi, ai media e ai salvataggi immediati degli allegati.
   - Conservare la validazione centralizzata di email, età, codice fiscale e IBAN, la barra “Salva/Annulla” e l’avviso prima di uscire con modifiche non salvate.

2. **Ricostruire la pagina admin con l’interfaccia talent**
   - Usare la stessa colonna singola, lo stesso ordine delle sezioni e le stesse card della pagina “Il mio profilo”.
   - Mostrare il nome del talent e il ritorno al Database talenti nel titolo admin.
   - Mantenere lo stato di caricamento e il caso “Profilo non trovato”.
   - Rimuovere dalla pagina admin le vecchie sezioni duplicate solo dopo aver verificato che tutti i dati siano coperti dalla versione condivisa.

3. **Anteprima admin a schermo intero**
   - Il comando “Visualizza preview” aprirà la versione a schermo intero del profilo.
   - In modalità admin l’anteprima mostrerà tutti i media, senza il filtro basato sui ruoli del talent.

4. **Gestione admin del tutore**
   - Mostrare la stessa sezione del tutore per i profili tutelati.
   - Consentire allo staff di aggiornare quei dati per il profilo selezionato, senza attribuire la modifica all’account admin.
   - Aggiungere il permesso backend strettamente limitato allo staff; il talent/tutore conserva gli accessi attuali.

5. **Rating privato delle immagini**
   - Nella gestione foto admin, permettere di selezionare ogni immagine e assegnare stelle, tag e note private usando il sistema di rating già presente.
   - Mostrare chiaramente quali immagini sono già valutate e consentire di passare alla precedente/successiva.
   - Il rating resterà personale per ciascun membro dello staff e non sarà visibile al talent.

6. **Comportamenti specifici admin**
   - Conservare la possibilità di pubblicare un profilo non ancora pubblicato, con controllo di nome, cognome e almeno un ruolo.
   - Adattare testi e avvisi alla prospettiva admin senza cambiare i contenuti e i flussi lato talent.

## Dettagli tecnici

- Il form condiviso riceverà una modalità e un identificativo profilo opzionale, scegliendo gli hook “profilo proprio” o “profilo per ID” senza duplicare le card.
- La gestione media condivisa riceverà il profilo e l’utente proprietario corretti; la modalità admin potrà vedere tutte le categorie e montare il pannello `MediaRatingPanel`.
- La scrittura dei dati del tutore userà il suo `user_id` reale; una policy dedicata consentirà l’update solo quando `is_staff(auth.uid())` è vero.
- La pagina talent continuerà a comportarsi come ora: categorie media filtrate per ruolo, nessun rating e nessun controllo admin.

## Verifica

- Aprire come admin un profilo adulto e uno tutelato, modificare campi in più sezioni, salvare e ricaricare la pagina.
- Modificare i dati del tutore e confermare che persistano sul profilo corretto.
- Aprire la galleria, riordinare/ritagliare una foto, assegnare rating, tag e note, quindi verificarne la persistenza.
- Controllare anteprima a schermo intero, profilo non pubblicato, annullamento modifiche e avviso di uscita.
- Verificare separatamente la pagina talent per escludere regressioni e controllare desktop e mobile.
