# Avviso "modifiche non salvate": due scelte chiare

## Cosa cambia per l'utente
- Titolo: "Salvare le modifiche alla shortlist?"
- Testo: "Hai N modifiche non salvate. Se esci senza salvare andranno perse."
- Solo due pulsanti, uno sotto l'altro e larghi quanto la finestra, così niente esce dai bordi:
  1. **Salva ed esci**: il pulsante principale bordeaux, in alto, perché è la scelta più sicura.
  2. **Esci senza salvare**: in grigio chiaro (non rosso), sotto.
- "Continua a modificare" non è più un pulsante: per restare basta la X in alto a destra, il tasto Esc o un clic fuori dall'avviso. La finestra resta aperta con le modifiche.
- Se salvi e qualcuno dei talent rimossi è già in una selezione, compare la solita conferma, poi la finestra si chiude.

## Dettagli tecnici
- `TalentPicker.tsx`: l'AlertDialog per la chiusura diventa `Dialog size="sm"` (con la X standard), il footer diventa `flex flex-col gap-2` con `Button` primario `w-full` ("Salva ed esci" → `save(true)`) e `Button variant="secondary" w-full` ("Esci senza salvare" → reset della bozza e chiusura).
- Lo z-index resta sopra la finestra (z-[100]).
- Si verifica nell'anteprima che non ci sia scorrimento orizzontale a 1390px e su mobile.
