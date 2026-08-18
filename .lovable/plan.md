Stilizzare globalmente i dropdown aperti del componente select in stile Revolut: più arrotondati, senza bordo, più aria verticale nelle voci, padding orizzontale ridotto e hover color `#F4F0EC`.

## Modifiche

1. **Aggiornare le classi CSS condivise in `src/index.css`:**
   - `.dc-select-content`: rimuovere il bordo, aumentare il border-radius a `rounded-2xl` (1rem), mantenere l'ombra e lo z-index.
   - `.dc-select-item`: ridurre il padding orizzontale, aumentare quello verticale, rimuovere il bordo dalle voci.
   - Hover: sostituire `focus:bg-accent` con `data-[highlighted]:bg-[#F4F0EC]`, in modo che il colore di hover sia il warm sand coerente con lo sfondo del form. Aggiungere anche la variante dark-mode (`dark:data-[highlighted]:bg-[#2a2a2a]`).
   - Posizione del checkmark: allineare a sinistra con il nuovo padding ridotto.

2. **Verificare l'uso in `src/components/ui/select.tsx`:**
   - Assicurarsi che `SelectItem` non aggiunga classi che sovrascrivano o confliggano con le nuove classi condivise.
   - Verificare che il viewport del dropdown mantenga lo spazio interno corretto senza doppi padding.

3. **Aggiornare la sezione Select nel Design System (`src/pages/DesignSystem.tsx`)** se presente, per riflettere il nuovo aspetto.

## Non incluso

- Nessuna modifica a schema, RLS, funzioni backend o logica di business.
- I trigger e i valori del select restano invariati; si tocca solo l'aspetto del menu aperto.

## Verifica

- Testare su `/talent/profile` che i select geografici (Stato, Regione, Provincia, Città) e gli altri dropdown mostrino il menu arrotondato, senza bordo, con voci più distanziate e hover `#F4F0EC`.
- Verificare anche su pagine owner come Casting e Ruoli che usano i select condivisi.
- Controllare la coerenza in dark mode.
