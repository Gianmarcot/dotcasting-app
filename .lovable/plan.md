# Icona mostra password centrata nel campo

## Problema
L'icona a occhio è posizionata nella stessa riga del valore, che è spostata verso il basso per lasciare spazio alla label. Risultato: l'icona appare bassa rispetto all'altezza del campo.

## Soluzione
Ancorare l'icona al campo (non alla riga del valore), centrata verticalmente e a 16px dal bordo destro, così resta al centro sia a riposo che con la label in alto.

## Dettagli tecnici
- In `src/components/ui/field.tsx` il pulsante di toggle esce dal contenitore `mt-[18px]` e diventa `absolute right-4 top-1/2 -translate-y-1/2` all'interno di `FieldShell` (già `relative`).
- Al testo dell'input viene aggiunto spazio a destra (`pr-8` sulla riga del valore quando il campo è password) per evitare che il valore finisca sotto l'icona.
- Nessun cambiamento a icone, colori, dimensioni, accessibilità o ai chiamanti.

## Verifica
- Build del progetto.
- Controllo visivo su accesso: icona centrata con campo vuoto e compilato.
