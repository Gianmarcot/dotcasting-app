# Sfondo neutro del wrapper in "Aggiorna i dati di accesso"

## Problema
In `src/pages/talent/TalentUpdateAccess.tsx` il contenitore esterno è
`<Surface variant="base" ...>`. La classe `.dc-surface` applicata da `Surface`
dipinge lo sfondo con `--surface`, che nella variante `base` vale `var(--white)`.
Il `SectionCard` interno ha `bg-profile-card` (anch'esso bianco). Risultato:
bianco su bianco, il `rounded-3xl` del box interno non è visibile e il wrapper
stacca dallo sfondo cream della pagina (`--background`).

## Soluzione
Sostituire il wrapper `<Surface variant="base" ...>` con un semplice
`<div className="...">`, mantenendo le stesse classi di layout
(`mx-auto w-full max-w-[720px] px-4 pb-24 pt-8 sm:pt-16`).

Motivi:
- Il contesto dei campi (cream su card bianca) è già garantito dai default di
  `:root` (`--field-bg: var(--cream)`), come avviene in `TalentProfileV2` che
  usa un `<div>` senza `Surface`. Nessuna regressione visiva sui `FloatingInput`.
- Il contesto React `useSurface()` serve solo a `Select` (propagazione del
  `data-surface` nel portal). Questa pagina non contiene `Select`, quindi la
  rimozione di `Surface` è sicura.
- Senza `.dc-surface` non viene dipinto alcuno sfondo bianco: traspare il cream
  del body, il `rounded-3xl` del `SectionCard` diventa visibile.

## Modifica
Unica riga interessata (apertura e chiusura del wrapper):
- `src/pages/talent/TalentUpdateAccess.tsx` riga 139 (tag di apertura) e
  riga 262 (tag di chiusura): `Surface` → `div`, rimozione import di `Surface`
  se non più usato.

## Verifica
- `npx tsgo --noEmit` pulito.
- Build OK (observability build-errors.log).
- Controllo visivo su `/talent/aggiorna-accesso`: il box bianco con angoli
  arrotondati stacca correttamente sullo sfondo cream della pagina.
