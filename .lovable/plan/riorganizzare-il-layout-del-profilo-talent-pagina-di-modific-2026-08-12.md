# Riorganizzare il layout del Profilo Talent (pagina di modifica)

## Obiettivo

Ristrutturare `/talent/profile` (pagina di modifica del profilo talent): navegazione laterale con le sezioni a sinistra, a destra tutte le sezioni impilate una sotto l'altra in una sola colonna (niente più due colonne). I suggerimenti (barra di completezza) vanno in cima alla pagina; l'avatar con il nome viene inglobato nella prima sezione "Informazioni personali".

Solo modifiche di presentazione (layout). Nessuna modifica a schema, dati o logica di business.

## Layout attuale

- Riga 1: griglia 3 colonne — `ProfilePhotoSection` (avatar+nome) a sinistra, `ProfileCompletionBar` a destra.
- Riga 2: griglia 3 colonne — contenuto principale (2/3): Informazioni, Chi sono, Ruoli, Galleria, Misure, Segni, Abilità, Competenze, Lingue; sidebar destra (1/3): Contatti, Indirizzo, Documenti, Lavoro, Trasferte.

## Layout nuovo

```text
+--------------------------------------------------------------+
| Intestazione: "Il mio Profilo" + [Visualizza profilo pubblico]|
+--------------------------------------------------------------+
| ProfileCompletionBar  (suggerimenti)  — larghezza piena       |
+------------------+-------------------------------------------+
| Side-navigation  |  Informazioni personali  (avatar+nome)     |
| (sticky, sinistra)|  Chi sono                                 |
|  • Informazioni  |  Ruoli e Talenti                          |
|  • Chi sono      |  Galleria media                           |
|  • Ruoli ...     |  Misure e Aspetto                         |
|  • ...           |  Segni particolari                        |
|                  |  Ulteriori abilità                        |
|                  |  Competenze                               |
|                  |  Lingue                                   |
|                  |  Contatti                                 |
|                  |  Indirizzo                                |
|                  |  Documenti e Fiscalità                    |
|                  |  Lavoro                                   |
|                  |  Viaggi e Visti                           |
+------------------+-------------------------------------------+
```

## Modifiche previste

### 1. `src/pages/talent/TalentProfile.tsx` (ristrutturazione)
- Spostare `ProfileCompletionBar` in cima, a larghezza piena (subito sotto l'intestazione).
- Sostituire le due griglie con un layout a due colonne: `grid lg:grid-cols-[220px_1fr]` (o simile) con la side-navigation a sinistra e una **singola colonna** a destra contenente **tutte** le sezioni impilate in questo ordine: basic-info, about-me, talent-roles, media-gallery, measurements, physical-features, abilities, skills, languages, contact-info, address, documents, work-info, travel.
- Rimuovere `ProfilePhotoSection` dalla riga 1 (viene inglobato in Informazioni personali) e rimuovere la suddivisione in "contenuto principale / sidebar destra".
- Mantenere intestazione e pulsante "Visualizza profilo pubblico".

### 2. Nuovo `src/components/profile/ProfileSectionNav.tsx`
- Navegazione laterale sticky (es. `lg:sticky lg:top-24`), racchiusa in una `.dc-card`.
- Elenco di link-àncora alle sezioni usando gli `id` già presenti; ogni voce mostra la label del titolo della sezione.
- Scrollspy attivo: `IntersectionObserver` (o scroll listener) evidenzia la voce della sezione corrente; stile coerente col DS (`dc-link-action`, `rounded-md`, hover leggero `bg-muted/30`).
- Navigazione fluida con `scrollIntoView({ behavior: "smooth", block: "start" })` e `scroll-mt` sulle sezioni per compensare l'eventuale header sticky.
- Su schermi piccoli la colonna laterale è nascosta (`hidden lg:block`).

### 3. `src/components/profile/ProfilePhotoSection.tsx`
- Aggiungere una variante `embedded` (prop) che rende il blocco avatar+camera+nome **senza** il proprio `Card` wrapper, così può essere inserito dentro la card "Informazioni personali".
- La versione standalone (con Card) resta disponibile e invariata: viene ancora usata da `OwnerTalentEdit.tsx`.

### 4. `src/components/profile/BasicInfoSection.tsx`
- In cima alla card "Informazioni personali" rendere `<ProfilePhotoSection embedded />`: avatar cliccabile con fotocamera per l'upload, nome e città/paese.
- Mantenere invariati tutti i campi esistenti della sezione.

## Comportamento mobile
- Side-navigation nascosta sotto `lg`: su mobile le sezioni scorrono in una singola colonna (già il comportamento naturale). L'avatar+nome e i suggerimenti restano in cima.

## Cosa NON cambia
- Nessuna modifica a schema DB, RLS, hook di dati o logica di salvataggio.
- Tutte le sezioni e i loro campi restano identici; cambia solo posizione/raggruppamento visivo.
- `ProfilePhotoSection` standalone continua a esistere per la pagina di modifica owner.

## Verifica
- Build di tipo senza errori.
- Anteprima su `/talent/profile`: barra suggerimenti in cima, side-nav con scrollspy a sinistra, singola colonna di sezioni a destra, avatar+nome nella card "Informazioni personali".
