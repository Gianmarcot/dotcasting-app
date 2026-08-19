# Badge "Nuovo" sui messaggi non letti (area talent)

## Passo 0 — Cosa dice lo schema (verificato)

La pagina "Messaggi/Comunicazioni" del talent (`/talent/communications`) legge la tabella
`communications`, non `messages` (quest'ultima serve alla chat operativa lato agenzia).

Colonne rilevanti trovate su `communications`:
- `talent_user_id uuid not null` → destinatario unico della riga
- `read_at timestamptz` → stato di lettura già presente
- `batch_id uuid` → un invio multiplo genera **una riga per talent**, quindi resta 1 destinatario per riga

**Caso riscontrato: CASO A** (un destinatario per riga, stato di lettura sulla riga stessa).
Nessuna tabella ponte necessaria. `read_at` esiste già: non va creata.

Policy attuali su `communications` (verificate): select/update consentiti solo se
`talent_user_id = auth.uid()` oppure staff. La update è però "per riga", non "per colonna":
il talent potrebbe teoricamente riscrivere anche titolo, corpo o payload della propria riga.
Questa è la ragione concreta per introdurre l'RPC.

## Passo 1 + 2 — Migrazione da proporre (non eseguita)

Da approvare prima di procedere:

- Indice parziale per i non letti:
  `create index ... on public.communications (talent_user_id) where read_at is null;`
- Funzione `public.mark_messages_read(message_ids uuid[])`, `security definer`,
  `set search_path = public`: imposta `read_at = now()` solo sulle righe con
  `talent_user_id = auth.uid()`, `id = any(message_ids)` e `read_at is null`.
  Idempotente, ignora in silenzio gli id non propri. Grant a `authenticated`.
- RLS resta attiva; nessuna nuova policy che esponga righe di altri talent.

La policy di UPDATE esistente non viene rimossa in questa migrazione perché serve ai flussi
già attivi (risposta di disponibilità, upload materiale). Segnalo il punto: se si vuole
restringerla alle sole colonne di risposta, è un intervento separato da concordare.

## Passo 3 — Comportamento client

In `TalentCommunications.tsx` (o in un piccolo hook dedicato):

- `useRef<Set<string>>` vuoto al mount: allo **primo caricamento riuscito** riceve gli id di
  tutti i messaggi con `read_at` nullo; ai refetch successivi si **aggiungono** i nuovi non
  letti, senza mai rimuovere.
- Il badge si mostra se e solo se l'id è nel Set — mai derivato da `read_at`.
- `mark_messages_read` chiamata **una sola volta per mount**, dopo il primo caricamento,
  con guardia `useRef<boolean>` letta e settata in modo sincrono (regge il doppio mount di
  StrictMode); nessuna chiamata se l'array è vuoto; nessun rollback e nessun errore mostrato
  in caso di fallimento.
- Il Set muore col mount: uscendo e rientrando i badge non ricompaiono.
- La marcatura per-messaggio esistente su apertura card resta invariata.

## Passo 4 — Badge

Nel footer della bolla (`CommunicationBubble`), a destra, dopo l'orario:
`15:29` · 12px · pallino 8px `--dot-unread` (`aria-hidden`) · 8px · testo "Nuovo".

Il testo "Nuovo" riusa esattamente lo stile del timestamp accanto (stessa famiglia,
dimensione, peso, colore). A messaggio letto il badge non compare affatto e l'orario resta
nella stessa posizione. Nessun'altra modifica a layout, colori o geometria della bolla.

Token nuovo in `src/index.css`, accanto agli altri, contesto per contesto:
`base`/`muted` → `var(--brand-600)`; `brand`/`inverse` → `var(--cream)`.

## Fuori scopo

Nessun contatore in navigazione, nessun realtime, nessun "segna come non letto".

## Nota tecnica

File toccati: `supabase/migrations` (via strumento di migrazione), `src/index.css`,
`src/components/communications/CommunicationBubble.tsx`,
`src/components/communications/CommunicationCard.tsx`,
`src/pages/talent/TalentCommunications.tsx`, `src/hooks/useCommunications.ts`.
