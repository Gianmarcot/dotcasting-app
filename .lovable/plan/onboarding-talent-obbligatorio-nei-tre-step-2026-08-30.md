# Onboarding talent obbligatorio nei tre step

Oggi solo il primo step blocca l'avanzamento: i ruoli e la foto profilo sono saltabili e c'è il link "Completa dopo". Inoltre il profilo viene marcato come onboarding completato già al salvataggio del primo step, quindi chi esce a metà non torna più nel flusso.

## Cosa cambia

1. **Step 1 — Info di base**: resta come oggi (tutti i campi già validati, pulsante disabilitato finché non è valido). Nessuna modifica funzionale.
2. **Step 2 — I tuoi ruoli**: "Avanti" disabilitato finché non è selezionato almeno un ruolo. Sotto le pill compare un messaggio di aiuto ("Seleziona almeno un ruolo") quando l'utente prova a procedere.
3. **Step 3 — Immagine profilo**: "Iniziamo" disabilitato finché non è stata caricata una foto (o è già presente una foto profilo). Messaggio di errore coerente con quelli già usati nello step.
4. **Rimozione della via d'uscita**: il link "Completa dopo" nel footer sparisce del tutto, insieme alla relativa logica di salvataggio parziale.
5. **Completamento a fine flusso**: il flag di onboarding completato viene scritto solo al termine dello step 3, non più al primo step. Chi abbandona e rientra riprende l'onboarding invece di finire nel profilo con dati incompleti.
6. **Uscita**: il pulsante "Esci" continua a funzionare, ma esegue sempre il logout con conferma (dati non salvati persi), dato che non esiste più un profilo "parzialmente completato" da visitare.

## Note tecniche

- `src/pages/talent/TalentOnboarding.tsx`: passare `nextDisabled` calcolato per step (step 2 → `roles.length > 0`; step 3 → `photoFile || profile?.profile_photo_url`); spostare `onboarding_completed: true` da `saveBasic` a `savePhoto`/`goNext` finale; rimuovere `handleLater`; aggiornare `leave()` perché rimandi sempre al logout finché l'onboarding non è completo.
- `src/components/onboarding/OnboardingChrome.tsx`: `OnboardingFooter` senza la prop `onLater` (o rimosso dal render se resta vuoto).
- `src/components/onboarding/steps/RolesStep.tsx` e `PhotoStep.tsx`: aggiunta del messaggio di errore/aiuto; nessun cambio di stile.
- Nessuna migrazione, nessuna modifica a RLS o allo schema.
