# Avvisi codice fiscale più visibili

## Cosa cambia in Documenti e fiscalità

1. **Divider** tra il blocco del codice fiscale e il caricamento del documento d'identità, con lo stesso separatore già usato nelle altre parti della sezione.

2. **Avvisi di incoerenza del codice fiscale** (es. "Il codice fiscale non corrisponde a luogo di nascita...") non più come piccolo testo sotto il campo, ma come riquadro d'avviso della stessa forma della nota "senza codice fiscale italiano": icona a sinistra, testo su più righe, angoli arrotondati. Anche l'errore di codice formalmente sbagliato ("non sembra corretto") usa lo stesso riquadro.

3. **Colore avviso**: entrambi i riquadri passano al colore d'avviso del design system (giallo/ocra #C88500 in versione tenue con testo scuro), così si distinguono dal resto della pagina.

## Dettagli tecnici

- `src/components/profile/v2/DocumentsCard.tsx`: aggiungere `<SectionDivider />` prima di `UploadBlock`; rimuovere `error`/`warning` inline dal `FloatingInput` del CF (mantenendo lo stato rosso del bordo solo per l'errore formale) e renderizzare sotto il campo un riquadro condiviso.
- Nuovo piccolo componente locale (o in `FormFields.tsx`) `NoticeBox` con `tone: "warning" | "neutral"`, che usa i token `--warning` / `--warning-foreground` con sfondo `hsl(var(--warning)/0.12)` e bordo trasparente, coerente con `.dc-badge-warning`.
- La nota "senza codice fiscale italiano" usa lo stesso `NoticeBox` con tono warning.
- Nessuna modifica a database, RLS o logica di validazione/stato (`fiscal_code_mismatch` resta invariato).
