## Test richiesto

Casting selezionato: **"Spot TV Brand di Moda"** → ruolo **"Modella 1"** (6 talent in shortlist, già usato in 4 round).

Password cliente: `supergiuly`.

## Passi del test

1. **Apertura casting** in preview e impostazione password cliente tramite il pannello "Password cliente" su un round (se non già impostata).
2. **Creazione nuovo invio** su "Modella 1" via "Nuovo invio" → wizard → condivisione (`status = shared`, ottenimento `share_token`).
3. **Apertura link pubblico** `/round/:token` in viewport mobile per verificare:
   - gallery visibile senza password
   - checkbox di selezione abilitate (round è il più recente, password impostata)
4. **Selezione**: confermo 2 talent su 6, lascio gli altri 4 deselezionati.
5. **Salvataggio** con password `supergiuly` → attesa toast di successo.
6. **Verifica stati** lato DB e UI:
   - I 2 selezionati → `role_talents.company_status = 'confirmed'`
   - I 4 deselezionati → `company_status = 'rejected'`
   - Refresh pagina owner: i badge/label sui talent del ruolo riflettono i nuovi stati.
7. **Test negativo rapido**: ritento il salvataggio con password errata → atteso errore "Password non corretta".

## Note

- Test non distruttivo per il casting: cambia solo `company_status` di 6 `role_talents` e crea un round in più (utente ha chiesto di lasciarlo in piedi).
- Nessuna modifica al codice prevista. Se emergono bug, mi fermo e li segnalo prima di proporre fix.

Approva per eseguire il test nella preview.