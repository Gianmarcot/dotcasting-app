

## Rimuovere la sezione Provini (Auditions)

### File da eliminare

| File | Descrizione |
|------|-------------|
| `src/pages/owner/OwnerAuditions.tsx` | Pagina provini Owner |
| `src/pages/talent/TalentAuditions.tsx` | Pagina provini Talent |
| `src/components/auditions/CreateAuditionDialog.tsx` | Dialog creazione provino |
| `src/components/auditions/SelectAuditionSlotDialog.tsx` | Dialog selezione slot |
| `src/components/auditions/SlotParticipants.tsx` | Lista partecipanti slot |
| `src/components/applications/AssignAuditionSlotDialog.tsx` | Dialog assegnazione slot da candidatura |
| `src/hooks/useAuditions.ts` | Hook dati provini |

### File da modificare

**`src/App.tsx`**
- Rimuovere import e route per `TalentAuditions` e `OwnerAuditions`

**`src/components/layout/TalentSidebar.tsx`**
- Rimuovere la voce "Provini" (`Calendar` icon, `/talent/auditions`) dal menu

**`src/components/layout/OwnerSidebar.tsx`**
- Rimuovere la voce "Programmazione Provini" (`Calendar` icon, `/owner/auditions`) dal menu

**`src/hooks/useDashboardStats.ts`**
- Rimuovere `upcomingAuditions` dalle stats e dalla query `audition_events`
- Rimuovere le attivita di tipo `audition` dalla `useRecentActivity`

**`src/pages/owner/OwnerDashboard.tsx`**
- Rimuovere la card statistica "Provini in programma"

**`src/pages/owner/OwnerApplications.tsx`**
- Rimuovere import e utilizzo di `AssignAuditionSlotDialog`
- Rimuovere la logica di assegnazione slot quando lo status diventa "booked"

**`src/lib/i18n.ts`**
- Rimuovere le stringhe relative ai provini (`auditions`, `auditionScheduling`, `upcomingAuditions`)

### Tabelle database

Le tabelle `audition_events`, `audition_slots`, `audition_bookings` restano nel database (nessuna migrazione distruttiva), ma non saranno piu referenziate dal codice.

