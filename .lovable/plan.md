## Obiettivo
Ridisegnare la sidebar admin globale e la pagina "Casting" secondo lo screenshot allegato: layout più pulito, filtri semplificati, tabella con header di colonna e azioni rapide in hover.

## 1. Sidebar (`src/components/layout/OwnerSidebar.tsx`)

**Logo/Header**
- Rimuovere il badge pillola rossa "Admin".
- Aggiungere label testuale `ADMIN` accanto al logo (Tenor Sans, tracking wide, colore `text-white/70`).

**Nav principale**
- Invariata: Dashboard, Database Talenti, Casting, Centro Messaggi, CRM Aziende.

**Sezione Preferiti**
- Header "PREFERITI" (uppercase, tracking, muted), niente chevron collassabile — sempre aperta.
- Stella ambra piena (`text-amber-400`, non bordeaux) accanto a ciascun titolo di casting.
- Link finale "Visualizza tutti" con `ChevronRight` allineato a destra, che punta a `/owner/castings?favorites=1`.
- Stato vuoto: "Nessun preferito" muted.

**Footer utente**
- Sostituire l'iniziale email con un `<Avatar>` che usa `profile.profile_photo_url` (fallback iniziali).
- Nome completo su più righe: `first_name` + `last_name` su due righe (uppercase, Tenor Sans) — leggere da `useProfile()`.
- Notifiche / Impostazioni / Logout invariati sotto.

## 2. Header pagina Casting (`src/pages/owner/OwnerCastings.tsx`)
- Rimuovere il sottotitolo "Gestisci i casting della piattaforma".
- Titolo `CASTING` (già uppercase via `it.backoffice.castings`).
- Bottone "+ Nuovo casting" (pill bordeaux) allineato a destra.

## 3. Filtri (`src/components/castings/CastingFilters.tsx`)
Riscrittura del componente:
- Sostituire i `Tabs` (Tutti/Bozza/Attivo/Chiuso) con un unico `Select` "Tutti / Bozza / Attivo / Archiviato".
- Campo di ricerca al centro, placeholder `Cerca per parola chiave`, pill arrotondata piena larghezza.
- Nuovo `Select` di ordinamento allineato a destra: "Più recenti" (default), "Cliente", "Stato".
- Le nuove prop `sort` / `onSortChange` vanno propagate dall'`OwnerCastings` e passate a `useCastings` per ordinare la query (`order()` sul campo scelto).

## 4. Tabella (`OwnerCastings.tsx` + `CastingRow.tsx`)

**Contenitore**
- Rimuovere il wrapping `rounded-2xl border bg-white` per la tabella; le righe poggiano sullo sfondo cream della pagina, separate da un hairline `border-b border-border/40`.
- Aggiungere una riga header con etichette: (colonna stella vuota) · `Titolo` · `Selezione` · `Stato` · (azioni vuote).

**Riga (`CastingRow.tsx`)**
- Stella: usare colore ambra (`text-amber-400` fill quando attiva, `text-muted-foreground` contorno quando no). Aggiornare `FavoriteCastingStar` per accettare una variante `amber`.
- Colonna Titolo: solo il titolo del casting, senza company/date/location.
- Colonna Selezione: stack di avatar sovrapposti dei talent selezionati (fino a 4) + testo `+ altri N`.
  - Serve un nuovo hook o join per recuperare gli avatar dei talent con `role_talents.company_status = 'confirmed'` per casting.
  - Estendere `useCastings` per includere `selected_talents:role_talents(profile:profiles(profile_photo_url))` filtrato per `company_status = 'confirmed'` limite 5.
- Colonna Stato: pallino + label dello stesso colore.
  - Bozza → ambra (`text-amber-600`)
  - Attivo → verde (`text-[#729128]`)
  - Archiviato → grigio (rinominare "Chiuso" in "Archiviato" in `src/lib/i18n.ts` → `it.casting.closed = "Archiviato"`).

**Azioni riga**
- Rimuovere completamente il `DropdownMenu` a tre puntini.
- In hover riga: sfondo `bg-muted/60` (già presente), + rivelare due icon-button:
  - Matita bordeaux (tooltip "Modifica rapida") → apre il `CastingFormDialog` già esistente.
  - Cestino (tooltip "Elimina") → apre `DeleteCastingDialog`.
- Chevron `>` a destra sempre visibile → naviga a `/owner/castings/:id`.
- Le azioni di cambio stato (Pubblica/Chiudi/Riapri/Torna a bozza) non sono più raggiungibili dalla lista.

## 5. Cambio stato spostato in OwnerCastingDetail
- Nella pagina di dettaglio (`src/pages/owner/OwnerCastingDetail.tsx`), verificare la presenza di controlli per cambiare stato. Se mancano, aggiungere accanto al titolo un piccolo `Select` o un gruppo di bottoni (Pubblica / Torna a bozza / Archivia / Riapri) che chiamano `useUpdateCastingStatus`.

## 6. Copy / i18n
- `src/lib/i18n.ts`: cambiare `it.casting.closed` da "Chiuso" a "Archiviato" (verificare che non rompa altre pagine — se necessario introdurre chiave separata `archived`).

## Fuori scopo
- Nessuna modifica alla pagina pubblica del round.
- Nessuna modifica alla sidebar talent.
- Nessuna modifica allo schema DB.

## Dettagli tecnici
- Colore stella ambra: `text-amber-400` (Tailwind). Non aggiungere token custom, è un colore semantico "preferito" isolato.
- Stack avatar: usare `Avatar` di shadcn con `-ml-2` per overlap e `ring-2 ring-background`.
- Ordinamento: mappare "cliente" → `.order('company(name)')` (usare `foreignTable`); "stato" → `.order('status')`.
