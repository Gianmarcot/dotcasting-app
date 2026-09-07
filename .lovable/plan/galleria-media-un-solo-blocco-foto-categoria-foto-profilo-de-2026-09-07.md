# Galleria media: un solo blocco foto, categoria "Foto profilo" dentro la modale

## Obiettivo

Nella sezione "Galleria e media" del profilo talent restano solo due blocchi: **Tutte le foto** e **Tutti i video**. La foto profilo continua a essere una categoria a sé, ma vive dentro la modale delle foto insieme alle altre (Foto profilo, Foto principali, Polaroid, ecc.).

## Cosa cambia

- Rimosso il blocco separato "Foto profilo" dalla pagina profilo.
- Il blocco "Tutte le foto" mostra le anteprime di tutte le categorie foto visibili, foto profilo compresa (ogni miniatura tiene la sua etichetta di categoria).
- Aprendo "Tutte le foto" la modale parte dalla categoria "Foto profilo" e permette di passare alle altre categorie come già avviene.
- Il blocco "Tutti i video" resta invariato.
- Il pulsante "Le mie foto" nell'intestazione del profilo continua ad aprire la modale direttamente sulla categoria "Foto profilo".
- Nessun cambiamento alle regole di visibilità per ruolo, ai minimi richiesti, ai dati salvati o al punteggio di completezza.

## Dettagli tecnici

- `src/components/profile/v2/MediaCard.tsx`: eliminare la `MediaStrip` dedicata al profilo e la variabile `galleryPhotoKeys`; la striscia foto usa tutte le `visiblePhotoCategories(roles)`, con `onOpen` che apre la modale su `PROFILE_PHOTO_CATEGORY` quando presente, altrimenti sulla prima categoria visibile.
- Nessuna modifica a `MediaGalleryModal.tsx`, che già elenca la foto profilo tra le categorie con slot singolo.
- Nessuna modifica al database.
