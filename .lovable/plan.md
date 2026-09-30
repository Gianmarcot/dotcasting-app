# Titoli a 21px su telefono e menu laterale più leggibile

## Cosa cambia

**1. Titoli di pagina a 21px su telefono** (sotto i 768px; sugli schermi più grandi tutto resta come oggi)

| Pagina | Oggi | Dopo |
| --- | --- | --- |
| Il mio profilo | 24px ovunque | 21px su telefono, 24px su computer |
| I miei casting | 24px ovunque | 21px su telefono, 24px su computer |
| Impostazioni Account | 24px ovunque | 21px su telefono, 24px su computer |
| Dettaglio casting | 24px su telefono, 30px su computer | 21px su telefono, 30px su computer |
| Comunicazioni | già 21px | nessuna modifica |

La regola generale dei titoli dell'app non viene toccata: il 21px vale solo per le pagine dell'area talent. La home di benvenuto ("Ciao, nome") non è più raggiungibile — la home è il profilo — quindi resta com'è.

**2. Menu che si apre con l'hamburgher**

- **"Esci"**: passa dal rosso generico (un rosso-arancio) al rosso brand bordeaux.
- **Voce attuale**: il colore torna scuro come le altre voci, il testo diventa in grassetto, e a sinistra, nel margine interno della riga prima dell'icona, compare un pallino rosso brand da 8px che indica dove si è. Il pallino non sposta le scritte: le righe restano tutte allineate.

## Dettagli tecnici

- `src/pages/talent/TalentProfileV2.tsx` — h1: `text-2xl` → `text-[21px] md:text-2xl`
- `src/pages/talent/TalentCastings.tsx` — h1: `text-2xl` → `text-[21px] md:text-2xl`
- `src/pages/talent/TalentSettings.tsx` — h1: `text-2xl` → `text-[21px] md:text-2xl`
- `src/pages/talent/TalentCastingDetail.tsx` — h1: `text-2xl md:text-3xl` → `text-[21px] md:text-3xl`
- `src/pages/talent/TalentCommunications.tsx` — già `text-[21px]`, nessuna modifica
- `src/components/layout/TalentMobileNavbar.tsx`:
  - voce attiva: `text-primary` rimosso, resta `text-foreground` + `font-bold` (peso 700 di DM Sans, presente tra i font locali, quindi niente grassetto "falso")
  - pallino: `<span aria-hidden>` con `absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary` dentro la riga resa `relative`,渲染 solo sulla voce attiva; le altre righe non cambiano
  - "Esci": `text-destructive` → `text-primary` (rosso brand)
- Nessuna modifica al database, alle regole di accesso o alla regola globale `h1` in `src/index.css`

## Verifica

- Su telefono (393px): dimensione effettiva dei titoli = 21px su profilo, casting, impostazioni e dettaglio casting; su computer 24px (30px nel dettaglio casting)
- Menu aperto: "Esci" in rosso brand, voce attuale scura e in grassetto con pallino 8px a sinistra, scritte allineate tra le righe
- Controllo codice e build
