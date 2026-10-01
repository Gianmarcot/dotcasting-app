# Drawer laterale: larghezza 900px e miniature libere dai pulsanti

## Obiettivo

Il pannello laterale di anteprima talento nel Database talenti diventa più ampio (900px) e le miniature delle foto non finiscono più sotto la barra fissa dei pulsanti in basso.

Diagnosi verificata in anteprima (viewport 1440x900, drawer aperto su un talento con 10 foto): la barra fissa "Modifica profilo / Aggiungi a un casting" è alta 89px e inizia a 811px dall'alto; le miniature arrivano a 852px, quindi 41px sono coperti. Il pannello misura oggi 760px.

## Modifiche

### 1. Larghezza del pannello: 760px -> 900px

- Nel modulo di dettaglio (`src/components/talents/detail/TalentDetailModal.tsx`) la larghezza del pannello laterale passa a 900px, restando a tutta larghezza sugli schermi piccoli e mai più larga della finestra.
- La barra fissa in basso usa la stessa larghezza.
- La nota di progetto in `AGENTS.md` che descrive il drawer viene aggiornata al nuovo valore.

### 2. La barra dei pulsanti passa dentro il modulo di dettaglio

Oggi la barra fissa è scritta a mano nel drawer di preview (`src/components/talents/TalentPreviewDrawer.tsx`) e duplica la larghezza del pannello. Viene spostata nel modulo di dettaglio, che così possiede l'unica definizione di larghezza e di aspetto della barra (fondo bianco, bordo superiore, pulsanti in riga da grandi e in colonna sugli schermi piccoli).

Il drawer di preview continua a passare i propri pulsanti ("Modifica profilo", "Aggiungi a un casting", più l'azione extra di chi lo apre) come contenuto della barra, senza dover conoscere né la larghezza né il posizionamento.

### 3. Spazio sopra e sotto l'area foto

- L'altezza reale della barra viene misurata a runtime e messa in una variabile CSS del pannello: se i pulsanti andassero su più righe, lo spazio riservato cresce da solo.
- L'area media (foto/video + miniature) riceve:
  - padding superiore più generoso (circa 64px) così il selettore Foto/Video e la foto respirano e restano sotto la barra di chiusura in alto a destra;
  - padding inferiore calcolato sulla barra (circa 113px negli schermi grandi, circa 233px su mobile dove i pulsanti sono in colonna), così la striscia delle miniature resta sempre visibile e cliccabile.
- La parte dati in basso riceve un margine finale anch'esso legato all'altezza della barra, così l'ultimo campo non resta nascosto quando si scorre fino in fondo.

Il comportamento della versione a tutta pagina (preview del proprio profilo) non cambia: nessuna delle nuove regole si applica lì.

## Dettagli tecnici

- La larghezza unica è una classe Tailwind (`sm:w-[900px]`) applicata al pannello e alla barra; `sm:max-w-full` evita che ecceda la finestra.
- La misurazione usa un `ResizeObserver` sulla barra; il valore finisce in `--dc-bar-h` sull'elemento del dialogo e i padding usano `calc(var(--dc-bar-h) + <spazio>)`.
- I padding verticali dell'area media sostituiscono gli attuali 40px simmetrici; le frecce ai lati restano fuori dalla foto perché il contenitore del media mantiene il proprio spazio laterale.
- Nessun cambiamento a dati, permessi o percorrenze: solo impaginazione.

## Verifica

Controllo automatico in anteprima sul Database talenti:

- pannello largo 900px su desktop, a tutta larghezza su mobile (393px), senza scorrimento orizzontale;
- miniature foto e video completamente sopra la barra pulsanti (almeno 16px di respiro), con la striscia ancora scorrevole quando le foto sono tante;
- frecce foto fuori dall'immagine, selettore Foto/Video sotto la barra di chiusura;
- scorrimento fino in fondo della parte dati: ultimo campo leggibile sopra la barra;
- drawer aperto anche dalle altre aree che lo usano (code dei casting, scheda azienda, queue);
- compilazione pulita e nessuna schermata di errore.
