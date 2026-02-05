

## Piano: Ridisposizione Pulsanti nel Dialog Talent

### Problema Attuale
I tre pulsanti (Modifica, Invita, Esporta PDF) sono posizionati nell'header del dialog accanto al nome del talent. Quando lo spazio orizzontale è limitato, i pulsanti si sovrappongono al contenuto.

---

### Soluzione Proposta
Spostare i pulsanti in una sezione dedicata sotto l'header, disponendoli in modo che si adattino meglio allo spazio disponibile.

---

### Modifiche

**File: `src/components/talents/TalentDetailDialog.tsx`**

#### Layout Attuale (Problematico)

```
┌─────────────────────────────────────────────────┐
│ [Avatar]  Nome Cognome      [Mod] [Inv] [Exp]   │
│           📍 Città, Paese                       │
│           [Badge] [Badge] [Badge]               │
└─────────────────────────────────────────────────┘
```

#### Layout Proposto

```
┌─────────────────────────────────────────────────┐
│ [Avatar]  Nome Cognome                          │
│           📍 Città, Paese                       │
│           [Badge] [Badge] [Badge]               │
│                                                 │
│ [Modifica]    [Invita]    [Esporta PDF]         │
└─────────────────────────────────────────────────┘
```

---

### Dettagli Implementazione

1. **Rimuovere i pulsanti dall'header** (righe 135-163)
   - Eliminare il div contenitore dei pulsanti dalla sezione `justify-between`

2. **Creare una nuova sezione pulsanti** dopo l'header
   - Posizionare i pulsanti in una riga separata sotto le informazioni di base
   - Utilizzare `flex flex-wrap gap-2` per adattarsi a diverse dimensioni schermo
   - Aggiungere margine superiore per separazione visiva

3. **Struttura JSX aggiornata**:

```tsx
{/* Header with photo and name */}
<div className="flex items-start gap-4">
  <Avatar className="h-20 w-20">...</Avatar>
  <div className="flex-1 min-w-0">
    <h2 className="text-xl font-medium text-foreground">{fullName}</h2>
    {location && (
      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
        <MapPin className="h-3 w-3" />
        {location}
      </p>
    )}
    {/* Categories */}
    {talent.talent_categories && ...}
  </div>
</div>

{/* Action buttons - nuova sezione */}
<div className="flex flex-wrap gap-2 pt-4 pb-2">
  <Button variant="default" size="sm" onClick={...}>
    <Pencil className="h-4 w-4 mr-2" />
    Modifica
  </Button>
  <Button variant="outline" size="sm" onClick={...}>
    <Send className="h-4 w-4 mr-2" />
    Invita
  </Button>
  <Button variant="outline" size="sm" onClick={...}>
    <Download className="h-4 w-4 mr-2" />
    Esporta PDF
  </Button>
</div>
```

---

### File da Modificare

| File | Modifica |
|------|----------|
| `src/components/talents/TalentDetailDialog.tsx` | Riposizionare i pulsanti in sezione dedicata |

---

### Risultato Atteso

1. I pulsanti non si sovrappongono piu' al nome o alle badge
2. Layout responsive che si adatta a diverse dimensioni
3. Migliore separazione visiva tra informazioni e azioni
4. I pulsanti sono sempre accessibili e visibili

