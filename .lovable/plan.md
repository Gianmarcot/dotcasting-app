## Contesto

- La sidebar (`OwnerSidebar.tsx`) legge già `first_name`, `last_name` e `profile_photo_url` da `useProfile()`. Nessuna modifica strutturale: sarà automaticamente aggiornata quando il profilo cambia.
- La pagina `Impostazioni → Account` (`AccountSection.tsx`) mostra oggi solo email e cambio password. Serve aggiungere in cima una card "Il tuo profilo" con nome, cognome, avatar.

## Modifiche

### `src/components/owner/settings/AccountSection.tsx`

Aggiungere una nuova card `.dc-card` "Il tuo profilo" prima delle card esistenti, contenente:

- Anteprima `Avatar size="lg"` (usa `profile_photo_url`, fallback iniziali).
- Pulsante "Cambia foto" (input file nascosto, accept `image/*`) + "Rimuovi" quando presente.
  - Upload al bucket pubblico `avatars`, path `profiles/{user_id}/avatar-{timestamp}.{ext}` per evitare collisioni cache.
  - Salvataggio dell'URL pubblico in `profiles.profile_photo_url`.
- Due Input: "Nome" e "Cognome" (controllati, precompilati da `useProfile()`).
- Pulsante "Salva" (DS `variant="default" size="md"`): fa `update` su `profiles` per il record `user_id = auth.uid()` con `first_name`, `last_name`.
- Al successo di ogni operazione: `queryClient.invalidateQueries({ queryKey: ["profile", user.id] })` così la sidebar si aggiorna in tempo reale + toast di conferma.

Sostituire anche il bottone "Aggiorna password" esistente da `className="rounded-full"` a `size="md"` per coerenza DS.

### RLS bucket `avatars`

Verificare (via `supabase--read_query` in build mode) che esista una policy che permetta agli utenti autenticati di scrivere sotto `profiles/{auth.uid()}/`. Se assente, aggiungere migration con:

```sql
create policy "Users can manage own avatar"
on storage.objects for all to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = 'profiles' and (storage.foldername(name))[2] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = 'profiles' and (storage.foldername(name))[2] = auth.uid()::text);
```

Nessuna modifica di schema DB (colonne `first_name`, `last_name`, `profile_photo_url` già esistono in `profiles`).

## File toccati

- `src/components/owner/settings/AccountSection.tsx` (edit)
- eventuale migration RLS per `avatars` se non già coperta

## Sidebar

Nessuna modifica: già collegata a `useProfile`.