## Problema

Quando l'admin crea un nuovo talent da `Admin → Talents → Nuovo Talent`:
- l'utente in `auth.users` e la riga in `profiles` vengono creati correttamente (con `email_confirm: true`, nessuna conferma email pendente);
- ma il profilo nasce con `onboarding_completed = false`;
- la lista admin (`useTalents` / `useTalentCount`) filtra rigidamente `.eq("onboarding_completed", true)` → il nuovo talent c'è nel DB ma non compare in lista finché l'onboarding non è completato.

Non è quindi un'attesa di conferma utente: è il filtro di lista.

## Soluzione scelta — Onboarding compilato dall'admin

Dopo la creazione, l'admin viene portato sulla pagina di edit completo del talent (già esistente: `/owner/talents/:profileId/edit`, `OwnerTalentEdit`). Quando l'admin salva i dati minimi richiesti, il profilo passa a `onboarding_completed = true` e appare in lista.

### Cambiamenti

1. **Edge Function `create-talent`** — `supabase/functions/create-talent/index.ts`
   - Nella risposta di successo, oltre a `user_id`, restituire anche il `profile_id` del profilo appena creato dal trigger `handle_new_user` (una `select id from profiles where user_id = newUser.user.id`).

2. **`CreateTalentDialog`** — `src/components/talents/CreateTalentDialog.tsx`
   - Dopo il toast di successo, navigare a `/owner/talents/${profile_id}/edit` invece di limitarsi a chiudere il dialog.
   - Invalidare comunque la query `talents` per coerenza.

3. **`OwnerTalentEdit`** — `src/pages/owner/OwnerTalentEdit.tsx`
   - Mostrare in cima un banner discreto quando `profile.onboarding_completed === false`: "Profilo in attesa di completamento — non visibile nella lista finché non compili i campi obbligatori e salvi.".
   - Aggiungere in fondo un pulsante **"Pubblica profilo"** che:
     - controlla la presenza dei campi obbligatori dell'onboarding (stesso set usato in `TalentOnboarding` / `useProfileCompletion` — verrà riusato il check esistente, non duplicato);
     - se ok, fa `update profiles set onboarding_completed = true where id = profileId` e invalida `["profile", profileId]` + `["owner-talents", ...]` + `["owner-talents-count"]`;
     - mostra toast "Profilo pubblicato" e torna alla lista, dove il talent ora è visibile;
     - se mancano campi, mostra un toast con l'elenco dei campi mancanti.
   - Il pulsante è nascosto se `onboarding_completed` è già `true`.

4. **RLS / permessi** — verifica preliminare: le policy attuali su `profiles` devono già permettere a `owner`/`admin` l'UPDATE sui profili altrui (richiesto dalla feature "Full profile editing" memorizzata). Se mancante, aggiungere una policy con `public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')`. Da confermare leggendo le policy esistenti su `profiles` prima dell'implementazione.

### Non in scope

- Non viene introdotto uno stato "Bozza" nella lista talents.
- Nessuna modifica al flusso di onboarding lato talent: se il talent accede prima che l'admin abbia "pubblicato", vedrà comunque il wizard di onboarding come oggi.
- Nessun invio email automatico al talent (resta come oggi: reset password manuale).

## Verifica

1. Da `Admin → Talents → Nuovo Talent` inserire una nuova email e confermare.
2. Si apre automaticamente la pagina di edit del nuovo talent con il banner "in attesa di completamento".
3. Compilare i campi obbligatori, cliccare **"Pubblica profilo"** → toast di conferma, redirect alla lista, il talent è visibile in cima.
4. Riaprire l'edit: il banner e il pulsante "Pubblica" non compaiono più.
