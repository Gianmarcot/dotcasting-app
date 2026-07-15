## Riorganizzazione toolbar pagina Casting

Modifica solo di layout in `src/components/castings/CastingFilters.tsx` (e, se serve, `OwnerCastings.tsx` per passare il conteggio).

### Nuovo layout (una sola riga, responsive)

```text
[ Stato ▾ ] [ 🔍 Cerca casting............... ]        [ 12 casting ]  [ Ordina per ▾ ]
└──────────── sinistra ────────────────────┘        └──────────── destra ────────────┘
```

- **Sinistra**: dropdown Stato + search bar (max-width **450px**, `flex-1` fino a quel limite).
- **Destra**: testo conteggio casting (es. "12 casting") + dropdown ordinamento.
- Contenitore: `flex items-center justify-between gap-4`, wrap su mobile.

### Dettagli

- Il conteggio arriva da `OwnerCastings.tsx` (già ha la lista filtrata) come prop `count: number` a `CastingFilters`.
- Testo conteggio: stile muted, es. `text-sm text-muted-foreground`, singolare/plurale ("1 casting" / "N casting").
- Search bar: `max-w-[450px] w-full`.
- Nessun cambio a logica di filtro/ordinamento/hook.
