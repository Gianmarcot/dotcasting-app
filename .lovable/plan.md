# Toast: posizione e colori

## Obiettivo
I messaggi temporanei (toast) compaiono in alto a destra, con fondo scuro e testo chiaro, senza bordo. Gli errori usano un rosso scuro del design system.

## Comportamento
- Posizione: alto a destra, su tutte le pagine.
- Stile base: fondo scuro come la barra tonda delle modali, testo chiaro, nessun bordo, angoli morbidi, ombra leggera.
- Descrizione secondaria: testo chiaro leggermente attenuato.
- Errori (`toast.error`): fondo rosso scuro del brand, testo chiaro.
- Successo/info: stesso stile scuro di base (il colore resta riservato all'errore).
- Pulsanti azione/annulla dentro al toast: leggibili sul fondo scuro.

## Dettagli tecnici
- `src/components/ui/sonner.tsx`: aggiungere `position="top-right"`, rimuovere le classi `bg-background/text-foreground/border-border` e impostare fondo `#0f0f0f` (come `ModalNavBar`), testo chiaro, `border-0`, `rounded-2xl`.
- Variante errore tramite `classNames.error` con fondo `hsl(var(--brand-800))` → token DS `#800e27` e testo chiaro.
- `classNames.description`, `actionButton`, `cancelButton` adeguati al fondo scuro.
- Aggiungere alla pagina `/design-system` una sezione Toast con esempi (base, descrizione, errore) per centralizzare le future modifiche.
- Nessuna modifica al legacy `@/components/ui/toaster`; gli usi esistenti di `toast` restano invariati.
