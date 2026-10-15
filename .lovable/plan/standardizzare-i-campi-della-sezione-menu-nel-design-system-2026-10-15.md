# Standardizzare i campi della sezione Menu nel Design System

## Problema (verificato in anteprima)

Nella sezione "Menu · Scenari interattivi" del Design System alcuni trigger hanno un aspetto diverso dagli altri:

| Esempio | Oggi | Standard campo |
|---|---|---|
| Cerca città / Seleziona città (scenari 4, 5, 12) | 40px, pillola 9999px, testo 14px | 48px, raggio 16px, testo 16px |
| Apri finestra (scenario 12) | idem | idem |
| Filtri (pannello filtri) | idem | idem |

Tutti gli altri (Città · breve, elenco completo, sezioni, icone, talent, stati, disabilitato) sono già standard.

**Causa:** questi trigger sono costruiti come `Button variant="ghost"` con sopra la classe `.dc-select-trigger`. Le utility del pulsante (h-10, rounded-full, text-sm, px-6) stanno nel layer utilities di Tailwind e sovrascrivono lo stile del campo definito in `@layer components`.

## Interventi

1. **`src/components/ui/search-select.tsx`** — sostituire il trigger `Button` con un `<button type="button">` nativo che porta solo `dc-select-trigger` (come fa già `SelectTrigger` di Radix, che non ha classi shadcn che interferiscono). Si mantengono `role="combobox"`, `aria-expanded`, `aria-label`, `disabled`, `w-full justify-between` e `ChevronDown`. Si aggiunge `data-placeholder` quando nessun valore è selezionato, così il testo segnaposto prende il grigio `--field-label` come nei campi Select.
2. **`src/pages/dev/MenuScenarios.tsx`** — i trigger demo "Apri finestra" (scenario 12) e "Filtri" (pannello filtri) smettono di essere `Button ghost` + `dc-select-trigger`: diventano lo stesso trigger nativo standard (48px, raggio 16px), uniforme a tutti gli altri esempi. Piccolo componente locale condiviso nel file per non duplicare classi.
3. **Escluso deliberatamente:** i chip "Ruolo / Anagrafica / Aspetto / …" della barra filtri talenti restano pillola perché sono pulsanti-ancora che aprono il pannello, non campi (hanno `rounded-full` esplicito, è una scelta già fatta).

## Effetto collaterale voluto

La correzione a `search-select.tsx` è globale: ogni `SearchSelect` dell'app (pannello filtri talenti, pannelli di selezione, ecc.) assume lo stesso aspetto dei campi Select. Nessun cambio di comportamento, solo stile.

## Verifica

- Playwright sulla sezione menu: tutti i trigger devono risultare 48px / raggio 16px / testo 16px.
- Controllo visivo degli scenari 4, 5, 12 e del pannello filtri (anche su superficie brand e scura, per i colori surface-aware).
- Typecheck e build OK.
