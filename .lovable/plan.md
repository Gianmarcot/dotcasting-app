

## Piano: Riorganizzazione Pagine Messaggistica a Schermo Intero

### Panoramica
Espandere le pagine di messaggistica (Owner e Talent) per occupare l'intera area disponibile, rimuovendo l'header con il titolo e riposizionando il pulsante "Nuovo messaggio" nella sidebar delle conversazioni.

---

### Modifiche Previste

#### 1. Strategia per Full-Width

Il layout attuale utilizza un wrapper con `max-w-7xl mx-auto` che limita la larghezza. Per la messaggistica, useremo una classe speciale che permette al contenuto di uscire da questo vincolo usando `w-[calc(100%+4rem)] -mx-8` (o margini negativi equivalenti).

Inoltre, rimuoveremo il padding verticale extra calcolando l'altezza come `h-[calc(100vh-2rem)]` per utilizzare quasi tutto lo spazio disponibile.

---

### 2. Modifiche UI

**Rimozione Header:**
- Eliminare completamente la sezione header con titolo "Centro messaggi" / "Messaggi"
- Eliminare il sottotitolo descrittivo

**Riposizionamento Pulsante Nuovo Messaggio (solo Owner):**
- Spostare il pulsante nella barra superiore della lista conversazioni
- Posizionarlo accanto al titolo "Conversazioni" con un layout flex

**Layout Risultante:**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │                    AREA MESSAGGI                              │
│ (Owner) ├───────────────────────────────────────────────────────────────┤
│         │ Conversazioni              [+]│                               │
│         │───────────────────────────────│     Seleziona una             │
│         │ 👤 Mario Rossi         14:32 │     conversazione              │
│         │    Fashion Week Milano       │                                │
│         │    Ultimo messaggio qui...   │     o iniziane una nuova       │
│         │───────────────────────────────│                               │
│         │ 👤 Laura Bianchi       Ieri  │                               │
│         │    Casting XYZ               │                               │
│         │    Grazie per la risposta... │                               │
│         │                              │                               │
│         │                              │                               │
│         │                              │                               │
│         │                              │                               │
│         │                              │                               │
└─────────┴──────────────────────────────┴────────────────────────────────┘
```

---

### 3. File da Modificare

| File | Modifiche |
|------|-----------|
| `src/pages/owner/OwnerMessages.tsx` | Rimuovere header, espandere layout, spostare pulsante nella sidebar conversazioni |
| `src/pages/talent/TalentMessages.tsx` | Rimuovere header, espandere layout |

---

### 4. Dettagli Tecnici

**OwnerMessages.tsx:**
- Rimuovere il div header (righe 61-71)
- Modificare il container principale per usare margini negativi e larghezza espansa
- Aggiungere il pulsante "+" nella barra header della lista thread
- Calcolare altezza dinamica per occupare tutto lo spazio

**TalentMessages.tsx:**
- Rimuovere il div header (righe 54-58)
- Applicare le stesse modifiche di layout per espansione full-width
- Mantenere l'empty state nella lista thread (gia' presente)

**Classi CSS chiave:**
```css
/* Espansione oltre max-width del layout padre */
w-[calc(100%+4rem)] -mx-8

/* Altezza piena (sottraendo solo il padding del layout) */
h-[calc(100vh-2rem)]
```

---

### Risultato Atteso

1. Pagina messaggistica che occupa l'intera larghezza disponibile
2. Nessun header/titolo visibile - design pulito stile chat
3. Pulsante "Nuovo messaggio" integrato nella sidebar (solo Owner)
4. Maggiore spazio verticale per la conversazione
5. Esperienza immersiva per la messaggistica

