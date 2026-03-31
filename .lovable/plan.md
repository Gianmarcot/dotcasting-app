

## Aggiornare campi Misure e Aspetto con taglie IT/EU precise

### Confronto screenshot vs stato attuale

| Campo screenshot | Stato attuale | Azione |
|---|---|---|
| Altezza (cm) | Presente | OK |
| Taglia giacca (IT/EU) | Presente ma solo XS/S/M... | Aggiornare valori |
| Taglia maglia | **Mancante** | Aggiungere campo + colonna DB |
| Taglia pantaloni (IT/EU) | Presente ma solo numeri semplici | Aggiornare valori |
| Larghezza spalle (cm) | Presente | OK |
| Misura collo camicia (cm) | Presente come "Collo" | Rinominare label |
| Numero scarpe | Presente | OK |
| Colore capelli | Presente | OK |
| Colore occhi | Presente | OK |
| Lunghezza capelli | Presente | OK |
| Tipologia capelli | Presente | OK |
| Etnia | Presente (in BasicInfoSection) | OK |

**Campi presenti attualmente ma NON nello screenshot**: Peso, Petto, Vita, Fianchi. Li manterrei comunque dato che sono utili — a meno che tu non voglia rimuoverli.

### Modifiche

#### 1. Migrazione DB — Aggiungere colonna `shirt_size`
```sql
ALTER TABLE talent_attributes ADD COLUMN shirt_size text;
```

#### 2. `src/lib/profileOptions.ts` — Aggiornare costanti

- `JACKET_SIZES`: da `["XS", "S", ...]` a formato IT/EU:
  `["IT 44 | EU 34", "IT 46 | EU 36", "IT 48 | EU 38/40", "IT 50/52 | EU 46/48", ...]`
- `PANTS_SIZES`: da numeri semplici a formato IT/EU:
  `["IT 28/30 | EU 24/26", "IT 34/36 | EU 30/32", ...]`
- Aggiungere `SHIRT_SIZES`: `["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]`

#### 3. `src/components/profile/MeasurementsSection.tsx`

- Aggiungere campo "Taglia maglia" come Select con `SHIRT_SIZES`
- Rinominare label "Collo" → "Misura collo camicia"
- Riorganizzare layout griglia secondo ordine screenshot:
  - Riga 1: Altezza, Taglia giacca
  - Riga 2: Taglia maglia, Taglia pantaloni
  - Riga 3: Larghezza spalle, Misura collo camicia
  - Riga 4: Numero scarpe
  - Separatore
  - Riga 5: Colore capelli, Colore occhi
  - Riga 6: Lunghezza capelli, Tipologia capelli
  - Riga 7: Etnia (oppure resta in BasicInfoSection)

#### 4. Hooks — Aggiungere `shirt_size`

Aggiornare il tipo mutation in `useTalentAttributes.ts` e `useTalentAttributesByProfileId.ts` per includere `shirt_size`.

### File da modificare

| File | Modifica |
|------|----------|
| Migrazione DB | Aggiungere `shirt_size` |
| `src/lib/profileOptions.ts` | Aggiornare JACKET_SIZES, PANTS_SIZES, aggiungere SHIRT_SIZES |
| `src/components/profile/MeasurementsSection.tsx` | Nuovo campo, rinomina label, riordino layout |
| `src/hooks/useTalentAttributes.ts` | Aggiungere `shirt_size` al tipo |
| `src/hooks/useTalentAttributesByProfileId.ts` | Aggiungere `shirt_size` al tipo |

