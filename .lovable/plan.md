## Problema

Quando un Admin/Owner apre la pagina di modifica di un talent e prova a caricare una foto in galleria (o cambiare la foto profilo), l'upload fallisce silenziosamente o restituisce errore di permessi. Due cause concorrenti:

1. **Frontend** — `MediaGallerySection` usa sempre `useUploadMedia` e `useReplaceMediaFile` (legati al profilo dell'utente loggato) anche quando viene passato `externalProfileId`. Risultato: l'upload tenta di scrivere sul profilo dell'admin, non del talent.
2. **Backend (Storage RLS)** — Le policy su `storage.objects` per i bucket `talent-media` e `avatars` permettono INSERT/UPDATE/DELETE solo quando `auth.uid() = (storage.foldername(name))[1]`. Quindi anche correggendo il frontend, l'admin viene bloccato perché sta scrivendo nella cartella del talent.

## Soluzione

### 1. Storage policies (migrazione)
Aggiungere policy su `storage.objects` per consentire a chi ha ruolo `owner` o `admin` di INSERT/UPDATE/DELETE su:
- bucket `talent-media`
- bucket `avatars`

Le policy esistenti per i talent (auth.uid = folder) restano invariate.

### 2. `MediaGallerySection.tsx`
Quando `externalProfileId` è presente:
- Usare `useUploadMediaByProfileId` (passando `profileId` + `userId` del talent) al posto di `useUploadMedia`.
- Per il re-crop di una foto esistente, passare `externalUserId` invece di `user?.id` a `useReplaceMediaFile` (così il file viene caricato nella cartella del talent, coerente con le policy).

### 3. `ProfilePhotoSection.tsx`
Già usa correttamente `targetUserId = profile?.user_id` per l'avatar: nessuna modifica al codice, ma serve la policy storage del punto 1 per farlo funzionare.

## File coinvolti
- `supabase/migrations/<nuova>.sql` — nuove policy storage per owner/admin
- `src/components/profile/MediaGallerySection.tsx` — routing condizionale degli hook upload/replace

## Verifica
1. Login come admin → apri `/owner/talents/:profileId/edit` di un talent appena creato.
2. Carica una foto in "Foto principali" → compare nella griglia.
3. Cambia la foto profilo → si aggiorna.
4. Login come talent stesso → vede le foto caricate dall'admin e può ancora caricarne/eliminarne le proprie.

## Fuori scope
- Nessuna modifica alle policy della tabella `talent_media` (già permettono owner/admin via policy esistenti — da confermare durante l'implementazione).
- Nessun cambio al flusso di pubblicazione profilo.