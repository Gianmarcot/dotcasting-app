# Anteprima foto: stesso trattamento in cima alla pagina e in "Galleria e media"

## Obiettivo

L'anteprima a pila della foto deve essere identica nei due punti del profilo talent: proporzione 2:3, angoli un po' meno stondati, pulsante sovrapposto al bordo inferiore dell'immagine e prima immagine mostrata uguale alla foto profilo quando esiste.

## Cosa cambia

- **Proporzione 2:3**: oggi la pila in cima alla pagina è 168x220 px, quindi non esattamente 2:3. Diventa 168x252 px in entrambi i punti.
- **Angoli**: raggio leggermente ridotto sulle tre forme della pila (da 16 a 12 px), in entrambi i punti.
- **Pulsante sovrapposto**: nell'area foto e nell'area video di "Galleria e media" il pulsante non sta più sotto l'immagine in colonna, ma è appoggiato a cavallo del bordo inferiore dell'immagine, come "Le mie foto" in cima alla pagina. Stessa dimensione, stile e padding del pulsante in alto.
- **Prima immagine**: l'anteprima dell'area foto mostra la foto profilo quando presente; altrimenti l'ultima foto caricata.
- L'area video mantiene l'anteprima quadrata (i video non sono in formato verticale), ma adotta lo stesso raggio e lo stesso pulsante sovrapposto.
- Conteggio, indicazione dei minimi richiesti, stato vuoto, click sull'intera area e modali restano invariati.

## Dettagli tecnici

- `src/components/profile/v2/HeadCard.tsx`: contenitore pila `h-[252px] w-[168px]`, `rounded-xl` sulle tre forme.
- `src/components/profile/v2/MediaCard.tsx`:
  - `ratio` foto `h-[252px] w-[168px]`, video `h-[168px] w-[168px]`; `rounded-xl` sulle forme.
  - pulsante spostato dentro il wrapper della pila con `absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap`, `size="lg"` come in HeadCard; spaziatura sotto la pila aumentata per compensare la sporgenza.
  - foto di copertina: prima la foto con categoria `profile_photo`, altrimenti l'ultimo elemento dell'elenco ordinato.
- Nessuna modifica alla modale di gestione media, alla visibilità per ruoli o al database.
