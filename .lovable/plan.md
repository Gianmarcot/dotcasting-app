

## Piano: Cornice da 8px, fixed e miglioramenti sidebar

### Obiettivo
1. Ridurre la cornice da 16px (p-4) a 8px (p-2)
2. Rendere la cornice fixed nella pagina
3. Rimuovere il bordo destro dalla sidebar
4. Aggiungere padding laterale al divisore orizzontale in basso nella sidebar

### Modifiche previste

**1. Layout (`OwnerLayout.tsx` e `TalentLayout.tsx`)**

Modificare il main wrapper per:
- Cambiare `p-4` in `p-2` (8px invece di 16px)
- Rendere il contenitore della cornice `fixed` con posizionamento corretto
- Aggiustare l'altezza da `calc(100vh-2rem)` a `calc(100vh-1rem)` per compensare il nuovo padding

```tsx
<main className="fixed top-0 right-0 bottom-0 left-64 p-2">
  <div className="h-full bg-background rounded-[3rem] overflow-hidden">
    <div className="h-full overflow-y-auto">
      <div className="p-8 pt-12 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  </div>
</main>
```

Punti chiave:
- `fixed top-0 right-0 bottom-0 left-64`: posizionamento fisso che inizia dopo la sidebar
- `p-2`: cornice di 8px
- `h-full` invece di `min-h-[calc(...)]`: occupa tutta l'altezza disponibile
- Aggiunto wrapper con `overflow-y-auto` per gestire lo scroll del contenuto interno

**2. Sidebar (`OwnerSidebar.tsx` e `TalentSidebar.tsx`)**

Rimuovere il bordo destro:
- Cambiare `border-r border-border` in nessun bordo (rimuovere completamente)

Aggiungere padding al divisore:
- Modificare il `div` della user section da `border-t border-border` a includere margine orizzontale: `mx-4 border-t border-border`
- Oppure usare un `Separator` component con padding

```tsx
{/* User section - prima */}
<div className="p-4 border-t border-border">

{/* User section - dopo */}
<div className="p-4">
  <div className="border-t border-border mx-2 -mt-4 mb-4" />
  ...
</div>
```

O più semplicemente applicando il bordo con un elemento separato che abbia margini.

### File coinvolti

| File | Azione |
|------|--------|
| `src/components/layout/OwnerLayout.tsx` | Cornice 8px + fixed |
| `src/components/layout/TalentLayout.tsx` | Cornice 8px + fixed |
| `src/components/layout/OwnerSidebar.tsx` | Rimuovere border-r + padding divisore |
| `src/components/layout/TalentSidebar.tsx` | Rimuovere border-r + padding divisore |

### Dettagli tecnici

**OwnerSidebar.tsx / TalentSidebar.tsx:**
```tsx
// Riga 42 (Owner) / Riga 37 (Talent) - rimuovere border-r
<aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card flex flex-col">

// Riga 79 (Owner) / Riga 72 (Talent) - divisore con padding
<div className="px-4 pt-4">
  <div className="border-t border-border" />
</div>
<div className="p-4 pt-3">
  ...contenuto user section...
</div>
```

### Risultato atteso

- Cornice più sottile (8px) attorno al contenuto
- Layout fixed che non scrolla con la pagina
- Sidebar senza bordo destro per un look più pulito
- Divisore orizzontale con margini laterali per non toccare i bordi

