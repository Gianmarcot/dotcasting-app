# Stessa animazione di entrata per le altre finestre a tutto schermo

Obiettivo: la finestra di anteprima del profilo talent (e le altre finestre a tutto schermo) entra come le finestre foto/video: sale da tutta l'altezza dello schermo in mezzo secondo con easing ease-out quint, e dietro compare un velo scuro al 30% senza sfocatura.

## Comportamento

- Entrata: la finestra sale dal fondo dello schermo, 0,5s, easing morbido (ease-out quint), con dissolvenza contestuale.
- Uscita: discesa breve verso il basso con dissolvenza, 0,25s.
- Velo di fondo: nero al 30%, nessuna sfocatura, compare gradualmente in 0,4s.
- Con "riduci animazioni" attivo: semplice dissolvenza, nessuno spostamento.
- Nessuna modifica ai contenuti, al layout o alle barre di chiusura delle finestre.

## Finestre coinvolte

- Anteprima del profilo talent (scheda a tutta pagina con foto a sinistra e dati a destra).
- Restano invariate le finestre di dialogo piccole e centrate (form, conferme, wizard), che mantengono la loro animazione attuale.

## Dettagli tecnici

- File: `src/components/talents/detail/TalentDetailModal.tsx`.
- Overlay: sostituire `bg-black/40 ... fade-in-0 duration-300` con le stesse classi di `MediaGalleryModal.tsx`: `bg-foreground/30`, `data-[state=open]:duration-[400ms]`, `data-[state=closed]:duration-[250ms]`, `data-[state=open]:ease-[cubic-bezier(0.23,1,0.32,1)]`.
- Content: sostituire `data-[state=open]:animate-in ... slide-in-from-bottom-2 duration-300` con `data-[state=open]:animate-slide-up-panel`, uscita `data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-8 data-[state=closed]:duration-[250ms]`, più i fallback `motion-reduce:data-[state=open]:animate-fade-in` e `motion-reduce:data-[state=closed]:slide-out-to-bottom-0`; mantenere z-index, layout flex e scroll attuali.
- Nessuna modifica a `tailwind.config.ts` (keyframe `slide-up-panel` già presente), nessuna modifica a DB, RLS o logica.
