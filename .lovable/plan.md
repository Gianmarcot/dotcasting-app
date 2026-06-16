# Dark theme — Pagina cliente (SharedRound)

Adatto solo i colori della pagina `/shared/round/...` (e della modale Dettagli) mantenendo identica la struttura, i componenti, gli spazi e i comportamenti attuali.

## Mappa colori

| Elemento | Attuale | Nuovo (dark) |
|---|---|---|
| Sfondo pagina | `#F5F0E8` (cream) | `#0F0F0F` |
| Superfici card | `bg-white` | `#1A1A1A` |
| Testo principale | `#333333` | `#F5F0E8` |
| Testo secondario / muted | `#666` | `white/60` |
| Divider / bordi sottili | `border-black/10` | `border-white/10` |
| Bordeaux brand (accento, CTA, "Selezionato") | `#A30A2B` | invariato |
| Status verde / giallo / rosso | invariati | invariati (su fondo scuro restano leggibili) |
| Modale Dettagli | fondo bianco | fondo `#1A1A1A`, testi chiari |
| Header / logo | logo scuro | uso `logo-white.png` |
| Schermata "Link non disponibile" e prompt password | cream + scuro | scuro + chiaro |

Il bordeaux `#A30A2B` resta l'unico accento brand; nessun nuovo colore introdotto.

## File toccati

- `src/pages/shared/SharedRound.tsx` — sostituzione classi colore (sfondo, card, testi, pill, divider) + swap logo.
- Eventuali sotto-componenti usati solo in questa pagina: stessa sostituzione di token colore.

## Fuori scope

- Nessuna modifica a layout, griglia, card structure, modale, copy, comportamenti, drawer mobile.
- Nessuna modifica a `index.css`, tailwind config o ad altre pagine (admin / talent restano com'erano).
- Nessun toggle light/dark: la pagina cliente diventa dark in modo fisso.
