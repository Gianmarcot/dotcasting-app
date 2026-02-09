
## Allineare la progress bar dell'onboarding allo stile del profilo

### Cosa cambia

Nel file `src/pages/talent/TalentOnboarding.tsx`:

1. **Sfondo della sezione progress** (righe 202-228): wrappare la barra e gli step indicator in un contenitore con sfondo `bg-[#ECE5DE]` e bordi arrotondati (`rounded-lg p-4`), come la card `ProfileCompletionBar`.

2. **Barra di progresso** (riga 204): aggiungere la classe `bg-white` al componente `<Progress>` per avere il track bianco, e portare l'altezza a `h-3` come nel profilo:
   - Da: `<Progress value={progress} className="h-2" />`
   - A: `<Progress value={progress} className="h-3 bg-white" />`

3. **Logo** (righe 197-200): sostituire il logo testuale con l'immagine `logo.png`, come gia fatto in Index e AuthPage:
   - Importare `logo from "@/assets/logo.png"`
   - Sostituire gli `<span>` con `<img src={logo} alt="dotCasting" className="h-8" />`

### Risultato
La barra di avanzamento dell'onboarding avra lo stesso aspetto visivo (sfondo beige, track bianco, indicatore primary, altezza 3) della barra di completamento profilo, e il logo sara coerente con il resto dell'app.
