# Fix dei campi select (testo sfalsato + chevron mancante)

## Cosa non va

Nel componente select condiviso del profilo talent ci sono due difetti introdotti con la stabilizzazione delle label:

1. **Chevron invisibile**: il trigger applica una regola che nasconde tutte le icone dirette al suo interno, e la freccia disegnata a destra è proprio una di quelle icone. Risultato: nessuna freccia visibile, il campo non si legge come select.
2. **Valore sfalsato verso l'alto**: il testo del valore selezionato usa una spaziatura diversa da quella dei campi di testo, quindi non si allinea alla stessa baseline degli input normali affiancati (es. Giorno/Mese/Anno, Stato/Regione/Provincia/Città).

## Correzioni

- Mostrare una sola freccia a destra, allineata verticalmente al centro, dimensione 20px, stesso colore/opacità degli altri campi, non cliccabile separatamente (il click apre comunque il select).
- Allineare il valore selezionato alla stessa posizione verticale del testo degli input, così select e input affiancati risultano perfettamente sulla stessa riga sia a riposo che con label floating.
- Mantenere invariati: altezza minima del campo, sfondo, stato disabilitato, ring di focus e comportamento della label floating.

## Dettagli tecnici

File: `src/components/profile/fields/FormFields.tsx`, componente `FloatingSelect`.

- Rimuovere la regola `[&>svg]:hidden` sul `SelectTrigger` (nasconde anche la freccia custom) e scegliere una sola sorgente per l'icona: eliminare il `ChevronDown` custom e stilare quello nativo dello `SelectTrigger` (`[&>svg]:h-5 [&>svg]:w-5 [&>svg]:opacity-70 [&>svg]:shrink-0`), mantenendo `pr-11`.
- Sostituire `mt-1` sullo span del valore con lo stesso offset usato da `FloatingInput` (`mt-[18px]`, `leading-[1.2]`) e rimuovere `justify-center` dal wrapper, così l'altezza e la posizione del testo restano identiche a quelle degli input.
- Verifica: screenshot della sezione anagrafica/luogo di nascita a confronto con gli input di testo, controllo che la freccia sia unica e visibile anche nello stato disabilitato.
