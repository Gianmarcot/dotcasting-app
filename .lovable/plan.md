

## Correzione layout ProfilePhotoSection: da flex-row a flex-col

### Problema
Il piano prevede avatar + info (nome, città, gender) in colonna verticale, ma attualmente il componente usa `flex items-center gap-6` (riga 80) che dispone tutto in riga.

### Modifica

**`src/components/profile/ProfilePhotoSection.tsx`**

- Riga 80: cambiare `flex items-center gap-6` → `flex flex-col items-center text-center gap-4`
- Rimuovere righe 100-114 (h3 "Foto profilo", paragrafo descrittivo, bottone "Cambia foto")
- Al loro posto, aggiungere sotto l'avatar: nome completo (`profile.first_name + last_name`), città/paese, gender — centrati

**`src/pages/talent/TalentProfile.tsx`**

- Creare griglia top `grid grid-cols-1 lg:grid-cols-3 gap-6` con ProfilePhotoSection (1/3) e ProfileCompletionBar (2/3)
- Rimuovere blocco nome/città/gender standalone (righe ~63-74)
- Rimuovere ProfilePhotoSection dalla sidebar destra

