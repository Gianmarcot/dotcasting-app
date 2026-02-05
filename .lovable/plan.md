
## Piano: Semplificazione Header Messaggistica e Uniformità Sfondo

### Panoramica
Sostituire l'header attuale ("Centro messaggi" + sottotitolo) con il semplice titolo "Conversazioni" già presente nella sidebar, e rimuovere la Card wrapper per rendere il contenuto uniforme allo sfondo bianco del layout.

---

### Analisi Attuale

**OwnerMessages.tsx (righe 61-71):**
```tsx
<div className="flex items-center justify-between mb-4">
  <div>
    <h1 className="text-2xl text-foreground">{it.backoffice.messagingCenter}</h1>
    <p className="text-muted-foreground mt-1">Comunicazioni con i talenti</p>
  </div>
  <Button onClick={() => setNewThreadOpen(true)}>
    <Plus className="h-4 w-4 mr-2" />
    {it.messages.newMessage}
  </Button>
</div>
```

**TalentMessages.tsx (righe 54-58):**
```tsx
<div className="mb-4">
  <h1 className="text-2xl text-foreground">{it.messages.title}</h1>
  <p className="text-muted-foreground mt-1">Comunicazioni con la piattaforma</p>
</div>
```

Il contenuto è avvolto in una `<Card>` che crea una distinzione visiva non necessaria dato che il layout padre (`OwnerLayout`) ha già uno sfondo bianco (`bg-white`).

---

### Modifiche Previste

#### 1. OwnerMessages.tsx

| Elemento | Modifica |
|----------|----------|
| Header principale | Rimuovere completamente (righe 61-71) |
| Titolo "Conversazioni" nella sidebar | Aggiungere il pulsante "+" accanto |
| Card wrapper | Rimuovere e usare un semplice `div` senza bordi/shadow |
| Bordi interni | Mantenere solo `border-r` per separare lista da conversazione |

**Nuovo header sidebar (riga 78-80):**
```tsx
<div className="p-3 border-b flex items-center justify-between">
  <h2 className="font-medium text-lg">Conversazioni</h2>
  <Button size="icon" variant="ghost" onClick={() => setNewThreadOpen(true)}>
    <Plus className="h-5 w-5" />
  </Button>
</div>
```

#### 2. TalentMessages.tsx

| Elemento | Modifica |
|----------|----------|
| Header principale | Rimuovere completamente (righe 54-58) |
| Titolo "Conversazioni" nella sidebar | Ingrandire leggermente per coerenza |
| Card wrapper | Rimuovere e usare un semplice `div` |

---

### Dettagli Tecnici

**Container principale (entrambi i file):**
```tsx
// Da:
<div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-up">
  {/* Header rimosso */}
  <Card className="flex-1 flex overflow-hidden border-0 shadow-sm">

// A:
<div className="h-[calc(100vh-6rem)] flex animate-fade-up">
  {/* Nessun Card wrapper, direttamente il contenuto */}
```

**Layout uniforme:**
- Rimuovere `<Card>` e usare `<div className="flex-1 flex overflow-hidden">`
- Lo sfondo sarà automaticamente quello del layout padre (bianco)
- Mantenere `border-r` sulla lista thread per separazione visiva
- Regolare l'altezza per occupare più spazio verticale senza header

---

### File da Modificare

| File | Modifiche |
|------|-----------|
| `src/pages/owner/OwnerMessages.tsx` | Rimuovere header, rimuovere Card, spostare pulsante + nella sidebar |
| `src/pages/talent/TalentMessages.tsx` | Rimuovere header, rimuovere Card |

---

### Risultato Visivo Atteso

```text
┌────────────────────────────────────────────────────────────────┐
│ Conversazioni                [+]│                              │
│─────────────────────────────────│                              │
│ 👤 Mario Rossi          14:32  │    Seleziona una             │
│    Fashion Week Milano          │    conversazione              │
│    Ultimo messaggio...          │                              │
│─────────────────────────────────│    o iniziane una nuova      │
│ 👤 Laura Bianchi        Ieri   │                              │
│    Casting XYZ                  │                              │
│    Grazie per...                │                              │
│                                 │                              │
└─────────────────────────────────┴──────────────────────────────┘
```

- Sfondo uniforme bianco (come il resto del layout)
- Titolo "Conversazioni" come unico header
- Pulsante "+" integrato nell'header della lista (solo Owner)
- Nessuna Card/bordo esterno, solo divisore verticale tra lista e messaggi
