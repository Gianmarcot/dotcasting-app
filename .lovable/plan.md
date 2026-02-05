

## Piano: Aggiornamento Stile Admin con Logo Bianco

### Panoramica
Applicare lo sfondo beige scuro alla cornice e sidebar admin, e utilizzare la versione bianca/crema del logo dotCasting.

---

### Fase 1: Copiare il Logo Bianco nel Progetto

**Azione**: Copiare il file caricato dall'utente nella cartella assets

| Origine | Destinazione |
|---------|--------------|
| `user-uploads://dotCasting_logo_creme@HD.png` | `src/assets/logo-white.png` |

---

### Fase 2: Aggiornamento Variabili CSS

**File: `src/index.css`**

Aggiungere variabili specifiche per l'area admin:

| Variabile | Valore HSL | HEX Equivalente |
|-----------|------------|-----------------|
| `--admin-bg` | 35 20% 88% | #E8DFD4 |
| `--admin-content-bg` | 0 0% 100% | #FFFFFF |

Aggiungere classe specifica per sidebar admin scura.

---

### Fase 3: Aggiornamento OwnerLayout

**File: `src/components/layout/OwnerLayout.tsx`**

| Elemento | Prima | Dopo |
|----------|-------|------|
| Container esterno | `bg-card` | `bg-[#E8DFD4]` |
| Area contenuto | `bg-background` | `bg-white` |

---

### Fase 4: Aggiornamento OwnerSidebar

**File: `src/components/layout/OwnerSidebar.tsx`**

1. Importare il nuovo logo bianco invece del logo standard
2. Aggiornare la classe sidebar per usare sfondo scuro
3. Adattare i colori testo e icone per visibilita' su sfondo scuro

| Elemento | Prima | Dopo |
|----------|-------|------|
| Import logo | `logo.png` | `logo-white.png` |
| Classe sidebar | `dc-sidebar` | `dc-sidebar-admin` |
| Colore testo nav | `text-muted-foreground` | `text-[#333333]/70` |
| Colore testo user | `text-foreground` | `text-[#333333]` |

---

### Fase 5: Nuove Classi CSS Admin

**File: `src/index.css`**

```css
.dc-sidebar-admin {
  @apply fixed left-0 top-0 z-40 h-screen w-64 bg-[#E8DFD4] flex flex-col;
}

.dc-sidebar-admin-nav-item-inactive {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium 
         text-[#333333]/70 hover:bg-[#333333]/10 hover:text-[#333333] 
         transition-all duration-200;
}

.dc-sidebar-admin-nav-item-active {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium 
         bg-primary text-primary-foreground transition-all duration-200;
}

.dc-sidebar-admin-action {
  @apply flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
         text-[#333333]/70 hover:bg-[#333333]/10 hover:text-[#333333] 
         transition-colors w-full text-left;
}

.dc-sidebar-admin-divider {
  @apply border-t border-[#333333]/20 mx-2 -mt-4 mb-4;
}
```

---

### Riepilogo File da Modificare

| File | Modifica |
|------|----------|
| `src/assets/logo-white.png` | Nuovo file (copia da upload) |
| `src/index.css` | Variabili CSS admin + classi sidebar-admin |
| `src/components/layout/OwnerLayout.tsx` | Sfondo cornice e contenuto |
| `src/components/layout/OwnerSidebar.tsx` | Logo bianco + classi admin |

---

### Sezione Tecnica

#### Struttura OwnerLayout Finale

```tsx
<div className="min-h-screen bg-[#E8DFD4]">
  <OwnerSidebar />
  <main className="fixed top-0 right-0 bottom-0 left-64 p-2">
    <div className="h-full bg-white rounded-[3rem] overflow-hidden">
      {/* contenuto */}
    </div>
  </main>
</div>
```

#### Import Logo in OwnerSidebar

```tsx
import logoWhite from "@/assets/logo-white.png";
// ...
<img src={logoWhite} alt="dotCasting" className="h-7" />
```

#### Classi Sidebar Admin

La sidebar admin usa colori che garantiscono contrasto su sfondo beige scuro:
- Testo inattivo: `#333333` al 70% opacita'
- Hover: sfondo `#333333` al 10% opacita'
- Stato attivo: mantiene `bg-primary text-primary-foreground` (bordeaux)

---

### Risultato Atteso

1. Sidebar e cornice admin con sfondo beige scuro (#E8DFD4)
2. Area contenuto bianca (#FFFFFF) con angoli arrotondati
3. Logo bianco/crema visibile su sfondo scuro
4. Navigazione leggibile con buon contrasto
5. Coerenza visiva con l'immagine di riferimento

