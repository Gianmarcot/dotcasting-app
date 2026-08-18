# Pulsanti form profilo e colore divider

## Goal
Aggiornare l’area profilo talent con due micro-correzioni di design system:
- divider orizzontali color `#D9D9D9`, senza toccare gli altri bordi;
- i pulsanti dentro il form usano per lo più la variante `secondary` del DS; i pulsanti “Aggiungi lingua” e “Aggiungi città” diventano `primary` `sm`.

## Modifiche pianificate

### 1. Token divider dedicato
- In `src/index.css` aggiungere una nuova variabile semantica `--divider` (light: `#D9D9D9` → HSL 0 0% 85%; dark: equivalente coerente con il tema scuro).
- In `tailwind.config.ts` registrare il colore `divider: 'hsl(var(--divider))'`.

### 2. Applicare il colore divider
- In `src/components/profile/fields/FormFields.tsx` sostituire `SectionDivider` da `border-border` a `border-divider`.
- In `src/pages/DesignSystem.tsx` aggiungere lo swatch del token `--divider` nella sezione Tokens.

### 3. Audit e unificazione dei pulsanti nel form
- Sostituire tutti i `<button>` custom dentro le card profilo e in `UploadBlock.tsx` con il componente `Button` di shadcn.
- **Primary small**: pulsanti “Aggiungi lingua” (`BioCard.tsx`) e “Aggiungi città” (`WorkTravelCard.tsx`) → `Button` variant default, `size="sm"`, con icona `Plus`.
- **Secondary**: tutti gli altri pulsanti del form (upload/sostituisci/rimuovi file, pulsanti di conferma/annullamento inline, ecc.) → `Button variant="secondary"` con la dimensione appropriata (`sm`, `icon-sm`, `icon-md`).

## Verifica
- Typecheck del progetto.
- Screenshot di `/talent/profile` per confermare coerenza visiva: divider color `#D9D9D9`, pulsanti lingua/città in primary sm, gli altri in secondary.
