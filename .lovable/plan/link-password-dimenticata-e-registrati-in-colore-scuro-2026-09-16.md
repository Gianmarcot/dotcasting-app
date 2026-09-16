# Link "Password dimenticata" e "Registrati" in colore scuro

## Cosa cambia
- Entrambi i link diventano scuri (colore inchiostro `--ink`) invece che rossi, mantenendo la sottolineatura al passaggio del mouse.
- La distanza verticale tra il pulsante di invio, "Password dimenticata" e la riga "Non hai un account? Registrati" diventa uguale per entrambi.

## Dettagli tecnici
- `src/pages/AuthPage.tsx`:
  - pulsante "Password dimenticata": `mt-6 text-sm text-ink font-medium hover:underline transition-colors` (il contenitore passa da spaziatura del form a `mt-6` esplicito, coerente con il blocco sotto).
  - `span` di "Registrati"/"Accedi": `text-ink font-medium hover:underline`.
  - il blocco di switch resta `mt-6`, così i due link risultano equidistanti.
- Nessuna modifica alla logica di autenticazione.
