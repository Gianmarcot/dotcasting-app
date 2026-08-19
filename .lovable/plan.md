# Due ingaggi di esempio per l'area talent

Al momento nessun ingaggio è pubblicato ai talent (0 righe), quindi la pagina "I miei casting" mostra sempre lo stato vuoto. Per vedere le schede e la pagina di dettaglio inserisco due ingaggi demo collegati al profilo Gianmarco Varetti.

## Cosa viene creato

1. **Spot TV — Brand di Moda (in programma)**
   - Convocazione: tra pochi giorni, ore 09:30
   - Location: studio di posa a Milano, con indirizzo completo (mappa visibile)
   - Istruzioni: cosa portare e a chi rivolgersi
   - Cliente visibile al talent: sì
   - Non ancora aperto dal talent, così si vede il badge "Nuovo"

2. **Cortometraggio indipendente (passato)**
   - Convocazione: circa tre settimane fa, ore 14:00
   - Location: location esterna a Torino con indirizzo
   - Istruzioni brevi
   - Cliente visibile al talent: no (per verificare il caso in cui il committente resta nascosto)
   - Già segnato come aperto

Per ciascuno viene creato il casting, un ruolo e la riga di ingaggio pubblicata al talent.

## Dettagli tecnici

- Inserimento dati (nessuna modifica di schema) in `castings`, `casting_roles`, `role_talents`.
- I due ingaggi sono associati a entrambi i profili chiamati "Gianmarco Varetti" presenti in database, così l'ingaggio appare qualunque sia l'account con cui si accede in preview.
- `role_talents.published_to_talent = true`, `published_at` valorizzato; `talent_opened_at` nullo sul primo (badge "Nuovo") e valorizzato sul secondo.
- `talent_status`/`company_status` impostati a `confirmed`.
- Dati chiaramente riconoscibili come demo, così sono facili da rimuovere dopo la verifica.
