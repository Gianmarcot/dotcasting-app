# Mostra password mentre digiti

## Obiettivo
Aggiungere a tutti i campi password dell'app un'icona a occhio che permette di vedere in chiaro quello che si sta scrivendo, e di tornare a nasconderlo.

## Comportamento
- L'icona compare dentro il campo, a destra, sulla stessa riga del valore.
- Di default la password resta nascosta; un clic la mostra, un altro la nasconde.
- Il campo torna nascosto ogni volta che la pagina viene ricaricata.
- Etichetta accessibile che alterna "Mostra password" / "Nascondi password"; l'icona non ruba il focus al campo.

## Dove si applica
Tutti i punti dove oggi si digita una password:
- Accesso e registrazione (password e conferma password)
- Verifica/ripristino password
- Aggiorna i dati di accesso (area talent)
- Accettazione invito team
- Password cliente sui casting
- Password nell'area impostazioni owner
- Accesso alla pagina di condivisione al cliente

## Dettagli tecnici
- In `src/components/ui/field.tsx`, `FloatingInput` riconosce `type="password"` e gestisce internamente lo stato visibile/nascosto, alternando il `type` fra `password` e `text`.
- Il toggle è un `button type="button"` con `aria-label` dinamico, `aria-pressed`, icone `Eye`/`EyeOff` (lucide, strokeWidth 1.5), colore `var(--field-label)`, posizionato nella riga del valore senza spostare label o testo.
- Nessun cambiamento ai chiamanti: continuano a passare `type="password"` e ottengono il toggle automaticamente.
- `autoComplete` resta invariato per non rompere i gestori di password.
- Aggiunta della variante nella pagina Design System, sezione campi.

## Verifica
- Build del progetto.
- Controllo visivo su accesso, registrazione e aggiorna dati di accesso: allineamento icona, autofill e stato di errore invariati.
