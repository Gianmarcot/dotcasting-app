/**
 * Persistent reminder shown on the talent "I miei casting" list.
 * Kept as a standalone component so it can be removed with a one-line change.
 */
export const PersistentNotice = () => (
  <aside className="w-full md:w-[512px] shrink-0 bg-[#ece5de] p-6 rounded-3xl md:rounded-tr-none animate-scale-fade-in">
    <p className="text-left md:text-right text-[15px] leading-[1.4] text-[#1a1a1a]">
      Ti contattiamo sempre anche direttamente. Questa pagina è un promemoria dei tuoi ingaggi, non
      l'unico canale.
    </p>
  </aside>
);
