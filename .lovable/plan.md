# Avviso codice fiscale nel box "Forza del Profilo"

Quando il talent ha dichiarato di avere un codice fiscale italiano ma non lo ha ancora inserito, nel box "Forza del Profilo" compare un avviso che invita a completarlo.

## Comportamento

- L'avviso appare sotto i suggerimenti, dentro il box, solo quando il codice fiscale risulta dichiarato ma non inserito.
- Testo: "Manca il tuo codice fiscale. Senza questo dato non possiamo contrattualizzarti per un lavoro: completalo per essere pronto quando arriva l'occasione."
- Un collegamento "Inserisci il codice fiscale" porta direttamente alla sezione Documenti e fiscalità della pagina, con lo stesso effetto di scorrimento e evidenziazione usato dai suggerimenti.
- Chi ha dichiarato di non avere un codice fiscale italiano non vede nessun avviso qui: la nota informativa dedicata resta nella sezione Documenti e fiscalità.
- Se il box viene compresso, l'avviso resta nascosto come il resto del contenuto.

## Stile

Riquadro di avviso già usato nel profilo (tono Warning, colore #C88500, icona triangolo), stesso arrotondamento degli altri elementi del box.

## Dettagli tecnici

- `src/components/profile/v2/ProfileStrengthCard.tsx`: calcolo dello stato con `fiscalStatusOf` da `src/lib/fiscalStatus.ts`; render di `NoticeBox tone="warning"` (da `src/components/profile/fields/FormFields.tsx`) con icona `AlertTriangle` solo se lo stato è `missing`; il collegamento richiama `focusProfileSection("section-documents")`.
- Nessuna modifica a punteggio, database, comunicazioni automatiche o altri componenti.
