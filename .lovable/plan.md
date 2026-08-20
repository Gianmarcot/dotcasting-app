Piano layout pagina di autenticazione

Obiettivo
Rendere il lato sinistro della pagina Auth (carosello) alto esattamente 100vh e fisso in viewport, mentre il lato destro (form) rimane centrato verticalmente ma può scrollare quando il contenuto supera l'altezza dello schermo.

File da modificare
- src/pages/AuthPage.tsx

Modifiche tecniche
1. Container radice
   - Mantenere `min-h-screen bg-background flex`.
   - Non aggiungere `overflow-hidden` per non impedire il comportamento sticky del lato sinistro.

2. Lato sinistro (carosello)
   - Aggiungere `sticky top-0 h-screen shrink-0` al contenitore esistente.
   - Mantenere `hidden md:block md:rounded-r-[2rem] bg-black w-[45%] max-w-[720px]`.
   - Verificare che le immagini e i gradienti interni continuino a riempire l'intera altezza (`absolute inset-0 h-full`).
   - La caption e i controlli del carosello restano in fondo all'area fissa.

3. Lato destro (form)
   - Aggiungere `min-h-screen` al contenitore esistente.
   - Mantenere `flex-1 flex items-center justify-center p-6 md:p-12`.
   - In questo modo il form è centrato quando c'è spazio, e la colonna si espande oltre la viewport (con scroll del body) se il contenuto è più alto.

4. Mobile
   - Il lato sinistro resta `hidden md:block`, quindi su mobile non cambia il comportamento: il form occupa tutta la larghezza e scrolla normalmente.

Note
- Nessun impatto su schema, RLS, rotte o componenti condivisi.
- Intervento esclusivamente sul layout CSS della pagina di autenticazione.

Verifica
- Build del progetto.
- Controllo visivo sul preview: desktop con viewport alta e bassa, viewport mobile.
