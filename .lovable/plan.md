Piano: Card talento — testo bottom ingrandito e nome completo

File interessato: `src/components/talents/TalentBoardCard.tsx`

1. **Mostrare il nome completo**
   - In `buildDisplayName`, quando non c'è `stage_name`, restituire `\`${f} ${l}\`` (nome + cognome intero) invece di `\`${f} ${l.charAt(0)}.\`` (nome + iniziale).
   - Rimuovere la classe `truncate` dal div del nome in overlay bottom per permettere la visualizzazione completa.

2. **Ingrandire leggermente i testi**
   - Nome: da `text-sm` a `text-[15px]`.
   - Meta (città / età): da `text-[11px]` a `text-[12px]`.

3. **Verifica layout**
   - Assicurarsi che l'overlay gradiente bottom (`pt-10 pb-2`) abbia spazio sufficiente a contenere eventuali nomi su due righe senza sovrapporsi agli indicatori superiori.