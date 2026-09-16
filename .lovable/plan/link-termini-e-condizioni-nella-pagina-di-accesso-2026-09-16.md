# Link Termini e condizioni nella pagina di accesso

## Obiettivo
Aggiungere in fondo alla pagina di accesso/registrazione un link discreto ai Termini e condizioni ospitati su Iubenda.

## Cosa cambia
- Sotto il pulsante "Hai già un account? / Non hai un account?" compare una riga a piè di pagina con il link "Termini e condizioni".
- Il link apre https://www.iubenda.com/termini-e-condizioni/35556124 in una nuova scheda.
- Stile coerente con gli altri testi secondari della pagina: testo piccolo, colore tenue, sottolineato al passaggio del mouse.
- Anche la casella di consenso in registrazione, che oggi punta a una pagina interna inesistente, viene aggiornata allo stesso indirizzo Iubenda.

## Dettagli tecnici
- File: `src/pages/AuthPage.tsx`.
- Aggiungere una costante con l'URL dei termini e usarla sia nel footer sia nella label della `ProfileCheckbox` (attualmente `href="/termini"`).
- Footer: `<a target="_blank" rel="noopener noreferrer">` in un contenitore centrato, `text-xs text-muted-foreground`.
- Nessuna modifica a componenti condivisi, logica di autenticazione o database.
