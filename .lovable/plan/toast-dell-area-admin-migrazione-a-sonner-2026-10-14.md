# Toast dell'area admin: migrazione a sonner

## Obiettivo
Tutti i toast dell'area admin passano allo stesso sistema già usato dall'area talent: fondo scuro `#0f0f0f`, testo chiaro, angoli morbidi, posizione in alto a destra, errori con fondo rosso bordeaux (`--brand-800`). Nessuna modifica a `src/components/ui/sonner.tsx`: è già stilizzato globalmente e i nuovi toast ne ereditano lo stile.

## Stato attuale
- `App.tsx` monta due toaster: il legacy shadcn (`<Toaster />`) e sonner (`<Sonner />`).
- 28 file chiamano ancora `useToast` (stili shadcn: chiaro, bordo, in basso a destra):
  - Pagine owner: `OwnerCastings`, `OwnerCastingDetail`, `OwnerCastingRoleDetail`, `OwnerCompanies`, `OwnerCompanyDetail`, `OwnerRoundDetail`.
  - Componenti: castings (AddRoleDialog, ApplyToCastingDialog, FavoriteCastingStar, RoundWizardDialog, RoundHistoryItem, RoundFolderCard, RoleRoundRow, ClientPasswordCard, RoleEngagementsPanel, TalentPdfWizard), targets (TargetShortlist, TargetMatchResults, TargetCard, CreateTargetDialog), messages (NewThreadDialog).
  - Hook: useApplications, useCastingInvitations, useTalentApplications, useTalentMedia, useTalentMediaByProfileIdEditable, useAICasting.
  - Fuori dalle due aree (per coerenza, stesso trattamento): AuthPage, ResetPasswordPage, EmailConfirmedPage, VerifyEmailPage, AcceptInvitation, ComingSoon, TalentProfileV2, TalentOnboarding, TalentUpdateAccess, DesignSystem.
- Circa 123 chiamate legacy da convertire.

## Conversione
Per ogni file: rimuovere `useToast` e `const { toast } = useToast()`, importare `toast` da `"sonner"`, riscrivere le chiamate:
- `toast({ title, description, variant: "destructive" })` → `toast.error(title, { description })`.
- Messaggi di conferma → `toast.success(title, { description })`.
- Messaggi neutri → `toast(title, { description })`.
- `action: { label, onClick }` e `duration` → equivalenti sonner (sonner li supporta nativamente).
- Testi e lingua italiana restano invariati.

## Pulizia finale
- `App.tsx`: togliere il legacy `<Toaster />` e il suo import; resta solo `<Sonner />`.
- Cancellare i file legacy non più referenziati: `src/hooks/use-toast.ts`, `src/components/ui/use-toast.ts`, `src/components/ui/toaster.tsx`, `src/components/ui/toast.tsx`.
- `DesignSystem.tsx`: la sezione Toast usa già sonner; se contiene demo legacy, si allineano.

## Verifica
- Nessun riferimento residuo a `use-toast` nel progetto.
- Typecheck pulito e build OK (log `/tmp/observability`).
- In anteprima: salvare un casting e azionare un'azione con errore per vedere i toast scuri in alto a destra e quello rosso per gli errori.
