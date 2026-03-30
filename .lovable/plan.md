

## Fix pulsante "Completa dopo"

### Problema

Il pulsante "Completa dopo" esegue solo `navigate("/talent")`, ma il `TalentLayout` controlla `onboarding_completed` nel database: se è `false`, reindirizza all'onboarding, creando un loop infinito.

### Soluzione

Nel click handler di "Completa dopo", aggiornare `onboarding_completed = true` nel database prima di navigare.

### Modifica

**File: `src/pages/talent/TalentOnboarding.tsx`** (riga 436)

Sostituire:
```tsx
onClick={() => navigate("/talent")}
```

Con una funzione async che:
1. Chiama `supabase.from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id)`
2. Se l'update ha successo, esegue `navigate("/talent")`
3. In caso di errore, mostra un toast di errore

Il componente già importa `supabase` e ha accesso a `user` dal contesto auth (da verificare, ma le importazioni necessarie sono minime).

### File da modificare

| File | Modifica |
|------|----------|
| `src/pages/talent/TalentOnboarding.tsx` | Handler async per "Completa dopo" con update DB |

