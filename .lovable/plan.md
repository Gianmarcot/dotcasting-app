# Termini e condizioni ancorati al fondo pagina

## Obiettivo
Il link "Termini e condizioni" non deve più seguire il form, ma restare fisso in fondo alla colonna destra, a circa 24 px dal bordo inferiore.

## Cosa cambia
- Il link viene spostato fuori dal blocco del form e posizionato in fondo alla colonna destra, centrato, a 24 px dal fondo.
- Il form resta centrato verticalmente come ora e continua a scorrere se lo spazio non basta; il link non si sovrappone al form perché viene lasciato spazio sufficiente sotto.
- Stile del link invariato (testo piccolo, colore tenue, sottolineatura al passaggio del mouse).

## Dettagli tecnici
- File: `src/pages/AuthPage.tsx`.
- Rendere la colonna destra `relative` e spostare il link in un contenitore `absolute bottom-6 left-0 right-0 text-center` (24 px = `bottom-6`), rimuovendolo dal `div.mt-10` interno a `max-w-sm`.
- Aggiungere padding inferiore al contenitore del form (es. `pb-12`) per evitare sovrapposizioni quando la pagina è corta.
- Nessuna modifica a componenti condivisi o alla logica di autenticazione.
