

## Piano: Progress Bar Completamento Profilo

### Obiettivo
Aggiungere una sezione interattiva in cima al profilo talent che mostri il livello di completamento con:
- Barra di progresso visuale con percentuale
- Emoji dinamica in base al livello
- Frase simpatica contestuale
- Suggerimenti su sezioni mancanti
- Toggle per nascondere i suggerimenti

### Design (ispirato allo screenshot di riferimento)

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│  Forza del Profilo: 7/10  ████████████████░░░░░ 😊        🔗 Nascondi suggerimenti │
│                                                                                │
│  Sei sulla buona strada! Aggiungi ancora qualche dettaglio per brillare.      │
│                                                                                │
│  [+ Foto] [+ Misure] [+ Video] [+ Lingue]                                     │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Sistema di calcolo completezza

Definisco una lista di "check" pesati per calcolare la percentuale:

| Campo/Sezione | Peso | Descrizione |
|---------------|------|-------------|
| Foto profilo | 15 | `profile_photo_url` presente |
| Nome completo | 10 | `first_name` + `last_name` |
| Bio | 10 | `bio` con almeno 50 caratteri |
| Ruoli/Talenti | 10 | `talent_categories` con almeno 1 elemento |
| Altezza/Peso | 5 | `height` o `weight` presenti |
| Misure corporee | 10 | Almeno 3 misure (chest, waist, hips, etc.) |
| Colore capelli/occhi | 5 | `hair_color` + `eye_color` |
| Lingue | 5 | `languages` con almeno 1 elemento |
| Skills | 5 | `skills` con almeno 1 elemento |
| Media (foto/video) | 15 | Almeno 3 media nella galleria |
| Contatti | 5 | `phone_number` o `whatsapp_number` presente |
| Indirizzo | 5 | `city` + `country` presenti |

**Totale: 100 punti**

### Livelli ed Emoji

| Percentuale | Emoji | Frase |
|-------------|-------|-------|
| 0-19% | 😴 | "Il tuo profilo sta ancora dormendo... sveglialo!" |
| 20-39% | 😐 | "Ci stai lavorando, ma c'è ancora strada da fare!" |
| 40-59% | 🙂 | "Sei sulla buona strada! Continua così." |
| 60-79% | 😊 | "Ottimo lavoro! Aggiungi ancora qualche dettaglio per brillare." |
| 80-94% | 🤩 | "Quasi perfetto! Manca pochissimo alla vetta!" |
| 95-100% | 🌟 | "Profilo da star! Sei pronto per essere scoperto!" |

### Suggerimenti dinamici

Mostro pulsanti per le sezioni mancanti con scroll alla sezione corrispondente:

```javascript
const missingSections = [
  { key: 'photo', label: 'Foto profilo', anchor: 'profile-photo' },
  { key: 'bio', label: 'Biografia', anchor: 'about-me' },
  { key: 'roles', label: 'Ruoli', anchor: 'talent-roles' },
  { key: 'media', label: 'Galleria Media', anchor: 'media-gallery' },
  { key: 'measurements', label: 'Misure', anchor: 'measurements' },
  { key: 'languages', label: 'Lingue', anchor: 'languages' },
  { key: 'skills', label: 'Competenze', anchor: 'skills' },
  { key: 'contact', label: 'Contatti', anchor: 'contact-info' },
];
```

### File da creare/modificare

| File | Azione |
|------|--------|
| `src/hooks/useProfileCompletion.ts` | NUOVO - Hook per calcolare completezza |
| `src/components/profile/ProfileCompletionBar.tsx` | NUOVO - Componente progress bar |
| `src/pages/talent/TalentProfile.tsx` | Aggiungere ProfileCompletionBar + id alle sezioni |
| `src/lib/i18n.ts` | Aggiungere traduzioni per i messaggi |

### Implementazione hook `useProfileCompletion`

```typescript
// Esempio struttura
interface ProfileCompletionResult {
  percentage: number;
  score: number;
  maxScore: number;
  emoji: string;
  message: string;
  missingSections: Array<{
    key: string;
    label: string;
    anchor: string;
  }>;
}
```

L'hook combina i dati da:
- `useProfile()` - dati profilo base
- `useTalentAttributes()` - attributi fisici
- `useTalentMedia()` - media nella galleria

### Componente `ProfileCompletionBar`

Caratteristiche:
- Card con sfondo leggero e bordo accent
- Progress bar con animazione smooth
- Emoji posizionata sopra la barra (come nello screenshot)
- Toggle "Nascondi suggerimenti" con icona
- Pulsanti suggerimento che scrollano alla sezione
- Stato persistito in localStorage per nascondere

### Stile CSS

Uso le classi centralizzate `dc-*` esistenti + nuove:

```css
.dc-progress-bar {
  @apply relative h-3 w-full overflow-hidden rounded-full bg-muted;
}

.dc-progress-indicator {
  @apply h-full bg-primary transition-all duration-500 ease-out;
}

.dc-completion-card {
  @apply dc-card bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20;
}

.dc-suggestion-chip {
  @apply dc-btn-outline text-sm px-3 py-1 h-auto;
}
```

### Interazioni

1. **Click su suggerimento**: Scroll smooth alla sezione corrispondente
2. **Toggle suggerimenti**: Nasconde/mostra area suggerimenti, salva preferenza in localStorage
3. **Aggiornamento real-time**: Si aggiorna automaticamente quando i dati cambiano (tramite React Query)

### Risultato atteso

- Progress bar visibile in cima alla pagina profilo
- Feedback immediato sul livello di completamento
- Suggerimenti actionable per guidare l'utente
- Esperienza gamificata con emoji e frasi motivazionali
- Persistenza preferenza "nascondi suggerimenti"

