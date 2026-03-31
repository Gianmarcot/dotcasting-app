

## Ottimizzazione Mobile dell'intera piattaforma

### Problema attuale

La piattaforma usa sidebar fisse a 256px (`w-64`) con `left-64` hardcoded sul main content. Non esiste alcun supporto mobile: su schermi piccoli la sidebar copre tutto e il contenuto e inaccessibile.

### Strategia

Sotto i 768px (breakpoint `md`):
- **Nascondere la sidebar laterale**
- **Mostrare una bottom navigation bar** con le voci principali (approccio mobile-native)
- **Aggiungere un header mobile** con logo, hamburger menu per le azioni secondarie (settings, logout)
- **Adattare padding e border-radius** del content area
- **Impilare le colonne** nelle pagine a griglia (profilo, dashboard)

### Modifiche dettagliate

#### 1. Creare `MobileBottomNav.tsx` (Talent)

Barra fissa in basso con 4 icone: Home, Profilo, Candidature, Messaggi. Visibile solo sotto `md`.

#### 2. Creare `MobileBottomNav.tsx` (Owner)  

Stessa logica ma con voci Owner: Dashboard, Talents, Castings, Messaggi. Le altre voci (Targets, Applications, Companies, Settings) accessibili tramite un menu "Altro" (griglia a icone).

#### 3. Creare `MobileHeader.tsx`

Header fisso in alto su mobile con: logo a sinistra, NotificationBell + avatar/menu hamburger a destra. Il menu hamburger apre un drawer con: nome utente, settings, logout.

#### 4. Aggiornare `TalentLayout.tsx`

```
- Sidebar: nascosta su mobile (classe md:block, hidden di default)
- Main: left-0 su mobile, left-64 da md in su
- Padding: p-4 su mobile, p-8 da md
- Border-radius: rounded-2xl su mobile, rounded-[3rem] da md
- Aggiungere MobileHeader + MobileBottomNav
- Aggiungere padding-bottom per la bottom nav
```

#### 5. Aggiornare `OwnerLayout.tsx`

Stessa logica del TalentLayout.

#### 6. Aggiornare `TalentSidebar.tsx` e `OwnerSidebar.tsx`

Aggiungere `hidden md:flex` per nascondere su mobile.

#### 7. Aggiornare CSS sidebar in `index.css`

```css
.dc-sidebar { @apply hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 bg-card flex-col; }
.dc-sidebar-admin { @apply hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 bg-[#1A1A1A] flex-col; }
```

Aggiungere classi per bottom nav e mobile header.

#### 8. Responsive su pagine contenuto

- **TalentProfile**: il `grid-cols-3` diventa singola colonna su mobile (gia presente con `grid-cols-1 lg:grid-cols-3`)
- **TalentDashboard**: le stat cards si impilano (gia `flex-col lg:flex-row`)
- **Casting cards**: gia responsive con `flex-col sm:flex-row`
- **Dialogs**: aggiungere `max-h-[90vh] overflow-y-auto` su mobile

### File da creare

| File | Descrizione |
|------|-------------|
| `src/components/layout/MobileHeader.tsx` | Header mobile con logo, notifiche, menu hamburger |
| `src/components/layout/MobileBottomNavTalent.tsx` | Bottom nav talent (4 voci) |
| `src/components/layout/MobileBottomNavOwner.tsx` | Bottom nav owner (5 voci con "Altro") |

### File da modificare

| File | Modifica |
|------|----------|
| `src/components/layout/TalentLayout.tsx` | Layout responsive + componenti mobile |
| `src/components/layout/OwnerLayout.tsx` | Layout responsive + componenti mobile |
| `src/components/layout/TalentSidebar.tsx` | `hidden md:flex` |
| `src/components/layout/OwnerSidebar.tsx` | `hidden md:flex` |
| `src/index.css` | Classi sidebar aggiornate + classi mobile nav |

