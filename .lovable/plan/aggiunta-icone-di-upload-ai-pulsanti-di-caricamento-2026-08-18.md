# Aggiunta icone di upload ai pulsanti di caricamento

## Obiettivo
Aggiungere l'icona `Upload` (lucide-react) a tutti i pulsanti della piattaforma dedicati al caricamento di file, mantenendo coerenza con il design system esistente.

## Componenti da modificare

### 1. `src/components/profile/v2/UploadBlock.tsx`
- Importare `Upload` da `lucide-react`.
- Aggiungere l'icona `Upload` a sinistra del label nel pulsante principale:
  - "Carica CV"
  - "Carica documento"
  - "Sostituisci" (quando un file è già presente)
- Mantenere `Loader2` animato al posto dell'icona durante `busy`.

### 2. `src/components/profile/v2/MediaCard.tsx` (VideoBlock)
- Importare `Upload` da `lucide-react`.
- Aggiungere l'icona `Upload` a sinistra del label:
  - "Carica un video"
  - "Sostituisci il video"
- Mantenere `Loader2` animato durante `busy`.

### 3. `src/components/profile/MediaUploadButton.tsx`
- Sostituire l'icona `Plus` con `Upload` nel pulsante trigger "Aggiungi".
- Mantenere `Loader2` durante `isPending`.
- Lasciare le icone `Image` e `Video` all'interno delle voci del dropdown.

### 4. `src/components/profile/MediaGallerySection.tsx`
- Sostituire l'icona `Plus` con `Upload` nel pulsante "Aggiungi foto" / "Aggiungi video".
- Mantenere `Loader2` durante `isUploading`.

### 5. `src/components/profile/DocumentsSection.tsx`
- L'icona `Upload` è già presente nei pulsanti "Carica documento" e "Sostituisci"; verificare che sia allineata al testo e rispetti le dimensioni del design system. Nessuna modifica se già corretta.

### 6. `src/components/owner/settings/AgencySettingsForm.tsx`
- L'icona `Upload` è già presente nel pulsante "Carica logo"; verificare allineamento. Nessuna modifica se già corretta.

## Dettagli di implementazione
- Utilizzare `Upload` da `lucide-react` per tutti i pulsanti di caricamento.
- Posizionare l'icona a sinistra del testo (`mr-2` o equivalente), come già usato per `Plus`/`Camera`.
- Durante lo stato di caricamento (`busy`/`isPending`/`isUploading`), mostrare `Loader2` al posto dell'icona statica, mantenendo la stessa spaziatura per evitare salti.
- Non modificare i pulsanti che non sono dedicati al caricamento (es. "Aggiungi città", "Aggiungi lingua", "Aggiungi competenza"), che rimangono con `Plus`.
- Non modificare i pulsanti foto avatar/profilo (es. "Le mie foto"), che rimangono con `Camera`.

## Verifica
- Verificare visivamente che ogni pulsante "Carica..." / "Sostituisci..." relativo a file mostri l'icona di upload.
- Verificare che durante il caricamento lo spinner non generi salti di layout.
- Verificare che nessun pulsante non-upload abbia cambiato icona.
