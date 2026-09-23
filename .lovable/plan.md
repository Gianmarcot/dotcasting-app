# Mazzo di foto: ritorno all'apertura laterale, rotazioni più contenute e profondità

## Cosa cambia

- Si torna alla versione precedente dell'animazione: al passaggio del mouse le due forme dietro si aprono di lato (non più a ventaglio dal basso).
- Rotazioni ridotte: a riposo circa 7 e 4 gradi (invece di 9 e 6); all'hover circa 10 e 7 gradi (invece di 13 e 10), sempre con un piccolo spostamento laterale.
- Per dare più senso di tridimensionalità, la forma più arretrata usa il beige più scuro #ECE5DE, mentre quella intermedia resta nel beige chiaro attuale.
- L'anteprima dei video, più bassa di quella delle foto, viene centrata verticalmente nella sua area, così le due colonne di "Galleria e media" appaiono equilibrate.
- Vale sia per il mazzo in cima alla pagina profilo sia per quelli nelle aree foto e video. Nient'altro cambia.

## Dettagli tecnici

In `src/components/profile/v2/HeadCard.tsx` e `src/components/profile/v2/MediaCard.tsx`:
- rimossi `origin-bottom` e le trasformazioni a ventaglio, ripristinata `duration-300 ease-out`;
- forma arretrata: `bg-[hsl(var(--profile-strength))]` (token già pari a #ECE5DE), `[transform:rotate(-7deg)]` con `group-hover:[transform:rotate(-10deg)_translateX(-4px)]`;
- forma intermedia: `bg-field/80`, `[transform:rotate(4deg)]` con `group-hover:[transform:rotate(7deg)_translateX(4px)]`.

In `MediaCard.tsx`, blocco centrale di `MediaArea`: il gruppo conteggio + pila diventa `flex-1 justify-center`, così la pila resta centrata verticalmente nello spazio tra il conteggio e il pulsante ancorato in basso.
