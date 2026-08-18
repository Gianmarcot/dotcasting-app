Centrare la barra sticky di salvataggio del profilo rispetto all'area main, esclusa la sidebar

## Obiettivo
La `ProfileSaveBar` attualmente è centrata con `left-1/2 -translate-x-1/2`, quindi rispetto all'intera viewport. Questo la fa apparire spostata verso destra quando è presente la sidebar fissa a sinistra. L'obiettivo è centrarla invece rispetto all'area di contenuto principale (main), escludendo la sidebar.

## Contesto verificato
- Il profilo talent usa `TalentLayout`, dove la sidebar è fissa a `md:left-64` (16rem = 256px).
- Il main inizia a `md:left-64` e ha padding/sfondo arrotondato.
- `ProfileSaveBar` è posizionata con `fixed` e usa `left-1/2 -translate-x-1/2` per centrarsi nella viewport.

## Modifica proposta
Aggiornare `src/components/profile/v2/ProfileSaveBar.tsx` per applicare un offset orizzontale pari alla metà della larghezza della sidebar (128px) su desktop, mantenendo il centraggio pieno su mobile.

```text
Viewport:  |--- sidebar 256px ---|------ main area ------|
Ora:            barra centrata qui ------------------>
Dopo:                          barra centrata qui ---->
```

### Dettagli tecnici
- Su `md` e superiori: usare `left-[calc(50%+8rem)]` (8rem = 128px = metà sidebar 256px) al posto di `left-1/2`.
- Su mobile la sidebar non è visibile, quindi lasciare `left-1/2`.
- Mantenere `z-40`, transizioni, larghezza pill e funzionalità di salvataggio esistenti.
- Non modificare il layout generale o la sidebar.

## Verifica
- Visualizzare `/talent/profile` con modifiche non salvate.
- Confermare che la pill dark sia centrata rispetto alla zona bianca del contenuto, non rispetto all'intero schermo.
- Verificare che su viewport mobile (senza sidebar) resti centrata a viewport piena.
