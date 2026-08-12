# Riorganizzazione pagina profilo talent con navigazione a sezioni

Trasformo `/talent/profile` da scroll continuo a doppia colonna in una pagina con rail di navigazione a 8 sezioni e un solo gruppo di campi visibile per volta. Nessuna modifica alla logica di salvataggio: le sezioni esistenti vengono solo riorganizzate.

## Struttura della pagina

```text
┌──────────────────────────────────────────────┐
│ Foto profilo + nome │ Forza del profilo      │  (invariata)
├──────────────┬───────────────────────────────┤
│ RAIL 30%     │ CONTENUTO SEZIONE 70%         │
│ ✓ Dati pers. │  [card della sezione attiva]  │
│ ● Contatti   │                               │
│ ○ Documenti  │                               │
│ ...          │  [Indietro]        [Avanti]   │
└──────────────┴───────────────────────────────┘
```

## Le 8 sezioni e i componenti riusati

1. Dati personali — `BasicInfoSection`
2. Contatti e indirizzo — `ContactInfoSection` + `AddressSection`
3. Documenti e fiscalità — `DocumentsSection` (include nazionalità, CF, passaporto, P.IVA, upload documento identità già aggiunto)
4. Aspetto fisico — `MeasurementsSection` (misure, taglie, etnia) + `PhysicalFeaturesSection` (capelli, occhi, segni particolari)
5. Bio, abilità e lingue — `AboutMeSection` + `AbilitiesSection` + `SkillsSection` + `LanguagesSection`
6. Lavoro e viaggi — `WorkInfoSection` + `TravelSection`
7. Ruoli e talenti — `TalentRolesSection`
8. Galleria media — `MediaGallerySection`

Tutti i campi attuali restano dov'erano, solo raggruppati; nessun componente di sezione viene riscritto.

## Rail di navigazione

- Voce = icona + etichetta + indicatore di stato:
  - spunta verde: sezione completa
  - pallino rosso: mancano campi obbligatori
  - pallino grigio: sezione facoltativa non iniziata
- Navigazione libera: click su qualsiasi voce apre subito quella sezione, nessun vincolo sequenziale.
- Voce attiva evidenziata (sfondo tenue + testo bordeaux), stile coerente con il design system (`rounded-md`, DM Sans 14px).

## Pulsanti Indietro / Avanti

In fondo alla colonna destra: "Indietro" (secondario) e "Avanti" (primario), disabilitati agli estremi. Cambiano sezione e riportano lo scroll in alto, senza limitare i salti dal rail.

## Responsive

Sotto `lg` il rail diventa una barra orizzontale scrollabile (chip con icona + indicatore) posizionata sopra il contenuto, con la sezione attiva a piena larghezza sotto.

## Note tecniche

- Nuovo componente `src/components/profile/ProfileSectionRail.tsx` con la definizione delle 8 sezioni (chiave, etichetta, icona, obbligatorietà) e il rendering di rail verticale/barra orizzontale.
- `src/pages/talent/TalentProfile.tsx` mantiene header e `ProfileCompletionBar`, aggiunge lo stato `activeSection` e monta solo i componenti della sezione attiva.
- Gli indicatori derivano dai check esistenti di `useProfileCompletion` (mappando ogni `anchor` alla nuova sezione), senza nuove query né modifiche al calcolo del punteggio.
- I suggerimenti in `ProfileCompletionBar`, che oggi puntano ad anchor, vengono collegati al cambio di sezione così restano cliccabili.
