Il gradiente overlay nel pannello sinistro (`bg-gradient-to-t`) è posizionato con `absolute inset-0` ma non eredita il `border-radius` applicato al contenitore e alle immagini (`md:rounded-r-[2rem]`). Questo fa sì che, durante le transizioni o in certi rendering, il gradiente squadrato appaia leggermente fuori dal bordo arrotondato dello slider.

Fix:
- Aggiungere `md:rounded-r-[2rem]` al `<div className="absolute inset-0 bg-gradient-to-t ..." />` (riga 144) così il gradiente si autoclippi agli angoli come le immagini sottostanti.