# Rifiniture navbar mobile, Safari e barra di salvataggio

## Cosa cambia

### 1. Menu mobile e stato focus

- Avatar e icona hamburger apriranno lo stesso menu, senza più portare l’avatar alla pagina Comunicazioni.
- Il menu sarà gestito con uno stato condiviso, così entrambi i controlli hanno lo stesso comportamento.
- Alla chiusura del menu verrà rimosso il focus visivo dal controllo che lo ha aperto; l’icona hamburger non resterà quindi evidenziata dopo l’uscita.
- Il pallino delle comunicazioni non lette sull’avatar resterà visibile e invariato.

### 2. Colore della pagina in Safari

- Verrà dichiarato il colore tema del browser uguale allo sfondo beige dell’app (`#f4f0ec`), così le aree di Safari attorno alla pagina risultano coerenti con il contenuto.
- Il colore verrà impostato nei metadati della pagina; i colori interni dell’interfaccia non cambiano.

### 3. Barra di salvataggio su mobile

Solo sotto i 768px:

- la barra passerà dal fondo alla parte alta della pagina, a 8px sotto la navbar flottante;
- avrà altezza automatica e padding interno di 8px;
- conterrà esclusivamente i pulsanti **Annulla** e **Salva**, senza icona e senza conteggio delle modifiche;
- manterrà comparsa/scomparsa animata, fondo scuro e larghezza allineata alla navbar mobile;
- i due pulsanti resteranno accessibili e utilizzabili anche durante lo scorrimento.

Su desktop la barra resterà nella posizione e nella forma attuali, compresi icona, conteggio e altezza.

## Dettagli tecnici

- `src/components/layout/TalentMobileNavbar.tsx`
  - drawer controllato tramite `open` / `onOpenChange`;
  - avatar e hamburger come due aperture dello stesso drawer;
  - rimozione del focus alla chiusura, senza interferire con la navigazione da tastiera;
  - avatar trasformato da link in controllo accessibile con etichetta “Apri menu”.
- `index.html`
  - aggiunta di `<meta name="theme-color" content="#f4f0ec">`.
- `src/components/profile/v2/ProfileSaveBar.tsx`
  - varianti mobile/desktop tramite classi responsive;
  - mobile posizionata a `top: 80px`, altezza automatica e `padding: 8px`;
  - testo informativo nascosto solo su mobile;
  - comportamento `save`, `reset`, stato di caricamento e protezione dalle modifiche non salvate invariati.

## Verifica

- Su iPhone/Safari simulato: colore browser coerente con lo sfondo beige.
- A 393px: avatar e hamburger aprono lo stesso menu; chiudendolo, l’hamburger non resta focused.
- Barra con modifiche presenti: 8px sotto la navbar, nessuna sovrapposizione, soli pulsanti Annulla/Salva.
- Su desktop: navbar e barra di salvataggio visivamente invariate.
