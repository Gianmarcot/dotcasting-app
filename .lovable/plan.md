

## Regolare spaziatura label-input e label-radio

### Modifiche

**`src/components/ui/form.tsx`** (riga 68)
- `FormItem`: cambiare `space-y-2` → `space-y-1.5` per ridurre lo spazio label↔input da 8px a 6px

**`src/components/profile/BasicInfoSection.tsx`**
- Righe 286, 319: nei wrapper dei radio group, cambiare `space-y-2` → `space-y-3` per aumentare lo spazio tra la label top e i radio buttons

**`src/components/profile/TalentRolesSection.tsx`**
- Riga 106: cambiare `space-y-3` → `space-y-3` (già ok, verificare) — se serve aumentare, portare a `space-y-4`

