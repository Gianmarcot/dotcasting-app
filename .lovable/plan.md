

## Piano: Sostituire Checkbox con Chips Selezionabili nella Sezione Ruoli

### Obiettivo
Modificare la sezione "Ruoli e Talenti" sostituendo le checkbox tradizionali con chips (badge) cliccabili per una selezione più moderna e visivamente accattivante.

### Comportamento delle Chips

| Stato | Stile |
|-------|-------|
| Non selezionato | Bordo scuro (`border-foreground`), sfondo trasparente, testo scuro |
| Selezionato | Sfondo `primary` (bordeaux), testo bianco |
| Hover | Leggero cambio di sfondo (`hover:bg-muted`) |
| Disabilitato (non in modifica) | Opacità ridotta, cursor not-allowed |

### Modifiche richieste

**File: `src/components/profile/TalentRolesSection.tsx`**

1. **Rimuovere import Checkbox** - Non più necessario
2. **Sostituire layout checkbox** - Da griglia con checkbox a flex wrap con chips
3. **Rimuovere la sezione badge finale** - Le chips saranno già visibili sia in editing che non

### Layout prima e dopo

**Prima:**
```
[x] Modello/Modella    [x] Attore/Attrice    [ ] Real people
[ ] Steward/Promoter   [ ] Piedista          [ ] Manista
```

**Dopo:**
```
[Modello/Modella] [Attore/Attrice] [Real people] [Steward/Promoter]
[Piedista] [Manista] [Presentatore] [Speaker radiofonico] ...
```

### Codice chips

```tsx
{group.roles.map(role => (
  <button
    key={role}
    type="button"
    onClick={() => isEditing && handleRoleToggle(role)}
    disabled={!isEditing}
    className={cn(
      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
      "border border-foreground",
      selectedRoles.includes(role)
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-transparent text-foreground hover:bg-muted",
      !isEditing && "opacity-70 cursor-not-allowed"
    )}
  >
    {role}
  </button>
))}
```

### Risultato atteso

- Chips con forma a pillola coerente con i pulsanti del design system
- Stile selezionato: bordeaux con testo bianco
- Stile non selezionato: bordo scuro su sfondo trasparente
- Interazione intuitiva: click per selezionare/deselezionare
- Nessun cambiamento al "Tipo di rappresentanza" (rimane con radio button)

