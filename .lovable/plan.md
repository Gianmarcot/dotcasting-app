

## Aggiornare Dashboard Talent e Gestione Casting con Feature Flag

### Panoramica

1. **Dashboard talent**: ridisegnare completamente con sezioni dedicate — inviti in attesa, completamento profilo reale con campi mancanti, prossimi casting confermati, messaggi recenti.
2. **Feature flag**: nascondere (senza eliminare) l'esplorazione casting e la candidatura autonoma, lasciando solo i casting su invito.

### Modifiche dettagliate

#### 1. Feature flag — `src/lib/featureFlags.ts` (nuovo file)

```typescript
export const FEATURE_FLAGS = {
  TALENT_EXPLORE_CASTINGS: false, // true per riabilitare esplorazione e candidatura autonoma
};
```

#### 2. Dashboard Talent — `src/pages/talent/TalentDashboard.tsx` (riscrivere)

Rimuovere l'intera sezione di esplorazione casting (search bar + listing + ApplyToCastingDialog + CastingDetailDialog). Questi componenti restano nel codebase ma non vengono importati/renderizzati quando il flag è `false`.

Nuova struttura della pagina:

**a) Header di benvenuto** — Nome utente dal profilo (first_name) con saluto.

**b) Inviti in attesa** — Riutilizzare `TalentInvitationsSection` (già presente, mostra inviti pending con accept/decline).

**c) Completamento profilo** — Card con:
- Percentuale reale da `useProfileCompletion()` (già implementato con checks pesati)
- Barra di progresso visuale (`Progress` component)
- Emoji + messaggio contestuale (già nel hook)
- Elenco specifico dei campi mancanti (`missingSections`) con label
- Link diretto a `/talent/profile` per completare

**d) Prossimi casting confermati** — Query delle applications con `status = 'booked'` ordinate per `start_date` del casting. Mostrare titolo, azienda, date. Se nessuno, messaggio "Nessun casting confermato".

**e) Messaggi recenti** — Ultimi 3 thread con messaggio più recente, usando `useMessages` hook. Mostrare nome interlocutore, anteprima body, data. Link a `/talent/messages`.

**f) Esplorazione casting (condizionale)** — Wrappare tutta la sezione esplorazione in `{FEATURE_FLAGS.TALENT_EXPLORE_CASTINGS && (...)}`. Quando il flag è `false`, non viene renderizzata.

#### 3. Sidebar e Bottom Nav — Aggiornare link "I miei Casting"

In `TalentSidebar.tsx` e `MobileBottomNavTalent.tsx`:
- Quando `TALENT_EXPLORE_CASTINGS` è `false`, rinominare "I miei Casting" in "I miei Casting" ma puntare sempre a `/talent/applications` (invariato)
- La pagina TalentApplications continua a mostrare le candidature (create automaticamente da inviti accettati)

#### 4. TalentApplications — Nessuna modifica

La pagina resta invariata: mostra le candidature attive/ritirate. Quando il flag è off, le candidature arrivano solo da inviti accettati.

### File da creare

| File | Descrizione |
|------|-------------|
| `src/lib/featureFlags.ts` | Feature flags centralizzati |

### File da modificare

| File | Modifica |
|------|----------|
| `src/pages/talent/TalentDashboard.tsx` | Riscrivere con nuove sezioni: profilo completion reale, casting confermati, messaggi recenti, flag per esplorazione |
| `src/components/layout/TalentSidebar.tsx` | Condizionare voce nav in base a feature flag |
| `src/components/layout/MobileBottomNavTalent.tsx` | Condizionare voce nav in base a feature flag |

