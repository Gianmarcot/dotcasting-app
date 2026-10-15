# Nuovo layout delle modali

## Cosa cambia per l'utente
- **Pulsante chiudi**: la piccola X in alto a destra viene sostituita dallo stesso pulsante scuro tondo usato nelle finestre a tutto schermo (anteprima talent, gestione media), con lo stesso posizionamento in alto a destra.
- **Titolo**: stesso stile di oggi, ma con peso medio (né regular né bold).
- **Spaziatura**: padding interno più ampio (da 24px a 40px su desktop, 24px su mobile) e più distanza tra titolo e contenuto (da 16px a 32px). Il footer con i pulsanti resta separato dal contenuto con la stessa distanza.
- **Quattro misure**:
  - **Small** (~440px): avvisi e conferme (es. "Vuoi uscire senza salvare?", eliminazioni).
  - **Medium** (~600px): form brevi (nuova conversazione, crea talent, esporta, azienda, messaggio in blocco, candidatura, ritaglio foto).
  - **Large** (~880px): form lunghi o liste (casting, ruolo, target, broadcast, dettaglio talent, risultati e shortlist target).
  - **Fullscreen**: identico alla gestione media nel profilo talent — sale dal basso fino a 24px dal bordo superiore, angoli superiori arrotondati, velo chiaro, stesse animazioni e curve, pulsante "Chiudi" con etichetta fisso in alto. Lo usano già wizard degli invii e scelta talent, che verranno allineati a questo stile.
- Le modali con contenuto lungo scorrono internamente con titolo e pulsante chiudi sempre visibili.
- La pagina Design System riceve una sezione con un esempio per ogni misura.

## Assegnazione misure (proposta)
```text
small      avvisi/conferme (tutte le finestre di conferma), condivisione invio
medium     NewThread, CreateTalent, TalentExport, CompanyForm, BulkMessage,
           ApplyToCasting, CastingDetail, BatchSummary, ImageCrop
large      CastingForm, AddRole, CreateTarget, Broadcast, TalentDetailDialog,
           TargetShortlist, TargetMatchResults
fullscreen RoundWizard, TalentPicker, gestione media (riferimento)
```

## Dettagli tecnici
- `dialog.tsx`: `DialogContent` riceve prop `size: "sm" | "md" | "lg" | "fullscreen"` (default `md`); la X Radix diventa `ModalNavBar` dentro `DialogClose asChild`-equivalente (onClose chiama la chiusura via contesto Radix), etichetta "Chiudi" visibile solo in fullscreen.
- `alert-dialog.tsx`: default `sm`, stessa anatomia (senza pulsante chiudi, come previsto per le conferme).
- `src/index.css`: `.dc-dialog` con varianti `.dc-dialog-sm/md/lg/fullscreen`; padding `p-6 sm:p-10`, `gap-8`, max-height 90dvh con scorrimento interno, header con spazio a destra per il pulsante; `.dc-dialog-title` `font-medium`; overlay `bg-foreground/30` con le stesse durate/curve (400ms in, 250ms out, cubic-bezier(0.23,1,0.32,1)) della gestione media.
- Variante fullscreen estratta dalle classi di `MediaGalleryModal` (inset-x-0 bottom-0 top-6, rounded-t-3xl, `animate-slide-up-panel`, ModalNavBar sticky con `showCloseLabel`); `FullscreenSheet` riusa la stessa variante, e `MediaGalleryModal` passa a usarla senza cambi visivi.
- Rimozione nei singoli file delle classi `max-w-*`, `max-h-*`, `overflow-*` ora gestite dalla misura; `SharedRound` (finestra scura) mantiene i suoi colori con `size="sm"`.
- Regola registrata in `AGENTS.md`: ogni modale sceglie una delle quattro misure, niente larghezze ad hoc.
