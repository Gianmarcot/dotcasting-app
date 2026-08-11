# Allineamento form registrazione / profilo talent

Interventi in ordine di priorità, con nota di chiusura per ciascun punto.

## Priorità alta

**1. Tassonomia ruoli unica**
Estendere `TALENT_ROLES` in `src/lib/profileOptions.ts` con le voci mancanti:
- Artistici: Comparse, Comici
- Tecnici creativi: Art Directors, Copywriters, Nail Specialists, Stylists, Prop Stylists, Food Stylists, Scenografi
- Produzione: Accounts, Project Managers

L'onboarding smette di usare la sua lista locale di 7 categorie e mostra gli stessi 3 gruppi del profilo (chip selezionabili raggruppati), scrivendo sempre su `talent_categories`.

**2. Upload documento d'identità**
Nella sezione "Documenti e Fiscalità" nuovo campo di upload (immagine o PDF) salvato nello storage e persistito in `id_document_url`, con anteprima/link al file caricato e possibilità di sostituzione. Nessuna modifica di schema.

**3. Etnia**
Select "Etnia" (opzioni `ETHNICITIES` già presenti) nella sezione Misure e Aspetto, salvato su `profiles.ethnicity`.

**4. Maggiore età derivata**
Il flag 18+ non viene più trattato come dato da salvare: diventa una validazione sulla data di nascita (blocco del passo/salvataggio con messaggio se la data indica meno di 18 anni). Il checkbox scollegato viene rimosso.

## Priorità media

**5. Genere in onboarding**
Sostituire il select misto con lo stesso modello del profilo: "Sesso" (radio M/F → `gender`) e "Identità di genere" (select `GENDER_IDENTITIES` → `gender_identity`).

**6. Rappresentanza non duplicata**
Il campo resta solo in "Ruoli e Talenti" (contesto più coerente) e viene rimosso da "Dati anagrafici"; unica scrittura su `representation_type`.

## Priorità bassa

**7. WhatsApp = Telefono**
Checkbox "Uso lo stesso numero anche per WhatsApp" nella sezione Contatti: se attivo copia prefisso e numero dal telefono e disabilita i campi WhatsApp; se disattivo li rende di nuovo editabili.

**8. Foto profilo vs avatar**
Distinzione esplicita: l'avatar resta opzionale, mentre la prima foto della categoria "Foto principali" è richiesta (segnalata come obbligatoria nel completamento profilo e nella galleria).

**9. Minimo foto principali** — resta 4, invariato: soglia confermata come intenzionale.

**10. AppearanceSection** — verificato non importato da nessuna pagina: il file viene rimosso.

**11. Colonne DB non usate** — `measurements`, `clothing_sizes`, `availability`, `other_tags` restano in tabella, nessuna migrazione; documentate come non alimentate dalla UI attuale.

**12. Crop 2:3 sui video** — verificato: il crop parte solo per le categorie foto, i video vengono caricati direttamente. Nessun bug, nessuna modifica.

## Note tecniche

- File toccati: `src/lib/profileOptions.ts`, `src/pages/talent/TalentOnboarding.tsx`, `src/components/profile/DocumentsSection.tsx`, `MeasurementsSection.tsx`, `ContactInfoSection.tsx`, `BasicInfoSection.tsx`, `TalentRolesSection.tsx`, `MediaGallerySection.tsx`, `src/hooks/useProfileCompletion.ts`, rimozione di `AppearanceSection.tsx`.
- Nessuna migrazione di schema: tutti i campi usano colonne esistenti (`id_document_url`, `ethnicity`, `gender`, `gender_identity`).
- Upload documento nel bucket storage già usato per i media talent, con percorso per utente e policy esistenti verificate prima dell'uso.
- UI in italiano, componenti e stili del design system esistente.
