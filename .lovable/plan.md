## Problemi

**1. "Pagina bloccata da Chrome" sul viewer PDF**
`PDFViewer` di `@react-pdf/renderer` crea internamente un `<iframe src="about:blank">` e ci scrive dentro il blob del PDF. Dentro la preview di Lovable (che è già un iframe sandboxed) Chrome blocca questo iframe annidato → schermata "Questa pagina è stata bloccata".

**2. 404 su `/dev/card-preview` nel sito pubblicato**
La rotta è registrata correttamente in `App.tsx`, ma il sito pubblicato (`casting-sparkle-pro.lovable.app`) è ancora la build precedente all'aggiunta della rotta. Le modifiche frontend non vanno live finché non si clicca **Publish → Update**. Sulla preview live invece funziona.

## Fix

Modifico **solo** `src/dev/CardPreview.tsx` (nessun file in `src/lib/casting/` toccato):

- Sostituisco `PDFViewer` con `BlobProvider` di `@react-pdf/renderer`, che genera un `Blob` del PDF e ne ricava un `URL.createObjectURL`.
- Mostro il PDF in un `<iframe src={blobUrl}>` standard (non sandboxed extra), che Chrome non blocca dentro la preview di Lovable.
- Aggiungo accanto ai toggle un link "Apri in nuova scheda" / "Scarica" che usa lo stesso blob URL, utile come fallback se il browser dell'utente blocca comunque l'iframe interno.
- Gestisco lo stato di loading (`{ url, loading, error }` esposto da `BlobProvider`) mostrando un semplice "Generazione PDF…".

Per il 404 sul pubblicato non serve codice: basta ripubblicare. Te lo segnalo nella risposta e ti mostro il bottone Publish.

## Dettagli tecnici

```tsx
import { BlobProvider } from "@react-pdf/renderer";

<BlobProvider document={<TalentCardPDF card={card} />}>
  {({ url, loading, error }) => {
    if (loading || !url) return <div className="p-4 text-sm">Generazione PDF…</div>;
    if (error) return <div className="p-4 text-sm text-red-600">Errore: {String(error)}</div>;
    return <iframe src={url} className="w-full h-full border-0" title="PDF preview" />;
  }}
</BlobProvider>
```

Nessuna modifica a routing, mock, preset o componenti della card.
