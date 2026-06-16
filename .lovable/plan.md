## 1. Database (migration)

Tabella singleton `app_settings`:

```sql
create table public.app_settings (
  id boolean primary key default true,
  agency_name text,
  agency_logo_url text,
  contact_email text,
  contact_phone text,
  website_url text,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id)
);

grant select on public.app_settings to anon, authenticated;
grant all on public.app_settings to service_role;

alter table public.app_settings enable row level security;

-- Lettura: tutti (compreso anon) per branding sulla pagina pubblica del round
create policy "app_settings readable" on public.app_settings for select using (true);

-- Scrittura: solo owner/admin
create policy "owner/admin update settings" on public.app_settings for update
  to authenticated using (has_role(auth.uid(),'owner') or has_role(auth.uid(),'admin'));
create policy "owner/admin insert settings" on public.app_settings for insert
  to authenticated with check (has_role(auth.uid(),'owner') or has_role(auth.uid(),'admin'));

insert into public.app_settings (id) values (true) on conflict (id) do nothing;

create trigger app_settings_touch_updated_at
  before update on public.app_settings
  for each row execute function public.update_updated_at_column();
```

Bucket Storage `branding` (pubblico) per logo agenzia, con RLS che permette upload/update/delete a owner/admin e SELECT pubblico.

Aggiornare la RPC `get_shared_round` per includere nel payload un campo `branding` (`agency_name`, `agency_logo_url`, `contact_email`) letto da `app_settings` — così la pagina pubblica non interroga `app_settings` direttamente.

## 2. Pagina `/owner/settings`

Sostituire `src/pages/owner/OwnerSettings.tsx` con un layout a **tabs shadcn** (`Agenzia` | `Account`).

**Tab Agenzia** (`src/components/owner/settings/AgencySettingsForm.tsx`)
- Hook `useAppSettings()` (`src/hooks/useAppSettings.ts`) — query+mutation con react-query.
- Campi: `agency_name`, logo (upload nel bucket `branding`, preview, sostituzione), `contact_email`, `contact_phone`, `website_url`.
- Validazione zod (email valida; URL valido se compilato; trim/lunghezze).
- Upload logo passa per `compressImage(file, "avatar")` già esistente; cancellazione del vecchio file dopo upload del nuovo.
- Salvataggio: `upsert` con `id: true` → aggiorna la riga singleton.

**Tab Account** (`src/components/owner/settings/AccountSection.tsx`)
- Mostra email corrente (read-only, da `useAuth`).
- Form cambio password: nuova password + conferma → `supabase.auth.updateUser({ password })` con validazione (min 8, conferma uguale).
- Nessuna gestione membri team (placeholder testuale "Disponibile prossimamente" o sezione assente — preferisco assente per non sovra-strutturare).

UI in italiano, `.dc-card`, tipografia da memoria progetto. Responsive (tabs stacked su mobile, form a colonna singola).

## 3. Collegamento branding

**Comp card (PDF + Web)** — `src/lib/casting/roundPreset.ts`, `TalentCardPDF.tsx`, `TalentCardWeb.tsx`, `generateRound.tsx`:
- Estendere `RoundPreset` o, meglio, aggiungere campo opzionale `branding?: { agencyName?: string; logoUrl?: string; contactEmail?: string }` come parametro a `resolveCard(talent, preset, branding?)`.
- `ResolvedCard` espone `agencyName`, `agencyLogoUrl`, `agencyContactEmail`.
- Footer: se `agencyContactEmail` presente mostra quello, altrimenti niente (rimuovere fallback hardcoded `info@dotcasting.com`).
- `generateRoundPdfs` carica `app_settings` una volta a monte e passa `branding` a `resolveCard`.
- `useUpdateRound` (genera PDF) idem.

**Pagina pubblica round** — `src/pages/shared/SharedRound.tsx`:
- Legge `data.branding` dalla RPC.
- Header: usa `branding.agency_logo_url` (fallback `/logo.png`) e `branding.agency_name` (fallback "dotCasting") al posto dei valori fissi.
- Passa `branding` al `resolveCard` dentro `TalentBlock` per il footer della comp card web.

Aggiornare i tipi TS della RPC (rigenerati dopo migration).

## Cosa NON viene fatto
- Niente multi-tenant / tabella `agencies`.
- Niente sezioni "Default invii", "Notifiche", "Team".
- Nessuna modifica al logo statico usato nei layout backoffice (sidebar, auth) — la richiesta è limitata a comp card PDF e pagina pubblica round.