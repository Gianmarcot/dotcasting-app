# Icone dei suggerimenti alla dimensione standard

Nel box "Forza del Profilo" le icone dentro i cerchietti tratteggiati passano dalla misura ridotta (16px) alla misura standard usata nel resto dell'app: 20px, con lo stesso spessore di linea (1.5).

## Comportamento

- Il cerchietto tratteggiato resta della stessa dimensione; cambia solo l'icona al suo interno, che diventa leggermente più grande e visivamente coerente con le altre icone dell'app.
- Nessun'altra modifica al box, ai testi o all'avviso del codice fiscale.

## Dettagli tecnici

- `src/components/profile/v2/ProfileStrengthCard.tsx`: nell'icona dei suggerimenti sostituire `h-4 w-4` con `h-5 w-5`, mantenendo `strokeWidth={1.5}`.
