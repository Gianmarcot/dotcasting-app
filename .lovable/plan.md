## Modifica layout griglia invii

Ripristinare la griglia dei round card a **2 colonne** su desktop.

### Modifica
In `RoleRoundsCompartment.tsx`, riga 131, cambiare:
```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4
```
in:
```
grid-cols-1 sm:grid-cols-2 gap-4
```

Rimuovendo `lg:grid-cols-3` la griglia rimane a 2 colonne su tablet e desktop, e 1 colonna su mobile. Nessun'altra modifica necessaria.