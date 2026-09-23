# Mazzo di foto: rotazione più marcata e apertura al passaggio del mouse

## Cosa cambia

- Le due forme beige dietro l'immagine ruotano un po' di più a riposo (da 6 e 3 gradi a 9 e 6 gradi, in direzioni opposte).
- Passando il mouse sul mazzo, le due forme dietro si aprono leggermente: ruotano un paio di gradi in più e si spostano di pochi pixel verso l'esterno, mentre l'immagine in primo piano resta ferma. Movimento morbido, circa 300 ms, e ritorno alla posizione iniziale quando il mouse esce.
- Vale sia per il mazzo in cima alla pagina profilo sia per quelli nelle aree foto e video di "Galleria e media".
- Niente altro cambia: dimensioni, proporzioni 2:3, angoli, pulsanti e click restano come ora.

## Dettagli tecnici

- `src/components/profile/v2/HeadCard.tsx` e `src/components/profile/v2/MediaCard.tsx`: il wrapper della pila prende `group`; le due forme di sfondo passano a `-rotate-9` / `rotate-6` con `transition-transform duration-300 ease-out` e stato hover `group-hover:-rotate-12 group-hover:-translate-x-1` / `group-hover:rotate-9 group-hover:translate-x-1`.
- Rotazioni non standard (`rotate-9`, `rotate-12` inverso) espresse con classi arbitrarie Tailwind dove necessario, senza nuove utility globali.
