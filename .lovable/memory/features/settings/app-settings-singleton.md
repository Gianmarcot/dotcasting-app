---
name: App settings singleton
description: Singleton app_settings row holding agency branding (name, logo, contact email/phone, website) used by /owner/settings and shared round page
type: feature
---
- Tabella `app_settings` con PK boolean `id` (sempre true) — una sola riga.
- Letta da chiunque (SELECT pubblico) per branding sulla pagina pubblica del round.
- Scrittura riservata a `has_role(auth.uid(),'owner'|'admin')`.
- Logo agenzia salvato nel bucket `avatars` sotto prefisso `branding/` (bucket pubblico già esistente; bucket dedicato `branding` bloccato dal workspace).
- Hook `useAppSettings()` / `useUpdateAppSettings()` in `src/hooks/useAppSettings.ts`. `fetchAppSettings()` non-React per usi server-side (es. generazione PDF).
- `get_shared_round(token)` include `branding` nel payload (`agency_name`, `agency_logo_url`, `contact_email`) — la pagina pubblica NON interroga `app_settings` direttamente.
- `resolveCard(talent, preset, branding?)` propaga `agencyName`/`agencyLogoUrl`/`agencyContactEmail` in `ResolvedCard`, consumati da `TalentCardPDF`/`TalentCardWeb` nel footer.
- Footer comp card: niente fallback hardcoded a `info@dotcasting.com`; se l'email non è impostata, non viene mostrata.
