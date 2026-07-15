## Diagnosi

Le modifiche a `TalentCardPDF.tsx` (righe 45-68) sono già in file, ma "Ricarica PDF" nel dev tool ricrea solo il PDF a partire dallo stesso modulo caricato in memoria. Se Vite HMR non ha ancora invalidato il dynamic import di `TalentCardPDF`, il render usa la versione vecchia e vedi il layout di prima.

## Azione

Nessuna modifica al codice — il fix è già applicato. Devi solo forzare Vite a ricaricare il modulo:

1. **Hard reload della pagina** `/dev/card-preview` (Cmd/Ctrl + Shift + R su Chrome/Firefox).
2. Riseleziona **Corrie (reale)** + preset **Completo**.
3. Attendi la generazione e verifica visivamente:
   - Padding bianco uniforme sui 4 lati di ogni foto (cover e galleria).
   - Nessuna pagina bianca dopo l'ultima galleria.

Se dopo l'hard reload il layout è ancora quello vecchio, riportamelo: significa che il fix a `s.cover` non è sufficiente e serve indagare oltre (es. `objectFit:"cover"` in react-pdf con foto dal ratio molto diverso da 2:3, o un secondo path di rendering).
