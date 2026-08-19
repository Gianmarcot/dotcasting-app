# Comunicazioni: nuovo design talent + impostazioni testi

Buona parte della struttura esiste già (feed unico lato talent, sync automatico, chat agenzia con azioni allegate e invio multiplo). Questo intervento allinea la resa grafica al Figma e aggiunge il controllo dei testi in impostazioni. La sidebar non viene toccata (voce già "Comunicazioni", notifiche già confluite).

## 1. Sezione Comunicazioni (area talent) — nuova resa

- Pannello contenuto con fondo #f4f0ec e angoli 48px, intestazione fissa alta 126px: titolo "COMUNICAZIONI" (Tenor Sans 21px maiuscolo) a sinistra, pulsante "Scrivici su WhatsApp" a destra (48px, fondo verde #40a961, pill, icona 24px + label DM Sans Medium 15px bianco). Su schermo stretto il pulsante resta solo icona.
- Sotto l'intestazione una sfumatura di 96px dal colore pannello al trasparente, così i messaggi sfumano scorrendo sotto.
- Flusso cronologico crescente con apertura in fondo (già così), separatori giorno come pill bianche 12/6px, testo DM Sans Medium 15px, etichette "Oggi"/"Ieri"/data estesa.
- In fondo al flusso la stessa pill con "Le comunicazioni arrivano da dotCasting: non è possibile rispondere qui." (oggi è una barra fissa in basso: diventa parte del flusso).
- Messaggio: avatar circolare 40px con il logo agenzia dalle impostazioni (fallback iniziale), 12px di gap, bolla 632px (fluida su mobile), fondo #ece5de, padding 24px, raggio 24px con angolo alto-sinistra squadrato.
- Dentro la bolla: blocco testo (etichetta tipo DM Sans Medium 15px #686868, corpo DM Sans 15px #1a1a1a con supporto grassetto su più righe) e, 24px sotto, riga inferiore con pulsante azione a sinistra e orario a destra (DM Sans Medium 12px #686868). Pulsante azione: 36px, pill, bordo 1px #c7c7c7, bianco 30% con blur 4px, icona freccia diagonale 20px + label 15px. Senza azione resta solo l'orario. Su schermo stretto il pulsante va a capo sopra l'orario.
- Rimozione delle spunte di lettura e dei filtri "Tutte / Da leggere" dall'header (l'header ospita titolo e WhatsApp); la lettura resta tracciata in silenzio per il contatore.

## 2. Comunicazioni automatiche

Regole già presenti, con queste correzioni:
- Foto insufficienti: una sola comunicazione che elenca tutte le categorie sotto il minimo (oggi ne genera una per categoria), con azione alla gestione foto.
- Ogni testo generato passa dai template configurati in impostazioni: se il tipo è disattivato non viene generato né aggiornato.
- Resta la logica anti-ripetizione: aggiorna la comunicazione esistente e la riporta in fondo solo se la situazione peggiora.

## 3. Lato agenzia

Chat esistente mantenuta. Aggiunte:
- Nuovo tipo di azione allegabile "WhatsApp con messaggio precompilato" (oltre a sezione profilo e ingaggio già presenti), usato per le richieste di disponibilità.
- Invio a più talent già disponibile: viene mantenuto e allineato ai nuovi tipi di azione.
- Storico esistente consultabile in sola lettura, non riportato nel nuovo feed talent.

## 4. Impostazioni: testi delle comunicazioni

Nuova tab "Comunicazioni" in Impostazioni, con una card per ciascun tipo automatico (profilo incompleto, foto insufficienti, documenti/passaporto, nuovo ingaggio, ingaggio modificato):
- interruttore attivo/disattivo in app;
- campi modificabili: etichetta tipo, corpo del messaggio, etichetta pulsante azione;
- ripristino del testo predefinito;
- elenco dei segnaposto disponibili per quel tipo, inseribili con un click nel punto del cursore (nome talent, elenco dati mancanti, categorie foto, numero foto/minimo, titolo progetto, ruolo, data, luogo);
- testi predefiniti con costruzioni neutre, senza articoli attaccati ai segnaposto ("Mancano ancora questi dati: {elenco}");
- anteprima sotto il campo, resa come la bolla reale con dati di esempio.

## 5. Notifiche email (predisposizione)

Nella stessa card, secondo interruttore "Invio email" con campi oggetto e corpo, disabilitati e segnalati come non ancora attivi. Il modello dati prevede già le due varianti (app / email) e interruttori indipendenti per canale.

## 7. Responsive

Bolla fluida con avatar a sinistra, azione a capo sopra l'orario, pulsante WhatsApp ridotto a icona.

## Dettagli tecnici

- Nuova tabella `communication_templates`: `type` (PK testuale), `enabled_app`, `enabled_email`, `label`, `body`, `action_label`, `email_subject`, `email_body`, `updated_at`. GRANT: SELECT a `authenticated` (il talent legge i template per il rendering) e ALL a `service_role`; scrittura solo con `has_role(auth.uid(),'owner'|'admin')`. Seed dei 5 tipi con i testi predefiniti.
- `src/lib/communicationTemplates.ts`: definizione dei tipi, testi di default, elenco segnaposto per tipo e funzione `renderTemplate(text, vars)` per la sostituzione, usata sia dal sync sia dall'anteprima.
- Nuovi hook `useCommunicationTemplates` / `useUpdateCommunicationTemplate`.
- `useCommunicationSync.ts`: consuma i template, unifica le foto in un solo `dedupe_key` (`photos_missing`) e salta i tipi disattivati.
- `CommunicationCard.tsx` riscritto sulla nuova anatomia (avatar logo da `useAppSettings`, bolla, riga inferiore); `TalentCommunications.tsx` per header fisso, gradiente e pill di chiusura; nuovo `CommunicationsSettingsSection.tsx` + `TemplateEditorCard.tsx` con `BubblePreview`.
- Colori e misure aggiunti come token/classi nel design system, senza hex sparsi nei componenti.
