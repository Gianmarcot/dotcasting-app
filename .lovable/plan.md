Fix del flash del border-radius durante il cambio slide nel pannello sinistro di `/auth`.

Il pannello ha già `overflow-hidden md:rounded-r-[2rem]`, ma durante la transizione `opacity` delle immagini `absolute inset-0` il browser può perdere il clipping agli angoli per un fotogramma.

Soluzione: applicare lo stesso `md:rounded-r-[2rem]` direttamente alle immagini dello slider in modo che si auto-clip anche se il contenitore padre fallisce temporaneamente il clip durante la transizione. Nessuna modifica a logica o layout.

File: `src/pages/AuthPage.tsx` (solo le className delle `<img>` dello slider).