# Finestra foto/video come foglio sopra la pagina

Solo le finestre "Tutte le foto" e "Tutti i video" (stessa finestra condivisa).

## Cosa cambia
- La finestra non copre più tutto lo schermo: parte a circa 1,5rem (24px) dall'alto e arriva fino in fondo. Nella striscia in alto si vede la pagina sotto con il velo scuro al 30%.
- Angoli superiori arrotondati (come i box dell'app), così si legge come un foglio appoggiato sopra.
- Il pulsante "Chiudi" resta dentro la finestra in alto a destra, non più fissato allo schermo.
- Il contenuto scorre dentro la finestra; entrata dal basso, velo ed easing invariati.
- Cliccare sulla striscia visibile in alto chiude la finestra (come fuori da una finestra normale).

## Dettagli tecnici
- `MediaGalleryModal.tsx`: contenitore da `fixed inset-0` a `fixed inset-x-0 bottom-0 top-6 rounded-t-3xl overflow-y-auto`.
- ModalNavBar da `fixed right-8 top-8` a `sticky`/absolute interno al pannello.
- Nessuna modifica a dati, categorie o logica.
