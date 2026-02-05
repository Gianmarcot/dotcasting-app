
Obiettivo
- Far comparire sempre il lightbox + pannello rating sopra qualunque modale (Radix Dialog) e renderlo realmente “a tutta pagina”, senza essere influenzato da overlay/z-index o da transform/animazioni dei contenitori.

Diagnosi (cosa sta succedendo davvero)
- La modale delle info utente è un Radix Dialog renderizzato in Portal (fuori dal normale albero DOM) con classi:
  - .dc-dialog-overlay { z-50 }
  - .dc-dialog { z-50 }
- Il lightbox oggi è renderizzato “normalmente” nel tree React (non in portal). Anche se ha z-[100], può comunque finire sotto (o sembrare sotto) la modale per due motivi frequenti:
  1) Un antenato del lightbox ha `transform` (es. `animate-fade-up` usa `transform: translateY(...)`): questo può cambiare il comportamento di `position: fixed` e creare un contesto di stacking che fa perdere la “priorità” rispetto a nodi portaled nel body.
  2) Il Dialog è in portal nel `<body>`: in pratica stai confrontando stacking context diversi; la soluzione più affidabile è portare anche il lightbox nello stesso “livello” (body) e dargli uno z-index sicuramente superiore.

Soluzione scelta (robusta)
- Portare MediaLightbox in un Portal su `document.body` tramite `createPortal`.
- Aumentare lo z-index del lightbox e del pannello rating a valori “sicuramente sopra” (es. 9999 e 10000), così non dipendiamo più da z-50 / z-100 e da possibili altri overlay.
- Questo risolve sia:
  - “si apre dietro la modale”
  - “lo vorrei a tutta pagina” (perché non sarà più vincolato da container con max-width/padding/transform)

Cosa cambierò (file e modifiche)
1) src/components/profile/MediaLightbox.tsx
   - Importare `createPortal` da `react-dom`.
   - Wrappare il markup del lightbox in `createPortal(..., document.body)`.
   - Aggiungere un guard per evitare errori in ambienti dove `document` non esiste (per sicurezza):
     - `if (typeof document === "undefined") return null;`
   - Aggiornare gli z-index:
     - container principale: da `z-[100]` a `z-[9999]`
     - pannello rating: da `z-[101]` a `z-[10000]`
   - Verificare che il layout resti full page con `fixed inset-0` (già presente) e che non ci siano limiti dovuti a parent.

2) (Opzionale ma consigliato) src/index.css
   - Non è strettamente necessario se facciamo portal + z-index alti, ma se dovessimo trovare altri overlay con z-index giganteschi, valuteremo di standardizzare (es. definire una “scala” z-index per overlay).
   - In prima battuta eviterei di toccarlo: portal + z-index alti dovrebbe bastare.

Criteri di accettazione (come verifichiamo che è risolto)
- Da /owner/talents:
  1) Apri un talento (si apre la modale info).
  2) Clicca su una foto/video della galleria.
  3) Il lightbox deve coprire tutto lo schermo.
  4) Il pannello rating (se owner) deve essere cliccabile e visibile sopra la modale (la modale può rimanere dietro, ma non deve coprire nulla del lightbox).
  5) Frecce del lightbox e frecce nel pannello rating devono continuare a funzionare.
  6) ESC chiude il lightbox e ripristina lo scroll della pagina.

Note tecniche / edge case previsti
- Il blocco scroll (`document.body.style.overflow = "hidden"`) continuerà a funzionare, ma ora il lightbox è portaled nel body: è esattamente il contesto giusto.
- Click “backdrop” per chiudere: resta invariato. Essendo sopra tutto, non deve più “passare” click alla modale sotto.
- Se in futuro aggiungiamo altri overlay (toast, drawer, ecc.), mantenere questa regola: overlay “globali” sempre in portal.

Sequenza di lavoro
1) Modifica MediaLightbox.tsx: portal + z-index.
2) Test manuale sul flusso OwnerTalents (e anche su TalentProfile se usa lo stesso lightbox).
3) Se persistesse ancora (improbabile): controlliamo eventuali elementi con z-index > 10000 e li normalizziamo.

Risultato finale atteso
- Il lightbox e l’interfaccia rating saranno sempre sopra la modale, a schermo pieno, senza comportamenti “a volte sotto/a volte sopra”.
