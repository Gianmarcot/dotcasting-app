## Fix RLS upload logo — utente già `owner`

### Diagnosi
Eseguito controllo su `varetti96@gmail.com`:
- UID: `10f51330-a67d-4492-90ee-a179f35400e9`
- Ruoli in `public.user_roles`: **`owner`** ✓
- Funzione `public.is_staff` esistente, con EXECUTE concesso a `authenticated` ✓
- Policy `Staff can upload any avatar` su `storage.objects` con `WITH CHECK (bucket_id = 'avatars' AND public.is_staff(auth.uid()))` ✓
- Nessun file presente in `avatars/branding/` → upload mai riuscito.

Tutto è in ordine a livello di database. Il fallimento è quasi certamente dovuto al fatto che il tentativo è avvenuto **prima** che la migration precedente (estensione delle policy a tutti gli staff) fosse applicata, e la sessione del browser sta riusando lo stesso JWT/contesto.

### Azione richiesta a te
1. Logout dall'app
2. Login di nuovo
3. Riprovare l'upload del logo

### Hardening (in parallelo)
Aggiungo una policy esplicita e ridondante che consente l'INSERT/UPDATE/DELETE sul path `branding/*` del bucket `avatars` agli utenti con ruolo `owner` o `admin`, senza passare da `is_staff` — così l'upload funziona anche se in futuro `is_staff` venisse modificato.

```sql
DROP POLICY IF EXISTS "Owner/Admin can manage avatars branding" ON storage.objects;

CREATE POLICY "Owner/Admin can manage avatars branding"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'branding'
    AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'branding'
    AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  );
```

### Out of scope
- Nessun cambio al frontend
- Nessun cambio agli altri bucket / altre tabelle

Se dopo logout+login+migration di hardening continui a vedere lo stesso errore, ti chiederò uno screenshot del messaggio completo dal devtools per capire da quale operazione arriva esattamente.
