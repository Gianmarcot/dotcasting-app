# Campi con floating label come standard del Design System

Manteniamo il sistema colori surface-aware appena introdotto (token `--field-*`, `Surface` base/muted/brand/inverse), ma lo stile ufficiale dei campi diventa quello con floating label usato oggi nel profilo talent.

## Cosa cambia

1. **Nuovo componente condiviso** `src/components/ui/field.tsx` con `FloatingInput`, `FloatingTextarea`, `FloatingSelect` (più `FieldShell`/`FloatLabel` interni), presi dalla versione del profilo talent: altezza minima 64px, angoli `rounded-2xl`, label che scala in alto quando il campo è compilato o in focus, valore sempre nella stessa posizione (nessun salto), supporto a prefix, errore e warning.
2. **Colori solo dai token surface-aware**: le classi hardcoded del profilo (`bg-field`, `bg-field-focus`, `text-field-label`, `ring-foreground`) vengono sostituite dai token `--field-bg`, `--field-fg`, `--field-label`, `--field-border-focus`, `--field-bg-disabled`. Così gli stessi campi funzionano su bianco, crema, bordeaux e ink senza prop di variante.
3. **Profilo talent invariato a livello visivo**: `src/components/profile/fields/FormFields.tsx` smette di duplicare la logica e ri-esporta i componenti da `ui/field.tsx`, mantenendo le API attuali (nessuna modifica nelle card di profilo).
4. **Input/Textarea/Select base restano** per i casi in cui non serve label interna (barre di ricerca, filtri, tabelle), documentati come uso secondario.
5. **Pagina Design System aggiornata**: la sezione "Campi" mostra i floating field come standard — stati vuoto / compilato / focus / disabled / errore, textarea, select, cluster giorno-mese-anno, e i campi base come varianti compatte.
6. **Matrice `/dev/fields` aggiornata** per mostrare i floating field nei 4 contesti superficie, oltre agli input base.

## Note tecniche

- Nessuna modifica di dati o logica applicativa: solo presentazione e riorganizzazione dei componenti.
- Il ring di focus diventa `1px` bordo + `ring-inset` sul token `--field-border-focus` per evitare shift di layout.
- `FloatingSelect` continua a usare `SelectContent` con propagazione della surface nel portal (dropdown coerente col trigger).
