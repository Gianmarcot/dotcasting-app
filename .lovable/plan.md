## Obiettivo
Nelle card del database talenti (`/owner/talents`), la banda nera piena in basso (`bg-[#1a1a1a]/90`) verrà sostituita con un overlay con fade gradiente, in modo che il testo (nome + meta) galleggi su una sfumatura da trasparente (alto) a nero (basso), lasciando vedere la foto sottostante.

## Modifica
File: `src/components/talents/TalentBoardCard.tsx` (righe 123-129)

- Aumentare l'altezza dell'area inferiore per ospitare il fade.
- Cambiare `bg-[#1a1a1a]/90 px-3 py-2` in un gradiente: `bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-10 pb-2 px-3`.
- Mantenere `text-white` su nome e `text-white/80` sul meta per leggibilità.
- Nessun'altra modifica al layout, alla logica hover o agli indicatori materiali.

## Nessuna modifica
- Lista, filtri, dati, modalità portfolio non vengono toccati.
