# Lightbox valutazione foto: barra di navigazione del DS

## Cosa cambia per l'utente
- Nel lightbox (fondo nero) i comandi sparsi, cioè chiudi in alto a destra, apri/chiudi pannello valutazione e frecce ai lati, diventano un'unica barra arrotondata come quella delle modali, in alto a destra a 32px dai bordi.
- La barra ha una versione chiara pensata per i fondi scuri: fondo bianco all'8% di opacità, icone bianche.
- Il pulsante del pannello valutazione (presente solo per l'admin) ha lo stesso stile, un cerchio da 40x40 con icona da 20px, e sta nella stessa barra prima delle frecce, separato da un divisorio.
- I pulsanti "precedente/successivo" restano disattivati alle estremità, come nelle altre modali. Le scorciatoie da tastiera restano invariate.
- Contatore ("3 / 12") e nome categoria in basso: stessa pillola con fondo bianco all'8%, così lo stile resta coerente.
- Quando il pannello valutazione è aperto (largo 320px a destra), la barra si sposta a sinistra del pannello per non coprirlo.

## Dettagli tecnici
- `ModalNavBar`: nuova prop `tone?: "dark" | "light"` (predefinita `dark`, comportamento attuale invariato). `light` → `bg-white/[0.08]` e divisorio `bg-white/25`; le icone sono già `text-white`. Nuova prop `leadingActions?: ReactNode` per inserire pulsanti extra prima delle frecce. Esporto `ModalNavButton` (l'attuale CircleButton) per riusarlo.
- `MediaLightbox.tsx`: rimuovere i `Button` ghost per chiudere, per il pannello e per le frecce laterali (Chevron); usare `<ModalNavBar tone="light" showNavigation={items>1} leadingActions={toggle pannello} className="absolute top-8 right-8">`, con `right-[352px]` quando il pannello è aperto. Fermare la propagazione del clic sul contenitore della barra, così non si chiude il lightbox.
- Pagina design system: aggiungere l'esempio della variante `light` su fondo `bg-ink`.
- Verifica con Playwright: aprire il lightbox dalla gestione foto e dal drawer admin e controllare che frecce, chiusura, pannello e stelle rispondano al clic.
