
## Aggiungere un link "Torna alla home" nell'onboarding

### Modifica

**File: `src/pages/talent/TalentOnboarding.tsx`** (righe 432-441)

Aggiungere un secondo link sotto il pulsante "Completa dopo" che riporti alla home page (`/`):

```
Completa dopo
Torna alla home
```

Entrambi i link saranno nella sezione finale, con lo stesso stile testuale discreto. Il link "Torna alla home" usera `navigate("/")` per tornare alla landing page.

### Dettaglio

- Aggiungere un separatore visivo (punto mediano `·`) tra i due link, disposti in riga
- Stile coerente: `text-sm text-muted-foreground hover:text-foreground`
- Nessuna modifica al database o ad altri file
