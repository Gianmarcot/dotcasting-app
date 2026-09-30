# Menu mobile: angoli più stondati e voce attuale come sul desktop

## Cosa cambia

**1. Pannello del menu più stondato in alto**: gli angoli superiori passano da 10px a 32px. Il pannello resta della stessa altezza e con lo stesso comportamento (si apre dal basso, si chiude toccando fuori).

**2. Voce della pagina attuale identica al desktop**: banda rossa brand a tutta larghezza, testo e icona bianchi, testo in grassetto. Il pallino introdotto ieri viene tolto. Le altre voci restano come oggi (testo scuro su fondo chiaro).

**3. Il numerino delle comunicazioni resta leggibile anche sulla riga rossa**: diventa chiaro con fondo rosso più tenue, così non sparisce dentro il rosso.

**4. Evidenziazione come sul desktop anche dentro le pagine "figlie"**: aprendo il dettaglio di un casting, nel menu risulta attiva la voce "I miei Casting" (oggi nessuna voce lo è).

Nota: l'arrotondamento a 32px vale per il menu dell'area talent. I menu simili dell'area agenzia restano come sono; se vuoi allinearli, dimmelo.

## Dettagli tecnici

- `src/components/layout/TalentMobileNavbar.tsx`:
  - `<DrawerContent className="rounded-t-[32px]">` — override locale del `rounded-t-[10px]` del componente drawer condiviso, che non viene modificato
  - voce attiva: stessa regola del desktop (`pathname === item.href` oppure `pathname.startsWith(item.href + "/")`)
  - riga attiva: `bg-primary text-primary-foreground font-bold`; rimossi `text-foreground`, `hover:bg-muted`, `relative` e lo span del pallino
  - righe non attive: invariate (`text-foreground`, `hover:bg-muted`)
  - badge sulla riga attiva: `bg-primary-foreground/25 text-primary-foreground` (invariato sulle righe non attive)
  - icona: eredita il colore del testo, quindi bianca sulla riga attiva
- Nessuna modifica a database, regole di accesso o al componente drawer usato altrove

## Verifica

- Su telefono (393px) menu aperto: raggio angoli superiori = 32px; voce attuale con banda rossa, testo bianco in grassetto, nessun pallino; scritte ancora allineate tra le righe; numerino leggibile
- Dal dettaglio casting: "I miei Casting" risulta evidenziato
- Controllo codice e build
