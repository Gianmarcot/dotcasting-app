# Header sezioni profilo talent: spaziatura e icone custom

## 1. Prima sezione (nome + "Le mie foto")

La sezione di testa (foto profilo, nome, città) usa oggi uno stacco di 40px prima dei campi. Va portata a 64px, coerente con le altre sezioni: il blocco header (foto + nome + località) chiude con margine inferiore 64px prima del primo campo.

## 2. Icone custom negli header delle sezioni

Le 6 icone caricate sostituiscono le icone Lucide, solo nella pagina profilo talent. Mantengono il tratto sottile del set attuale, dimensione 64x64, colore ereditato dal testo (`currentColor`) così restano coerenti con il tema.

Mappatura proposta:

| Sezione | Icona |
|---|---|
| Contatti | envelope-open |
| Indirizzo | location |
| Ruoli e talenti | price-tag |
| Aspetto fisico | t-shirt |
| Galleria e media | camera-alt |
| Bio, abilità e lingue | education |

Le due sezioni rimanenti — "Documenti e fiscalità" e "Lavoro e viaggi" — non hanno un'icona nel set caricato, quindi restano con l'icona Lucide attuale. Se vuoi, mandami anche quelle due e le allineo.

## Dettagli tecnici

- `src/components/profile/v2/HeadCard.tsx`: il wrapper dei campi passa da `mt-10` a `mt-16`.
- Nuovo file `src/components/profile/v2/sectionIcons.tsx` con i 6 SVG come componenti React (`fill="currentColor"`, `viewBox="0 0 24 24"`), senza `fill` hardcoded e senza attributi estranei (`id`, `transform`, `width/height` fissi) — il dimensionamento resta gestito da `SectionCard`.
- Aggiornamento della prop `icon` in `ContactsCard`, `AddressCard`, `RolesCard`, `PhysicalCard`, `MediaCard`, `BioCard` con i nuovi componenti; rimozione degli import Lucide non più usati.
- Nessuna modifica a `SectionCard`, alla logica di salvataggio o ad altre aree della piattaforma.
