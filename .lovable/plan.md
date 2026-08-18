# Pianificazione: "Luogo di nascita" come label

## Obiettivo
Trasformare la scritta "Luogo di nascita" nella sezione anagrafica del profilo talent da titolo di gruppo (`GroupHeading`) a label di campo (`GroupLabel`), in modo da allinearla alla gerarchia visiva dei componenti del form.

## Modifica prevista
- File: `src/components/profile/v2/HeadCard.tsx`
- Riga 205: sostituire `<GroupHeading>Luogo di nascita</GroupHeading>` con `<GroupLabel>Luogo di nascita</GroupLabel>`.
- `GroupLabel` è già importato nel file; nessun altro import necessario.

## Verifica
- Controllare in preview che "Luogo di nascita" appaia con lo stile di label (testo 15px, font-medium, margine inferiore ridotto) e non come titolo di gruppo.
- Verificare che i campi a cascata (Stato, Regione, Provincia, Città) mantengano il layout a 4 colonne e il corretto spacing.

## Note
Nessun cambiamento al database, al routing o alla logica di business. Solo presentazione.
