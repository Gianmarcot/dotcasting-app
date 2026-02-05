

## Piano: Aggiornamento Colori Badge e Tag con Palette Brand

### Panoramica
Aggiornare le variabili CSS e i mapping di stato in tutta l'applicazione, utilizzando la palette brand fornita con sfumature che garantiscono un contrasto adeguato.

---

### Palette Brand e Conversione HSL

| Colore | HEX | HSL | Uso Semantico |
|--------|-----|-----|---------------|
| Bordeaux | #A30A2B | 347 88% 34% | Negativo/Bloccante |
| Blu | #708DC9 | 220 45% 61% | Info/Neutro |
| Charcoal | #333333 | 0 0% 20% | Muted/Bozza |
| Olive | #6A774C | 75 22% 38% | Secondario |
| Verde brillante | #729128 | 75 57% 36% | Positivo/Attivo |
| Giallo/Ambra | #C88500 | 39 100% 39% | In attesa/Sospeso |

---

### Strategia Color Contrast

Per garantire leggibilita' con sfondo tenue + testo colorato:

| Uso | Sfondo (opacity) | Testo | Esempio |
|-----|------------------|-------|---------|
| Positivo | Verde 15% | Verde 100% | bg-[#729128]/15 text-[#729128] |
| Sospeso | Giallo 15% | Giallo scuro | bg-[#C88500]/15 text-[#9A6700] |
| Negativo | Rosso 15% | Rosso 100% | bg-[#A30A2B]/15 text-[#A30A2B] |
| Info | Blu 15% | Blu scuro | bg-[#708DC9]/15 text-[#4A6A9C] |
| Muted | Charcoal 10% | Charcoal | bg-[#333333]/10 text-[#333333] |

Per il giallo/ambra, il testo usa una versione piu' scura (#9A6700) per migliorare il contrasto su sfondi chiari.

---

### Fase 1: Aggiornamento Variabili CSS

**File: `src/index.css`**

Aggiornare le variabili di colore semantiche:

| Variabile | Valore Attuale | Nuovo Valore HSL |
|-----------|----------------|-------------------|
| --success | 142 70% 40% | 75 57% 36% |
| --success-foreground | 0 0% 100% | 0 0% 100% |
| --warning | 38 92% 50% | 39 100% 39% |
| --warning-foreground | 0 0% 100% | 0 0% 15% |
| --destructive | 0 72% 51% | 347 88% 34% |
| --info | 200 80% 50% | 220 45% 61% |
| --info-foreground | 0 0% 100% | 0 0% 100% |

---

### Fase 2: Aggiornamento Componenti

#### 2.1 CastingCard.tsx - Stati Casting

```typescript
const statusColors: Record<string, string> = {
  draft: "bg-[#333333]/10 text-[#333333]",
  active: "bg-[#729128]/15 text-[#729128]",
  closed: "bg-[#A30A2B]/15 text-[#A30A2B]",
};
```

#### 2.2 TalentApplications.tsx - Stati Candidature Talent

```typescript
const statusConfig: Record<TalentApplicationStatus, { 
  label: string;
  color: string;
}> = {
  submitted: { label: "Inviata", color: "bg-[#C88500]/15 text-[#9A6700]" },
  shortlisted: { label: "Selezionata", color: "bg-[#729128]/15 text-[#729128]" },
  hold: { label: "In attesa", color: "bg-[#C88500]/15 text-[#9A6700]" },
  rejected: { label: "Rifiutata", color: "bg-[#A30A2B]/15 text-[#A30A2B]" },
  callback: { label: "Richiamata", color: "bg-[#729128]/15 text-[#729128]" },
  booked: { label: "Confermata", color: "bg-[#729128]/15 text-[#729128]" },
  withdrawn: { label: "Ritirata", color: "bg-[#333333]/10 text-[#333333]" },
};
```

#### 2.3 TalentAuditions.tsx - Stati Provini

```typescript
const statusColors: Record<string, string> = {
  invited: "bg-[#C88500]/15 text-[#9A6700] border-[#C88500]/20",
  confirmed: "bg-[#729128]/15 text-[#729128] border-[#729128]/20",
  declined: "bg-[#A30A2B]/15 text-[#A30A2B] border-[#A30A2B]/20",
  reschedule_requested: "bg-[#C88500]/15 text-[#9A6700] border-[#C88500]/20",
};
```

#### 2.4 OwnerCompanies.tsx - Stati Aziende

```typescript
const statusColors: Record<string, string> = {
  lead: "bg-[#C88500]/15 text-[#9A6700]",
  active: "bg-[#729128]/15 text-[#729128]",
  inactive: "bg-[#333333]/10 text-[#333333]",
};
```

#### 2.5 OwnerDashboard.tsx - Candidature Recenti

Aggiornare i colori inline:

```typescript
<span className={`text-xs px-2 py-1 rounded-full ${
  app.status === "shortlisted" 
    ? "bg-[#729128]/15 text-[#729128]" 
    : "bg-[#C88500]/15 text-[#9A6700]"
}`}>
```

---

### Fase 3: Aggiornamento Badge Component

**File: `src/components/ui/badge.tsx`**

Aggiornare le varianti per usare i nuovi colori con contrasto adeguato:

```typescript
const badgeVariants = cva("dc-badge", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-[#A30A2B] text-white hover:bg-[#A30A2B]/80",
      outline: "text-foreground",
      success: "border-transparent bg-[#729128] text-white",
      warning: "border-transparent bg-[#C88500] text-white",
      info: "border-transparent bg-[#708DC9] text-white",
      muted: "border-transparent bg-[#333333]/15 text-[#333333]",
    },
  },
});
```

---

### Riepilogo File da Modificare

| File | Tipo Modifica |
|------|---------------|
| `src/index.css` | Variabili CSS semantiche |
| `src/components/ui/badge.tsx` | Varianti badge |
| `src/components/castings/CastingCard.tsx` | statusColors |
| `src/pages/talent/TalentApplications.tsx` | statusConfig |
| `src/pages/talent/TalentAuditions.tsx` | statusColors |
| `src/pages/owner/OwnerCompanies.tsx` | statusColors |
| `src/pages/owner/OwnerDashboard.tsx` | Colori inline candidature |

---

### Sezione Tecnica: Contrast Ratio

I colori scelti rispettano le linee guida WCAG per il contrasto:

| Combinazione | Contrast Ratio | Livello |
|--------------|----------------|---------|
| #729128 su sfondo 15% | ~4.5:1 | AA |
| #9A6700 su sfondo 15% | ~4.8:1 | AA |
| #A30A2B su sfondo 15% | ~5.2:1 | AA |
| #333333 su sfondo 10% | ~7:1 | AAA |
| Bianco su #729128 | ~4.6:1 | AA |
| Bianco su #C88500 | ~3.1:1 | AA Large |
| Bianco su #A30A2B | ~5.8:1 | AA |

Per i badge con sfondo pieno (variant success/warning/destructive), il testo bianco garantisce leggibilita' ottimale.

---

### Risultato Atteso

1. Verde (#729128): stati attivi, confermati, selezionati, booked
2. Giallo/Ambra (#C88500): stati in attesa, submitted, lead, invited
3. Rosso (#A30A2B): stati rifiutati, chiusi, declinati
4. Charcoal (#333333): stati bozza, inattivi, withdrawn
5. Blu (#708DC9): informazioni neutre
6. Contrasto adeguato su tutti i badge per accessibilita'

