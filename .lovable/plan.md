

## Piano: Navigazione Immagini dal Pannello Rating

### Panoramica

Aggiungere controlli di navigazione (precedente/successivo) direttamente nel pannello di rating laterale, permettendo all'Owner di spostarsi tra le immagini senza dover uscire dal pannello.

---

### Modifiche UI

#### Header del Pannello Rating

```text
┌────────────────────────────────────────┐
│  ◄  Immagine 3 di 12  ►               │
│────────────────────────────────────────│
│                                        │
│  ★ ★ ★ ★ ☆    Rating                  │
│                                        │
│  Tags:                                 │
│  [Fashion] [Portrait] [+ Aggiungi]    │
│                                        │
│  Note private:                         │
│  ┌──────────────────────────────────┐ │
│  │ Ottima luce naturale...          │ │
│  └──────────────────────────────────┘ │
│                                        │
│         [Salva valutazione]            │
└────────────────────────────────────────┘
```

---

### Modifiche Tecniche

#### File: `src/components/profile/MediaLightbox.tsx`

| Modifica | Descrizione |
|----------|-------------|
| Passare props di navigazione | Passare `currentIndex`, `totalCount`, `onPrevious`, `onNext` al `MediaRatingPanel` |

#### File: `src/components/media/MediaRatingPanel.tsx`

| Modifica | Descrizione |
|----------|-------------|
| Nuove props opzionali | `currentIndex?`, `totalCount?`, `onPrevious?`, `onNext?` |
| Header navigazione | Aggiungere riga con frecce e indicatore posizione |
| Icone | Usare `ChevronLeft` e `ChevronRight` di lucide-react |

---

### Dettagli Implementazione

**Nuove props per MediaRatingPanel:**

```typescript
interface MediaRatingPanelProps {
  mediaId: string;
  compact?: boolean;
  onSaved?: () => void;
  // Nuove props per navigazione
  currentIndex?: number;
  totalCount?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}
```

**UI Navigazione nel pannello:**

- Freccia sinistra: disabilitata se prima immagine (o loop circolare)
- Indicatore: "3 / 12"
- Freccia destra: disabilitata se ultima immagine (o loop circolare)
- Stesso comportamento delle frecce principali (navigazione circolare)

---

### File da Modificare

| File | Modifica |
|------|----------|
| `src/components/media/MediaRatingPanel.tsx` | Aggiungere header con navigazione |
| `src/components/profile/MediaLightbox.tsx` | Passare props navigazione al pannello |

---

### Risultato Atteso

1. L'Owner vede nell'header del pannello "Immagine X di Y" con frecce
2. Cliccando sulle frecce nel pannello, naviga tra le immagini
3. Il pannello di rating si aggiorna con i dati della nuova immagine
4. La navigazione funziona sia dal pannello che dalle frecce principali

