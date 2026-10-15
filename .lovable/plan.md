# Pannello dettagli: titolo, pulsante Modifica, comportamento uniforme

## 1. Titolo in maiuscolo
Il titolo "Dettaglio casting" / "Dettagli ruolo" torna in maiuscolo con il carattere dei titoli. Le etichette dei blocchi restano in minuscolo come ora.

## 2. Pulsante "Modifica" sul ruolo
Quando il pannello del ruolo è chiuso, a destra del nome del ruolo compare il pulsante secondario "Modifica", che apre la finestra di modifica del ruolo. È identico a quello del casting: visibile solo da desktop e nascosto quando il pannello è aperto.

## 3. Stesso comportamento su casting e ruolo
Oggi il pannello del casting si apre in affiancamento da 1280px in su, quello del ruolo solo da 1440px. Entrambi useranno la soglia di 1280px. Sotto questa soglia il pannello parte chiuso e si apre sopra il contenuto.

Anche il riquadro dei dettagli su telefono sarà lo stesso: oggi il ruolo usa un riquadro bianco e il casting uno beige. Si usa quello beige del casting.

## Dettagli tecnici
- `DetailsPanelParts.tsx`: titolo `DetailsPanelShell` con `font-display uppercase`.
- `OwnerCastingRoleDetail.tsx`: h1 dentro `flex items-center gap-3` con `Button variant="secondary" size="md" className="ml-auto hidden md:inline-flex"` quando `!panel.open`, che chiama `setEditRoleOpen(true)`. Si toglie `wideQuery: "(min-width: 1440px)"` per usare il valore predefinito; resta il proprio `storageKey`. Il riquadro mobile passa da `dc-card p-6` a `rounded-3xl bg-cream-dark p-8`.
