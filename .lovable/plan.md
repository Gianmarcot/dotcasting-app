# Rifiniture modifica e anteprima profilo

## Interventi

1. **Intestazione della modifica admin**
   - Mantenere “Database talenti” come pulsante `ghost` piccolo.
   - Correggere il padding interno per allineare freccia e testo agli altri controlli del design system.
   - Aumentare leggermente lo spazio verticale prima del titolo “Modifica profilo”, senza alterare l’intestazione lato talent.

2. **Forza del profilo chiusa per l’admin**
   - Rendere il pannello configurabile con uno stato iniziale aperto/chiuso.
   - Aprirlo normalmente per il talent e mostrarlo inizialmente chiuso nella modifica lato admin.
   - Conservare il comando di espansione e tutti i collegamenti alle sezioni mancanti.

3. **Lightbox per le immagini**
   - Rendere cliccabile l’immagine corrente nella preview profilo, sia a schermo intero sia nel drawer laterale.
   - Aprire tutte le foto disponibili nel lightbox a pieno schermo, partendo dalla foto selezionata e mantenendo navigazione con frecce e tastiera.
   - Nel drawer di gestione foto, distinguere il clic per aprire il lightbox dal trascinamento per riordinare e dai comandi di crop/eliminazione.
   - Applicare lo stesso comportamento anche al talent, senza mostrare controlli riservati all’agenzia.

4. **Rating dentro il lightbox**
   - Rimuovere il pannello rating separato sotto la griglia di gestione foto.
   - In modalità admin, aprire il lightbox con il pannello “Valutazione agenzia” affiancato all’immagine.
   - Dalla preview admin, mostrare lo stesso pannello laterale nel lightbox; lato talent il rating rimane invisibile.
   - Conservare stelle, tag, note private, conteggio valutate e navigazione precedente/successiva sincronizzata con l’immagine.

5. **Azioni del drawer talent**
   - Rendere “Modifica profilo” l’azione primaria e “Aggiungi a un casting” l’azione secondaria; lasciare invariata l’eventuale terza azione contestuale.
   - Portare la modale “Aggiungi a un casting” sopra il drawer e il suo sfondo oscurante. Attualmente la modale standard usa livello 50, mentre la preview occupa i livelli 70–90: verrà introdotta una variante di sovrapposizione esplicita senza cambiare globalmente tutte le altre modali.
   - Mantenere aperta la preview dietro alla modale casting e ripristinarne correttamente l’interazione alla chiusura.

## Dettagli tecnici

- Riutilizzare `MediaLightbox` e `MediaRatingPanel`, già predisposti per la vista agenzia con pannello laterale.
- Passare alla preview un’opzione esplicita di modalità admin, separata da `showAllMedia`, così visibilità dei media e permessi rating restano distinti.
- Nella galleria di gestione mantenere drag & drop sull’area dedicata e apertura lightbox tramite clic/tastiera accessibile sull’immagine.
- Verificare desktop e mobile: intestazione, stato iniziale del pannello, apertura/chiusura lightbox, navigazione foto, rating admin, assenza rating lato talent e modale casting visivamente sopra il drawer.
