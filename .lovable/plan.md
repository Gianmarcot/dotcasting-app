

## Piano: Sfondo Sidebar Admin Scuro (#1A1A1A) con Testi Bianchi

### Panoramica
Aggiornare lo sfondo della sidebar admin da beige (#E8DFD4) a nero/grigio scuro (#1A1A1A) con testi e icone in bianco per garantire visibilita' e contrasto.

---

### Modifiche Richieste

#### File: `src/index.css`

Aggiornare tutte le classi `.dc-sidebar-admin-*`:

| Classe | Proprieta' | Valore Attuale | Nuovo Valore |
|--------|-----------|----------------|--------------|
| `.dc-sidebar-admin` | background | `#E8DFD4` | `#1A1A1A` |
| `.dc-sidebar-admin-nav-item-inactive` | text | `#333333/70` | `white/70` |
| `.dc-sidebar-admin-nav-item-inactive` | hover:bg | `#333333/10` | `white/10` |
| `.dc-sidebar-admin-nav-item-inactive` | hover:text | `#333333` | `white` |
| `.dc-sidebar-admin-action` | text | `#333333/70` | `white/70` |
| `.dc-sidebar-admin-action` | hover:bg | `#333333/10` | `white/10` |
| `.dc-sidebar-admin-action` | hover:text | `#333333` | `white` |
| `.dc-sidebar-admin-divider` | border | `#333333/20` | `white/20` |

---

#### File: `src/components/layout/OwnerSidebar.tsx`

Aggiornare il colore del testo utente:

| Elemento | Valore Attuale | Nuovo Valore |
|----------|----------------|--------------|
| Nome utente | `text-[#333333]` | `text-white` |

---

### Codice CSS Aggiornato

```css
.dc-sidebar-admin {
  @apply fixed left-0 top-0 z-40 h-screen w-64 bg-[#1A1A1A] flex flex-col;
}

.dc-sidebar-admin-nav-item-inactive {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium 
         text-white/70 hover:bg-white/10 hover:text-white 
         transition-all duration-200;
}

.dc-sidebar-admin-nav-item-active {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium 
         bg-primary text-primary-foreground transition-all duration-200;
}

.dc-sidebar-admin-action {
  @apply flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
         text-white/70 hover:bg-white/10 hover:text-white 
         transition-colors w-full text-left;
}

.dc-sidebar-admin-divider {
  @apply border-t border-white/20 mx-2 -mt-4 mb-4;
}

.dc-sidebar-admin-user {
  @apply flex items-center gap-3 mb-3 px-2;
}
```

---

### File da Modificare

| File | Modifica |
|------|----------|
| `src/index.css` | Classi sidebar admin (sfondo scuro + testi bianchi) |
| `src/components/layout/OwnerSidebar.tsx` | Colore testo utente |

---

### Risultato Atteso

1. Sidebar admin con sfondo nero/grigio scuro (#1A1A1A)
2. Testi e icone in bianco con opacita' 70% per stato inattivo
3. Hover con sfondo bianco al 10% e testo bianco pieno
4. Logo bianco/crema ben visibile su sfondo scuro
5. Contrasto ottimale per accessibilita'

