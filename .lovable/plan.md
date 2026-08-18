# Barra di salvataggio profilo — stile pill dark

Sostituire l'attuale barra sticky larga (max 1040px, fondo sabbia) della pagina profilo talent con la stessa pill compatta usata nella pagina di invio cliente, in versione dark.

## Cosa cambia (solo presentazione)

- Pill centrata in basso (`fixed bottom-6`, centrata), larghezza `min(560px, calc(100vw-2rem))`, altezza 80px, `rounded-full`, ombra forte.
- Fondo dark (charcoal `#1A1A1A`) con testo chiaro, come inverso della pill chiara `#F5F0E8` della pagina cliente.
- A sinistra: pallino bordeaux con icona (matita/check) + testo "N modifiche non salvate" (numero in bold, resto a opacità ridotta).
- A destra: "Annulla" come link/ghost chiaro discreto + pulsante primario bordeaux `rounded-full h-12` "Salva" con spinner durante il salvataggio.
- Animazione di entrata/uscita conservata (translate + opacity, appare solo quando ci sono modifiche).
- Su mobile: testo abbreviato ("N modifiche"), pill che resta su una riga.

## Nessun cambio funzionale

Logica di `ProfileFormContext` (isDirty, dirtyCount, save, reset) e la guardia di uscita restano identiche.

## Dettagli tecnici

- File modificato: `src/components/profile/v2/ProfileSaveBar.tsx` (riscrittura del solo markup/classi).
- Colori tramite token esistenti (`bg-primary`, `text-primary-foreground`) + charcoal della palette admin; nessun nuovo token.
- La pill della pagina cliente in `src/pages/shared/SharedRound.tsx` non viene toccata.
