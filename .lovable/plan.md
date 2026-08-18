# Rifiniture spaziature e pulsanti — profilo talent

Solo presentazione, nessuna modifica di logica o dati. Interventi centralizzati sui primitivi in `src/components/profile/fields/FormFields.tsx` e poi allineamento delle 9 card in `src/components/profile/v2/`.

## Cosa cambia

1. **Pulsanti foto primary**: "Le mie foto" (HeadCard) e "Tutte le foto" (MediaCard) passano da `variant="secondary"` a primary (variante default), mantenendo dimensione e icona attuali.

2. **Divider a 32px**: `SectionDivider` ottiene margine verticale fisso di 32px sopra e sotto, indipendente dallo `space-y` del contenitore, rimuovendo le classi ad hoc oggi presenti (es. `mb-6` in RolesCard).

3. **Label → radio: 32px**: introdurre uno spacing dedicato tra la label di gruppo e il gruppo radio, applicato in tutti i punti che usano `ProfileRadioGroup` / `YesNoRadio` (HeadCard: Sesso, Identità di genere, Rappresentanza; PhysicalCard: allergie; BioCard: band; WorkTravelCard: automobile/moto; e ogni altra occorrenza).

4. **"Social media" come titolo di gruppo**: in ContactsCard passa da `GroupLabel` a `GroupHeading` (16px, mb-32px), coerente con "Residenza", "Dati bancari".

5. **Righe di checkbox: 24px**: i gruppi con molte checkbox (PhysicalCard segni particolari, WorkTravelCard patenti, BioCard abilità) usano gap verticale 24px tra righe, mantenendo la griglia orizzontale esistente.

6. **Righe di campi: 32px**: lo spacing verticale standard tra righe di campi diventa 32px — `SectionCard` passa da `space-y-6` a spacing 32px, e i blocchi interni con `space-y-4 sm:space-y-8` / `space-y-6` vengono normalizzati a 32px.

## Note tecniche

- Nuove utility/prop nei primitivi (es. `RadioField` o classe di spacing) per evitare valori sparsi card per card.
- Nessuna modifica alla sidebar, alla sezione foto profilo o al comportamento di salvataggio.
- Verifica finale con typecheck e screenshot Playwright su `/talent/profile` (desktop e mobile) per controllare che 32px/24px siano rispettati e che i divider restino inset nel padding.
