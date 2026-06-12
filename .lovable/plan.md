# Fix anteprima PDF bloccata da Chrome

## Problema

Nella preview di Lovable la pagina `/dev/card-preview` gira già dentro un iframe sandboxed. Caricare un PDF (`blob:`) dentro un secondo `<iframe>` fa scattare il blocco "Questa pagina è stata bloccata da Chrome", perché il visualizzatore PDF nativo di Chrome non può essere istanziato in iframe annidati con sandbox.

Vale sia per `BlobProvider` + `<iframe src={url}>`, sia per `PDFViewer` di `@react-pdf/renderer` (che internamente è un iframe). Cambiare attributi sandbox non lo sblocca: è una restrizione del plugin PDF.

## Soluzione

Smettere di delegare il rendering del PDF al browser e renderizzare le pagine in `<canvas>` con `pdfjs-dist`. Il PDF viene generato come prima da `@react-pdf/renderer` (`pdf().toBlob()`), poi `pdfjs-dist` lo apre e disegna ogni pagina su canvas. In più, niente iframe = nessun blocco.

## Modifiche

Solo `src/dev/CardPreview.tsx` (più `pdfjs-dist` come dipendenza). Nessun file in `src/lib/casting/` toccato.

### 1. Dipendenza
- `bun add pdfjs-dist`

### 2. `src/dev/CardPreview.tsx`
- Rimuovere `BlobProvider` + `<iframe>`.
- Usare `pdf(<TalentCardPDF card={card} />).toBlob()` (API imperativa di `@react-pdf/renderer`) dentro un `useEffect` che dipende da `card` e da un `reloadKey`.
- Configurare il worker di pdfjs:
  ```ts
  import * as pdfjsLib from "pdfjs-dist";
  import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  ```
- `getDocument({ data: arrayBuffer })`, iterare `numPages`, per ognuna `getViewport({ scale: 1.5 })` e `page.render({ canvasContext, viewport })` su un `<canvas>` creato in un array di ref.
- Mostrare le pagine in colonna scrollabile con sfondo grigio (look "viewer"), centrate, con ombra.
- Mantenere la barra di controlli esistente: toggle preset Essenziale/Completo, toggle PDF/Web.
- Mantenere link "Apri in nuova scheda" e "Scarica" usando l'URL blob (apertura in nuova scheda funziona, non è un iframe annidato).
- Aggiungere stato `loading` / `error` con messaggi testuali.
- HMR: incrementare `reloadKey` su `import.meta.hot.accept` per i moduli `TalentCardPDF`, `roundPreset`, `talentFields`, `mockTalent` così le edit a `TalentCardPDF.tsx` rigenerano automaticamente il PDF e ridisegnano i canvas.
- Pulsante "Ricarica" manuale che incrementa `reloadKey`.

### 3. Modalità Web
Invariata: continua a renderizzare `<TalentCardWeb card={card} />`.

## Note tecniche

- `pdfjs-dist` v4 espone il worker come `pdf.worker.min.mjs`; Vite lo serve con `?url`.
- Nessuna modifica a route, navigazione o ad altri file.
- Nessun cambio in `src/lib/casting/`.

## Verifica

Dopo l'implementazione, aprire `/dev/card-preview` nella preview: si devono vedere le pagine del PDF renderizzate come canvas, senza il messaggio di Chrome. Modificando `TalentCardPDF.tsx` e salvando, le pagine devono aggiornarsi via HMR (o cliccando "Ricarica").
