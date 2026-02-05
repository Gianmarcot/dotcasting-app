

## Piano: Cornice arrotondata attorno al contenuto principale

### Obiettivo
Creare una cornice bianca sottile attorno all'area del contenuto principale, mantenendo la sidebar al di fuori. La cornice avrà un border-radius di 3rem e overflow hidden, come mostrato nell'immagine di riferimento.

### Design

```text
┌─────────┬────────────────────────────────────────────┐
│         │ ┌────────────────────────────────────────┐ │
│         │ │                                        │ │
│ SIDEBAR │ │     CONTENUTO (con sfondo beige)       │ │
│ (bianco)│ │                                        │ │
│         │ │                                        │ │
│         │ └────────────────────────────────────────┘ │
└─────────┴────────────────────────────────────────────┘
           └──────── cornice bianca ────────┘
```

La struttura prevede:
- La sidebar rimane invariata (bianca, fixed a sinistra)
- L'area principale ha una "cornice" bianca che la circonda
- Il contenuto interno ha il solito sfondo beige con angoli arrotondati

### Approccio tecnico

L'idea è di aggiungere un wrapper attorno al contenuto principale con:
- Sfondo bianco (come la sidebar)
- Padding per creare lo spazio della cornice
- Un contenitore interno con `rounded-[3rem]` e `overflow-hidden`
- Il contenuto interno mantiene il colore di sfondo `bg-background`

### Modifiche previste

**1. `src/components/layout/OwnerLayout.tsx`**

Modificare la struttura del main:

```tsx
<main className="ml-64 min-h-screen bg-white p-4">
  <div className="min-h-[calc(100vh-2rem)] bg-background rounded-[3rem] overflow-hidden">
    <div className="p-8 pt-12 max-w-7xl mx-auto">
      <Outlet />
    </div>
  </div>
</main>
```

Punti chiave:
- `ml-64`: mantiene lo spazio per la sidebar
- `bg-white`: sfondo bianco per la cornice
- `p-4`: padding che crea lo spessore della cornice (circa 1rem su tutti i lati)
- Wrapper interno con `rounded-[3rem]` per gli angoli arrotondati
- `overflow-hidden` per nascondere contenuti che escono dai bordi arrotondati
- `min-h-[calc(100vh-2rem)]`: altezza minima per occupare lo schermo meno il padding

**2. `src/components/layout/TalentLayout.tsx`**

Stessa modifica per mantenere coerenza tra i due layout:

```tsx
<main className="ml-64 min-h-screen bg-white p-4">
  <div className="min-h-[calc(100vh-2rem)] bg-background rounded-[3rem] overflow-hidden">
    <div className="p-8 pt-12 max-w-7xl mx-auto">
      <Outlet />
    </div>
  </div>
</main>
```

### File coinvolti

| File | Azione |
|------|--------|
| `src/components/layout/OwnerLayout.tsx` | Aggiungere wrapper con cornice |
| `src/components/layout/TalentLayout.tsx` | Aggiungere wrapper con cornice |

### Risultato atteso

- Effetto visivo elegante con la cornice bianca che incornicia il contenuto
- La sidebar resta fuori dalla cornice, mantenendo il design pulito
- Angoli arrotondati (3rem) danno un aspetto moderno e morbido
- Il layout è coerente sia per Owner che per Talent

