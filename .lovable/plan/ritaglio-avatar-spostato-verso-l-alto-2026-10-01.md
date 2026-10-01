## Ritaglio avatar spostato verso l'alto

Oggi gli avatar tondi ritagliano la foto profilo al centro. Il ritaglio sarà spostato a metà strada tra il centro e il bordo alto della foto. La larghezza resta intera: si sposta solo il punto verticale, così il volto finisce più spesso dentro il cerchio.

### Dove si applica
- In tutti gli avatar della piattaforma, sia talent sia admin: menu laterale, barra mobile, righe Casting, round, candidature, aziende, comunicazioni, profilo pubblico, impostazioni account, Design System.
- Le foto grandi (anteprime 2:3, gallerie, schede talent) non cambiano.

### Dettagli tecnici
- In `src/components/ui/avatar.tsx`, `AvatarImage` riceve la posizione predefinita `object-[50%_25%]` accanto a `object-cover`. Il 25% verticale corrisponde a metà strada tra il centro (50%) e il bordo alto (0%).
- Le immagini avatar scritte come `<img>` normali con `rounded-full object-cover` (per esempio `CommunicationBubble.tsx`) ricevono la stessa classe. Le trovo cercando `rounded-full` + `object-cover` sugli `img` e le aggiorno una per una.
- Dove un'istanza passa già una sua posizione, quella resta valida.
- Aggiungo una regola in AGENTS.md: gli avatar tondi usano la posizione di ritaglio condivisa.
