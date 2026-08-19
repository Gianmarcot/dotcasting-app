# Comunicazioni: stile chat come nello screenshot

Allineiamo la sezione "Comunicazioni" del talent allo stile della chat mostrata nell'esempio, senza toccare la logica (notifiche automatiche, azioni, scadenze, lettura).

## Cosa cambia

- **Bolle in arrivo beige**: fondo `muted` (beige tenue) al posto del bianco, angolo superiore sinistro smussato (`rounded-2xl` + `rounded-tl-sm`), testo su colore foreground, larghezza massima 80%.
- **Avatar mittente**: cerchietto con iniziale/logo agenzia a sinistra della bolla, come nell'esempio ("P" / "?"), invece del quadratino icona dentro la bolla. L'icona del tipo di comunicazione resta come piccolo indicatore accanto al titolo.
- **Testo compatto**: titolo in evidenza, corpo `text-sm`, ora in basso a sinistra in `text-[10px]` muted (non allineata a destra).
- **Separatori data**: pillola centrata su fondo beige con testo muted, formato "Giovedì 5 Febbraio" (giorno della settimana + giorno + mese), coerente con la chat lato agenzia; restano "Oggi"/"Ieri" per i due giorni più recenti.
- **Chip azione**: le etichette tipo "Materiale richiesto" / "Disponibilità richiesta" diventano pillole su fondo `background` dentro la bolla, come nella chat owner.
- **Conferme**: le risposte già date restano come riga inline con doppia spunta, adattata ai nuovi colori.
- **Non letto**: mantenuto il divisore "Non letti" e un accento leggero sulla bolla non letta (ring brand tenue), senza ombre pesanti.
- **Header e nota finale**: invariati nella struttura; la pillola dei filtri e la nota "le comunicazioni arrivano dall'agenzia" si adattano al nuovo fondo.

Nessuna bolla bordeaux allineata a destra, perché il talent non scrive in questa sezione: lo stile bordeaux resta riservato ai messaggi inviati nella chat lato agenzia.

## Dettagli tecnici

- `src/components/communications/CommunicationCard.tsx`: bolla riscritta con `bg-muted rounded-2xl rounded-tl-sm px-4 py-2`, avatar `h-8 w-8` esterno, chip azione e timestamp secondo il pattern di `ThreadView.tsx`.
- `src/pages/talent/TalentCommunications.tsx`: `DaySeparator` con `bg-muted` e formato weekday, skeleton aggiornati alla nuova larghezza/forma.
- Solo token esistenti (`muted`, `background`, `primary`, `destructive`); nessuna modifica a hook, `lib/communications.ts`, database o lato agenzia.
