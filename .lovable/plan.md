# Colonna avatar + "N in shortlist" nelle righe dei ruoli

## Obiettivo

In ogni riga della lista "Ruoli" (pagina dettaglio casting) aggiungere una colonna con lo
stack di avatar già usato nelle righe dei casting (3 foto + "+N") e, di fianco, la scritta
con il numero di talent in shortlist, ad esempio `13 in shortlist`.

## Come appare una riga

```text
Desktop
[icon] Nome ruolo        (o)(o)(o) +10   13 in shortlist     ✓ 3 su 13 selezionati     (...) >

Mobile (righe impilate)
[icon] Nome ruolo                                          (...)
       (o)(o)(o) +10  13 in shortlist                        >
       ✓ 3 su 13 selezionati
```

Se la shortlist è vuota compare solo il testo `0 in shortlist` in grigio, senza avatar.

## Cosa viene fatto

1. **Componente avatar condiviso** — nuovo `src/components/talents/TalentAvatarStack.tsx`:
   prende l'elenco dei talent e mostra i primi 3 (avatar tondi con anello bianco, iniziali
   se manca la foto) più il pallino `+N` per i rimanenti. È lo stesso markup oggi scritto a
   mano dentro la riga dei casting: la riga dei casting viene riscritta per usare il
   componente, così il risultato visivo resta identico e c'è una sola copia del codice.

2. **Dati già disponibili** — la pagina dettaglio casting carica già tutti i talent dei
   ruoli (nome, cognome, foto) con una sola query. Viene aggiunta una mappa
   `talentsByRole` (talent ordinati per data di inserimento, gli stessi dell'ordine della
   scheda Shortlist) passata alle righe, senza nuove chiamate al database.

3. **Riga ruolo** (`src/components/castings/rounds/RoleCard.tsx`) — inserita la nuova
   colonna con `TalentAvatarStack` + testo `{N} in shortlist` (N = numero di talent in
   shortlist, lo stesso valore di `counts.total`). Il numero resta invariato rispetto a
   "X su Y selezionati", che non viene toccato. La griglia della riga passa da 3 a 4
   colonne su desktop; su telefono le informazioni si impilano (avatar+contatore, poi la
   riga dei selezionati), senza sovrapposizioni.

4. **Nessuna interazione nuova** — gli avatar e il contatore sono solo informativi (nessun
   hover, nessun clic): la riga nel complesso continua ad aprire il ruolo.

## Verifica

- Build e typecheck puliti.
- Anteprima con Playwright: aprire un casting con ruoli, controllare che ogni riga mostri
  gli avatar, il pallino `+N` quando i talent sono più di 3 e la scritta `N in shortlist`
  con il numero corretto; verificare anche una riga con shortlist vuota e una finestra
  stretta (nessuna sovrapposizione).
- Confronto visivo della lista casting prima/dopo: gli avatar dei casting non devono cambiare.

## Dettagli tecnici

- `TalentAvatarStack` props: `items` (con `profile_photo_url`, `first_name`, `last_name`),
  `max = 3`, `ringClassName` (default `ring-white`, per usare `ring-background` altrove).
- `OwnerCastingDetail`: `countsByRole` e `talentsByRole` compilati nello stesso ciclo su
  `allRoleTalents` (query `["all-role-talents", castingId, roleIds]`, ordinata per
  `created_at`).
- `RoundsByRoleBlock` e `RoleCard` ricevono il nuovo prop `talents: RoleTalentWithProfile[]`.
- `CastingRow`: sostituito lo stack inline con `TalentAvatarStack` (stesso rendering).
