# Pulsanti "Modifica ruolo" e "Elimina ruolo" nello stile del Design System

## Cosa cambia

- **"Modifica ruolo"** passa da voce sottolineata a pulsante secondario del design system: pillola bianca con bordo scuro, icona matita a sinistra. È lo stesso pulsante che già compare in alto a destra quando il pannello è chiuso, quindi i due punti di accesso all'editing avranno lo stesso aspetto.
- **"Elimina ruolo"** diventa un pulsante leggero: solo icona cestino e testo bordeaux (#a30a2b), senza bordo e senza fondo, come le altre azioni distruttive della piattaforma. Al passaggio del mouse compare il fondo crema degli altri pulsanti leggeri, e il testo resta bordeaux.
- **Posizione invariata**: "Modifica ruolo" resta subito sotto i dati del ruolo, "Elimina ruolo" ancorato in fondo al pannello.
- La sottolineatura sparisce da entrambi i comandi: non sono più link, sono pulsanti.

## Dove agisce la modifica

I due comandi sono scritti una sola volta nell'anatomia condivisa dei pannelli dettagli, usata sia dal pannello del ruolo sia da quello del casting. La modifica quindi si applica automaticamente anche a **"Modifica"** ed **"Elimina casting"**, mantenendo i due pannelli allineati come già fatto per titoli, etichette e punti di interruzione.

## Dettagli tecnici

- File toccato: `src/components/castings/DetailsPanelParts.tsx` (nessun altro file).
- `DetailsEditLink`: il `<button className="dc-link-action">` attuale è sostituito da `<Button variant="secondary" size="md" iconPosition="left" className="w-fit">` con `<Pencil />` e l'etichetta.
- `DetailsDeleteLink`: sostituito da `<Button variant="ghost" size="md" iconPosition="left" className="mt-auto w-fit text-brand-600 hover:text-brand-600">` con `<Trash2 />` e l'etichetta; `mt-auto` conserva l'ancoraggio in fondo.
- Icone a 20px (già previste dalla misura `md` del pulsante); lo spazio icona/testo passa da 12px a 8px, quello standard del pulsante.
- Nessun cambiamento a dati, permessi o comportamenti: `onEdit` e `onDelete` restano gli stessi, e con essi le finestre di conferma.
- La classe `.dc-link-action` resta invariata e in uso altrove (link "Vai al profilo", link social, dashboard talent).
- Verifica: anteprima sulla pagina del ruolo con pannello aperto, controllo sul riquadro beige su telefono, e controllo sul pannello del casting; poi build pulita.
