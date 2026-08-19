# Widget WhatsApp nella pagina Comunicazioni

## Premessa tecnica

WhatsApp non permette di incorporare la chat vera dentro un sito: non esiste un iframe/SDK ufficiale per la conversazione (solo WhatsApp Business API lato server, che è un canale separato e non mostra la chat dell'utente). Quello che si può fare — ed è lo standard usato da tutti — è un **widget flottante in basso a destra** che apre un piccolo pannello con un messaggio di benvenuto e un pulsante che porta alla chat reale su WhatsApp (app o WhatsApp Web) tramite link `wa.me`, con testo precompilato.

## Cosa aggiungiamo

- **Bottone flottante** in basso a destra della pagina Comunicazioni (sopra la barra "Le comunicazioni arrivano dall'agenzia"), icona WhatsApp, stile coerente col design system: pill/tondo, ombra morbida, colore brand bordeaux (non verde WhatsApp, per rispettare la palette).
- **Popup al click**: piccola card `dc-card` con
  - intestazione con nome agenzia e sottotitolo "Rispondiamo negli orari d'ufficio",
  - breve testo: scrivici per dubbi su ingaggi, materiali o disponibilità,
  - campo opzionale per un messaggio breve,
  - pulsante primario "Apri WhatsApp" che apre `https://wa.me/<numero>?text=<messaggio>` in una nuova scheda,
  - chiusura con X, click esterno ed Esc.
- **Numero**: preso dal telefono agenzia nelle impostazioni (stesso campo già usato nel dettaglio ingaggio). Se il numero non è impostato, il widget non compare (oggi il campo è vuoto: va compilato in Impostazioni agenzia perché il widget si veda).
- **Mobile**: il popup si apre a piena larghezza con margini, il bottone non copre la bottom nav.

## Note

- Nessuna modifica al database, alle policy o alla logica delle comunicazioni esistenti.
- Solo presentazione: la conversazione avviene su WhatsApp, non viene salvata nella piattaforma.

## Dettagli tecnici

- Nuovo componente `src/components/communications/WhatsAppFloatingChat.tsx`: usa `useAppSettings` per `contact_phone` e `agency_name`, sanifica il numero (`replace(/[^\d+]/g, "")`), stato locale aperto/chiuso, animazione `scale-fade-in` già presente in `tailwind.config.ts`.
- Montato in `src/pages/talent/TalentCommunications.tsx` in fondo al contenitore, `fixed bottom-24 right-4 md:bottom-6 md:right-6 z-30`, con `pointer-events-auto`.
- Riuso di `Button` (variant primary/secondary), `Textarea`, token `--divider`, classi `.dc-card`; nessun colore hardcoded fuori dai token.
