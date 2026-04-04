## Creazione casting con AI e input vocale

### 1. Edge Function `generate-casting`
- Endpoint che riceve il testo dell'owner e chiama Lovable AI (google/gemini-2.5-flash) per generare il JSON strutturato
- Prompt di sistema che istruisce il modello a restituire solo JSON valido con la struttura richiesta
- Validazione input e output, CORS, autenticazione JWT

**Nota:** Useremo Lovable AI (modelli supportati nativamente) invece di Anthropic, così non serve nessuna API key aggiuntiva.

### 2. Componente `AICastingCreator`
- Campo di testo espandibile con badge "AI Beta"
- Pulsante microfono (Web Speech API nativa, nascosto se non supportato)
- Indicatore visivo registrazione in corso (pulsante che pulsa)
- Pulsante "Genera casting" 
- Prompt suggeriti come hint cliccabili sotto il campo
- Stati: idle, recording, transcribing, generating, success, error

### 3. Integrazione in `OwnerCastings.tsx`
- Componente posizionato in cima alla pagina, sopra i filtri
- Al successo: crea casting + ruoli nel DB, poi avvia il matching automatico dei talent per ogni ruolo
- Il casting appare in lista con badge "Generato con AI"
- In caso di errore, mostra messaggio e mantiene il testo

### 4. Logica di matching automatico
- Riutilizza la logica esistente di `useTargetMatching` per trovare i talent compatibili con ogni ruolo
- I talent con score più alto vengono aggiunti automaticamente come `role_talents`

### File da creare/modificare

| File | Azione |
|------|--------|
| `supabase/functions/generate-casting/index.ts` | Creare edge function |
| `src/components/castings/AICastingCreator.tsx` | Nuovo componente UI |
| `src/hooks/useAICasting.ts` | Hook per generazione e creazione |
| `src/pages/owner/OwnerCastings.tsx` | Integrare il componente |
