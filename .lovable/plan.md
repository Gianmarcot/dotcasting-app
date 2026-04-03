

## Uniformare padding e migliorare leggibilità testi

### Analisi dello stato attuale

Dopo aver esaminato il codice, ho riscontrato diverse incoerenze:

**Padding:**
- `dc-card-content` / `dc-card-header`: `p-6` (24px) — ma molte card usano override `p-4` (16px) o `p-5` (20px) inline
- Tabella talent nel dettaglio ruolo: `p-3` (12px) — troppo compresso
- `CastingRoleCard`: `p-4`
- `TalentCard`: `p-5`
- `OwnerDashboard` stat cards: `p-5`
- Card confermati nel casting detail: `p-3` — troppo stretto
- Summary row nella tabella: `px-3 py-3` — poco respiro

**Testi troppo piccoli:**
- Tabella ruolo: `text-xs` (12px) per sottotitoli, date, contatori — poco leggibile
- Badge riassuntivi: `text-[10px]` — molto piccoli
- Card confermati: `text-xs` per età/città, `text-[10px]` per badge ruolo
- Subtitolo pagine: `text-sm` va bene, ma i dettagli secondari nelle card usano `text-xs`
- `dc-text-muted`: `text-sm` — ok
- TalentCard skills: `text-xs` con `py-0.5` — compresso

### Modifiche proposte

**1. `src/index.css` — Design system tokens**

| Classe | Attuale | Nuovo |
|--------|---------|-------|
| `dc-card-header` | `p-6` | `p-6` (invariato, è il riferimento) |
| `dc-card-content` | `p-6 pt-0` | `p-6 pt-0` (invariato) |
| `dc-badge` | `px-2.5 py-0.5 text-xs` | `px-3 py-1 text-xs` (più padding interno) |
| `dc-table-cell` | `p-4` | `p-4` (ok) |
| `dc-table-head` | `h-12 px-4` | `h-12 px-4` (ok) |

**2. `src/components/castings/CastingRoleCard.tsx` — padding card**

- `p-4` → `p-5` per allinearsi alle TalentCard

**3. `src/pages/owner/OwnerCastingRoleDetail.tsx` — tabella e testi**

- Celle tabella: `p-3` → `p-4` (allineamento con `dc-table-cell`)
- Sottotitolo talent (età, città, data): `text-xs` → `text-sm`
- Status select: `h-7 text-xs` → `h-8 text-sm` per leggibilità
- Summary row: `px-3 py-3 text-xs` → `px-4 py-4 text-sm`
- Badge nel summary: `text-[10px]` → `text-xs`

**4. `src/pages/owner/OwnerCastingDetail.tsx` — sezione confermati**

- Card confermati: `p-3` → `p-4`
- Nome: `text-sm` → `text-sm` (ok)
- Età/città: `text-xs` → `text-sm`
- Badge ruolo: `text-[10px]` → `text-xs`
- Metadati casting (luogo, date, compenso): `text-sm` → `text-sm` (ok, già leggibile)

**5. `src/components/talents/TalentCard.tsx` — skill tags**

- Skills: `text-xs px-2 py-0.5` → `text-xs px-2.5 py-1` (più respiro)
- Info secondarie: `text-sm` (già ok)

### File da modificare

| File | Modifica |
|------|----------|
| `src/index.css` | Aumentare padding badge (`px-3 py-1`) |
| `src/components/castings/CastingRoleCard.tsx` | `p-4` → `p-5` |
| `src/pages/owner/OwnerCastingRoleDetail.tsx` | Padding tabella `p-3` → `p-4`, testi `text-xs` → `text-sm`, select più grandi, summary più spazioso |
| `src/pages/owner/OwnerCastingDetail.tsx` | Card confermati `p-3` → `p-4`, testi `text-xs` → `text-sm`, badge `text-[10px]` → `text-xs` |
| `src/components/talents/TalentCard.tsx` | Skill tags padding aumentato |

