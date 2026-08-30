# Aggiorna i dati di accesso: raggi coerenti e due tab

## 1. Stondature

Nella pagina i raggi sono disallineati rispetto al resto del sito: il riquadro informativo del cambio email usa un valore fuori scala (20px) mentre i campi usano 16px e le card 24px.

Correzione: riquadri informativi allineati al raggio dei campi (16px), card della sezione al raggio standard delle card (24px, uguale a `.dc-card`). Nessun altro cambio visivo.

## 2. Email e password su due tab

Email e password non si modificano più nella stessa schermata: la sezione ospita due tab.

- Tab "Email": campo email di accesso, indirizzo attualmente in vigore, stato di attesa conferma con "Invia di nuovo", pulsante di salvataggio che agisce solo sull'email.
- Tab "Password": password attuale (nascosta per chi arriva da un profilo tutelato), nuova password, conferma, pulsante che agisce solo sulla password.
- Il tab attivo di default è "Email"; se è in corso un cambio email in attesa, resta comunque "Email" con il riquadro di attesa visibile.
- Le regole restano quelle attuali: minimo 8 caratteri, conferma coincidente, verifica della password attuale prima del cambio.

## 3. Componente di navigazione condiviso

Il selettore Foto/Video usato nella preview del profilo oggi è scritto direttamente dentro la modale di dettaglio talent. Viene estratto in un componente riutilizzabile del design system (pillole dentro una traccia arrotondata, opzione attiva su fondo chiaro, navigazione con frecce, ruoli di accessibilità radiogroup/radio) e usato in due punti:

- la modale di dettaglio talent, che passa a usare il componente estratto senza cambiare aspetto;
- la pagina Aggiorna i dati di accesso, per i tab Email / Password.

Il componente viene aggiunto anche alla pagina /design-system con un esempio.

## Dettagli tecnici

- Nuovo `src/components/ui/pill-tabs.tsx`: props `options` (value, label, icon opzionale, count opzionale), `value`, `onChange`, `ariaLabel`; stile e comportamento tastiera ripresi identici dall'attuale selettore, colori via token esistenti.
- `src/components/talents/detail/TalentDetailModal.tsx`: sostituzione del markup inline con il nuovo componente, comportamento invariato (pausa video al cambio, indice foto persistente).
- `src/pages/talent/TalentUpdateAccess.tsx`: stato `tab`, due submit separati (`submitEmail`, `submitPassword`) ricavati dall'attuale `submit`, raggi allineati.
- `src/pages/DesignSystem.tsx`: nuova voce di esempio.
- Nessuna migrazione, nessuna modifica a RLS o logica di backend.
