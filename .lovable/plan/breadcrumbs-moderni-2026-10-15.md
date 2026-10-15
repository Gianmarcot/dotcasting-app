# Breadcrumbs moderni

Riferimenti: Vercel, Linear, Notion, GitHub. Hanno tutti in comune separatori leggeri, voci che si evidenziano come piccole pillole e percorsi lunghi che si accorciano da soli.

## Cosa cambia per te
- **Separatore a barra obliqua "/"** sottile e chiaro al posto della freccetta (stile Vercel/GitHub).
- **Voci a pillola**: passando sopra una voce compare un leggero fondo arrotondato, come i pulsanti ghost. Sono più facili da cliccare e anche su telefono la zona da toccare è più grande.
- **Pagina corrente** in testo scuro e semibold. Le voci precedenti restano in grigio.
- **Prima voce con icona** (claqueta) accanto a "Casting", per orientarsi subito.
- **Percorsi lunghi compressi**: con più di 3 livelli, quelli centrali diventano un "…" che apre un menu scuro (lo stesso stile dei dropdown) con le voci nascoste. Succede già sulla pagina dell'invio: Casting / … / Selezioni / Invio 2.
- **Nomi lunghi troncati** con i puntini; il nome completo compare in una tooltip.
- **Caricamento**: finché il nome del casting o del ruolo non è arrivato, al posto dei "…" compare una barretta grigia animata.
- **Telefono**: restano solo la voce precedente e la pagina corrente; il resto va nel menu "…".

## Dettagli tecnici
- Restyle di `src/components/ui/breadcrumb.tsx`: separatore "/" con `text-muted-foreground opacity-50`, link `rounded-full px-2 py-1 -mx-1 hover:bg-muted/60` (nessuna transizione di colore sul badge), pagina `text-foreground font-medium`, `BreadcrumbEllipsis` come trigger di `DropdownMenu`.
- `CastingBreadcrumbs.tsx`: compressione dei livelli centrali (>3 su desktop, >2 sotto `sm`), `Skeleton` quando un nome manca, `Tooltip` sulle voci troncate, icona `Clapperboard` sulla prima voce.
- Il Design System si aggiorna da solo, perché usa lo stesso componente.
