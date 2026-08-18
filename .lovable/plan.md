Accorgimenti di stile al profilo talent

## Obiettivo
Aggiustare la gerarchia tipografica e la geometria dei divisori nella pagina di modifica profilo talent (`/talent/profile`), lasciando inalterata la sidebar e la logica di salvataggio.

## Modifiche previste

### 1. Gerarchia dei titoli di gruppo

Distinguere due componenti:
- **Etichette di campo** (es. "Numero di telefono", "Data di nascita") — restano `15px medium` con `mb-2` come oggi.
- **Titoli di gruppo** (es. "Residenza", "Domicilio", "Dati bancari") — diventano `16px` con `mb-8`.

File: `src/components/profile/fields/FormFields.tsx`
- Creare un nuovo `GroupHeading` con `text-base font-medium mb-8 text-group-label`.
- Lasciare `GroupLabel` invariato (`text-[15px] font-medium mb-2`).

### 2. Dividori orizzontali interni al padding

I `<hr>` tra blocchi di una stessa sezione devono essere larghi come la colonna di contenuto, non sporgere oltre il padding della card. Rimuovere i margini negativi da `SectionDivider`.

File: `src/components/profile/fields/FormFields.tsx`
- Cambiare `SectionDivider` da `-mx-5 border-t border-border sm:-mx-8` a un semplice `border-t border-border` senza margini negativi.

### 3. Sostituzione dei titoli nelle card

Tutti i titoli di tipo "Residenza", "Domicilio", "Dati bancari", "Corporatura", "Taglie", "Capelli e occhi", "Segni particolari", "Esperienze", "Ulteriori abilità", "Titolo di studio", "Lingue", "Occupazione principale", "Città di appoggio", "Patenti" etc. vengono convertiti da `GroupLabel` a `GroupHeading`.

Etichette che restano `GroupLabel`:
- "Numero di telefono", "WhatsApp", "Social Media" (Contatti)
- "Data di nascita", "Sesso", "Rappresentanza" (Head)
- "Hai allergie o intolleranze alimentari?", "Fai parte di una band o di un gruppo di artisti?", "Possiedo un'automobile", "Possiedo una moto" — domande brevi che fungono da label del campo sottostante.

File interessati:
- `src/components/profile/v2/AddressCard.tsx`
- `src/components/profile/v2/ContactsCard.tsx`
- `src/components/profile/v2/DocumentsCard.tsx`
- `src/components/profile/v2/HeadCard.tsx`
- `src/components/profile/v2/PhysicalCard.tsx`
- `src/components/profile/v2/BioCard.tsx`
- `src/components/profile/v2/RolesCard.tsx`
- `src/components/profile/v2/WorkTravelCard.tsx`

Nessun cambiamento richiesto per `MediaCard.tsx` che non usa `GroupLabel`.

## Cosa NON cambia
- Sidebar, colori del brand, font, spacing tra i campi (32px), componenti floating, salvataggio globale, barra sticky, logica del form.
- Non si aggiungono campi nuovi né si modifica il database.

## Verifica
Aprire `/talent/profile` e controllare:
- I titoli "Residenza", "Domicilio", "Dati bancari" sono più grandi (16px) e distano di 32px dal primo campo.
- I label "Numero di telefono" e "Data di nascita" restano 15px.
- I divider orizzontali non toccano i bordi della card, ma rientrano nel padding interno.