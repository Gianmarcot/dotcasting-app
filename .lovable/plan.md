

## Installare DM Sans con pesi 300–800

### Problema
Il CSS e Tailwind config fanno riferimento a "DM Sans" ma `index.html` carica solo Inter e Tenor Sans da Google Fonts. Il font non viene mai scaricato.

### Soluzione

**`index.html`** — Sostituire il link Google Fonts (riga 13):

```html
<!-- Da -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Tenor+Sans&display=swap" rel="stylesheet">

<!-- A -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Tenor+Sans&display=swap" rel="stylesheet">
```

Inter viene rimosso perché non è più usato (DM Sans è il font principale). Tenor Sans resta per i titoli.

Un solo file da modificare.

