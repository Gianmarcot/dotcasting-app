

## Aggiornare Segni particolari e Ulteriori abilità

### 1. Migrazione DB

Aggiungere colonne a `talent_attributes`:

```sql
ALTER TABLE talent_attributes ADD COLUMN has_vitiligo boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN has_albinism boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN has_dwarfism boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN ability_dance boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN ability_sing boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN ability_instruments boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN ability_instruments_detail text;
ALTER TABLE talent_attributes ADD COLUMN ability_sports boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN ability_sports_detail text;
ALTER TABLE talent_attributes ADD COLUMN ability_bartender boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN ability_other boolean DEFAULT false;
ALTER TABLE talent_attributes ADD COLUMN ability_other_detail text;
```

### 2. PhysicalFeaturesSection — rinominare titolo e aggiungere voci

Titolo: "Segni particolari"

Voci checkbox (griglia 2 colonne):
- Vitiligine, Lentiggini
- Diastema, Albinismo
- Nanismo, Tatuaggi

Aggiungere `has_vitiligo`, `has_albinism`, `has_dwarfism` al formData e alla logica save.

### 3. AbilitiesSection — trasformare in "Ulteriori abilità"

Titolo: "Ulteriori abilità"

Sostituire la lista ABILITIES con 6 checkbox fissi (griglia 2 colonne):
- So ballare / So cantare
- So suonare degli strumenti musicali / Pratico degli sport
- Ho esperienza come bartender / Altro

Logica condizionale:
- Se "So suonare" spuntato → mostrare Textarea "Quali strumenti musicali sai suonare?"
- Se "Pratico degli sport" spuntato → mostrare Textarea "Quali sport pratichi?"
- Se "Altro" spuntato → mostrare Textarea "Altro"

Salvare i nuovi campi boolean + detail text su `talent_attributes`.

### 4. Hooks — aggiungere nuovi campi

Aggiornare il tipo mutation in `useTalentAttributes.ts` e `useTalentAttributesByProfileId.ts` per includere tutti i nuovi campi.

### File da modificare

| File | Modifica |
|------|----------|
| Migrazione DB | 12 nuove colonne |
| `src/components/profile/PhysicalFeaturesSection.tsx` | Titolo + 3 nuove voci |
| `src/components/profile/AbilitiesSection.tsx` | Riscrivere con 6 checkbox + textarea condizionali |
| `src/hooks/useTalentAttributes.ts` | Nuovi campi nel tipo |
| `src/hooks/useTalentAttributesByProfileId.ts` | Nuovi campi nel tipo |

