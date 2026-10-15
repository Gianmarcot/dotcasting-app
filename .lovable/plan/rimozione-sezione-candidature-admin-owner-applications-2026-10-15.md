# Rimozione sezione Candidature admin (/owner/applications)

La sezione è già nascosta dietro il flag `OWNER_APPLICATIONS` (false), ma il codice resta. La rimuoviamo completamente: pagina, componenti, hook, flag, voci di menu e etichette. Il lato talent (le sue candidature in `/talent/applications`) resta intatto.

## Modifiche

1. **Route** (`src/App.tsx`)
   - Rimuovere l'import di `OwnerApplications` e la route `applications` dal gruppo `/owner`.

2. **File da eliminare**
   - `src/pages/owner/OwnerApplications.tsx`
   - `src/components/applications/` (ApplicationCard, ApplicationFilters, ApplicationStatusDropdown, ApplicationTalentDialog)
   - `src/hooks/useApplications.ts`
   - Nessun altro file li usa (verificato con ricerca).

3. **Menu admin** (`src/components/layout/OwnerSidebar.tsx`, `src/components/layout/MobileBottomNavOwner.tsx`)
   - Rimuovere la voce "Candidature" da `allNavItems` in entrambi.

4. **Flag** (`src/lib/featureFlags.ts`)
   - Rimuovere `OWNER_APPLICATIONS`; resta `TALENT_EXPLORE_CASTINGS`.

5. **Etichette** (`src/lib/i18n.ts`)
   - Rimuovere `backoffice.applications`, il blocco `applications` (stati e testi, usati solo dai componenti admin) e `nav.applications` (inutilizzato).

6. **Vecchi link**
   - Sostituire la route rimossa con un redirect a `/owner`, così i vecchi segnalibri non finiscono su "Pagina non trovata".

## Verifica

- Typecheck (`tsgo`) e build.
- Anteprima: `/owner` senza la voce "Candidature" in sidebar e nel menu mobile; `/owner/applications` reindirizza a `/owner`.
