# Scelta dei contenuti nel PDF della scheda talent

Obiettivo: quando si scarica il PDF di una singola scheda talent, chi genera il documento sceglie esattamente quali foto e quali link video inserire.

## Cosa cambia per l'utente

Il download PDF della scheda talent diventa un percorso in tre passaggi:

1. **Dati** — come oggi: si spuntano i gruppi di informazioni da stampare.
2. **Foto** — "Seleziona quali foto vuoi inserire nel PDF". Ora compaiono tutte le foto del profilo, non solo quelle principali, raggruppate per categoria (Foto profilo, Foto principali, e le altre categorie presenti) con il nome della categoria come titolo di gruppo. Ogni gruppo ha "Seleziona tutte"; le prime due foto scelte restano le due grandi della prima pagina, le altre vanno in galleria. Un'indicazione a schermo ricorda quante foto sono selezionate.
3. **Video** — "Seleziona quale link video vuoi inserire nel PDF". Elenco dei video del profilo (titolo del video o nome della categoria come etichetta, più l'indirizzo) con selezione multipla. Il passaggio compare solo se il talent ha almeno un video; se ce n'è uno solo è preselezionato.

Nel PDF i video scelti compaiono come righe cliccabili in una sezione "Video" della prima pagina, sotto i contatti: testo con il titolo, che apre il video nel browser. Nessun video viene incorporato nel documento.

Se non si seleziona nessuna foto il PDF si genera comunque con le sole informazioni; il pulsante di generazione resta sempre attivo.

## Note tecniche

- `fetchRoundTalents.ts`: aggiungere `title` alla proiezione `talent_media` e, nel mapper, due campi nuovi sull'oggetto talent — `allPhotos` (tutte le foto con `category`, `title`, `sort_order`, URL trasformato) e `videos` (`url`, `title`, `category`) — filtrati con `isMediaCategoryVisible` sulle categorie effettive, così una categoria nascosta dai ruoli non è mai proponibile. `photos` resta invariato (solo `main_photos`), quindi round e viste cliente non cambiano comportamento.
- `talentFields.ts`: estendere il tipo `Talent` con i due campi opzionali sopra.
- `roundPreset.ts`: aggiungere al `RoundPreset` un campo opzionale `videoLinks?: { label: string; url: string }[]` e riportarlo in `ResolvedCard` (`videoLinks`), invariato quando assente.
- `TalentCardPDF.tsx`: nuovo blocco condizionale dopo i contatti che rende ogni link con `Link`/`Text` di `@react-pdf/renderer` (`src` = URL), stile coerente con le righe contatto. `TalentCardWeb.tsx` non viene toccato: il campo resta opzionale e la generazione dei round non lo popola.
- `TalentPdfWizard.tsx`: passa a 3 step, la griglia foto legge `allPhotos` con raggruppamento per categoria usando le etichette di `mediaCategories.ts`, nuovo step video con checkbox, e in `generate()` popola `videoLinks` nel preset. La risoluzione delle foto in data URL (`fetchPhotoAsDataUrl`) resta identica.
- Nessuna migrazione, nessuna modifica a RLS o allo schema.
