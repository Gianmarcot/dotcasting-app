# Comunicazioni in stile chat (WhatsApp)

Trasformiamo la sezione "Comunicazioni" del talent da elenco di schede a conversazione in stile chat, mantenendo intatta tutta la logica attuale (notifiche automatiche, azioni, scadenze, lettura).

## Cosa cambia visivamente

- **Conversazione unica dall'alto verso il basso**: le comunicazioni si leggono in ordine cronologico crescente (le più vecchie in alto, le più recenti in basso) e la vista si apre già posizionata sull'ultima.
- **Bolle in arrivo**: ogni comunicazione diventa una bolla allineata a sinistra, su fondo bianco con angoli morbidi e un piccolo "becco" verso l'alto, come i messaggi ricevuti in una chat. Larghezza massima circa 75% su desktop, più ampia su mobile.
- **Separatori di data**: pillola centrata ("Oggi", "Ieri", "12 agosto") tra i gruppi di giorni diversi.
- **Contenuto della bolla**: icona del tipo di comunicazione + titolo in evidenza, testo completo sotto (senza troncamento a due righe, come in una chat), eventuali dettagli (periodo di disponibilità, materiale richiesto) e, in basso a destra, l'ora.
- **Non letto**: le bolle non lette hanno un bordo/sfondo leggermente accentuato e sopra il primo messaggio non letto compare il divisore "Non letti"; si segnano come lette allo scorrimento/apertura come oggi.
- **Azioni**: i pulsanti restano dentro la bolla, in fondo, e vanno a capo su schermi stretti. Le risposte già date compaiono come conferma inline ("Hai risposto: disponibile · 12 agosto, 15:40") con un doppio spunta.
- **Comunicazioni con scadenza**: bolla evidenziata con accento brand (rosso se scaduta) e riga "entro il …", finché non vengono evase.
- **Nessun campo di scrittura**: al posto del composer, in fondo resta una barra fissa discreta con la nota che le comunicazioni arrivano dall'agenzia e non sono modificabili, coerente col fatto che il talent non scrive.
- **Filtri**: "Tutte" / "Da leggere (n)" e "Segna tutte come lette" restano, spostati in una barra sticky in cima alla conversazione, in stile header chat.
- **Stato vuoto**: invariato nel tono, centrato nell'area conversazione.

## Nota

L'ordine si invertirà rispetto a oggi (ora il più recente è in alto): è la scelta coerente con una chat. Se preferisci mantenere il più recente in alto, si può fare, ma perde l'effetto conversazione.

## Dettagli tecnici

- `src/pages/talent/TalentCommunications.tsx`: ordinamento crescente per la vista chat, raggruppamento per giorno, header sticky con filtri, contenitore scrollabile con auto-scroll in fondo al primo caricamento, marker "Non letti".
- `src/components/communications/CommunicationCard.tsx`: riscritto come bolla chat (`ChatBubble`) — rimozione di `dc-card`/`line-clamp-2`, aggiunta di ora in basso, spunte per le risposte, stessi handler di lettura, upload, disponibilità e link (nessuna modifica a `useCommunications`, `useCommunicationSync`, `lib/communications.ts`).
- Riuso dei token esistenti (`--divider`, `bg-white`, `primary`, `destructive`) e delle utility `.dc-*`; nessun colore hardcoded fuori dai token già in uso nel progetto.
- Nessuna modifica al database, alle policy o al lato agenzia.
