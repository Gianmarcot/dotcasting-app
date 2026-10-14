# Taglie giacca, maglia e pantaloni: da IT 36 e taglie bambino

## Cosa cambia
- **Taglia giacca** e **Taglia pantaloni** partono da IT 36, non più da IT 44 e IT 38. Si aggiungono anche le taglie intermedie che mancano tra IT 36 e i valori di partenza di oggi.
  - Giacca: IT 36 | EU 26 … IT 42/44 | EU 32/34, poi la lista attuale.
  - Pantaloni: IT 36 | EU 30, IT 36/38 | EU 30/32, poi la lista attuale.
- Le taglie per bambini e ragazzi vanno in cima alle tre liste (giacca, maglia, pantaloni), nello stesso menu e prima delle taglie adulto:
  - 0-1 mese, 1-3 mesi, 3-6 mesi, 6-9 mesi, 9-12 mesi, 12-18 mesi, 18-24 mesi
  - da 2 anni a 18 anni, un valore per ogni anno
- Le taglie già salvate restano valide: i valori esistenti non cambiano.
- Il filtro "Taglia" nel Database talenti mostrerà automaticamente anche le taglie bambino.

## Dettagli tecnici
- `src/lib/profileOptions.ts`: nuovo `KIDS_SIZES` (prima nella lista); `JACKET_SIZES`, `SHIRT_SIZES` e `PANTS_SIZES` diventano `[...KIDS_SIZES, ...adulto]`, con le nuove righe IT 36+ in testa alle taglie adulto.
- Corrispondenza EU uguale a quella attuale: giacca EU = IT − 10, pantaloni EU = IT − 6.
- Nessuna modifica al database (i campi sono testo libero).
