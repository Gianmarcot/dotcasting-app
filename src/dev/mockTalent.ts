import { Talent } from "@/lib/casting/talentFields";

export const MOCK_TALENT: Talent = {
  id: "mock-talent-1",
  nome: "Giulia Sara Carolina Ameglio",
  // anagrafica
  eta: 27,
  genere: "Femmina",
  citta: "Milano",
  nazionalita: "Italiana",
  etnia: "Caucasica",
  citta_lavoro: ["Milano", "Roma", "Torino"],
  // fisico
  altezza_cm: 176,
  peso_kg: 58,
  occhi: "Verdi",
  capelli: "Castano chiaro",
  capelli_lunghezza: "Lunghi",
  capelli_tipo: "Mossi",
  segni_particolari: ["Diastema", "Lentiggini", "Tatuaggio piccolo polso"],
  // misure
  taglia_maglia: "S / 38",
  taglia_pantaloni: "26 / 40",
  taglia_giacca: "38",
  taglia_reggiseno: "32B",
  vita_cm: 65,
  petto_cm: 90,
  fianchi_cm: 100,
  larghezza_spalle_cm: 56,
  collo_cm: 33,
  numero_scarpe: 41,
  // competenze
  lingue: ["Italiano (madrelingua)", "Inglese (C1)", "Francese (B2)", "Spagnolo (A2)"],
  abilita: ["Equitazione", "Yoga", "Nuoto", "Sci", "Recitazione"],
  patenti: ["B", "A2"],
  disponibilita_viaggio: "Sì, anche all'estero",
  // contatti
  email: "giulia.ameglio@example.it",
  telefono: "+39 333 1234567",
  whatsapp: "+39 333 1234567",
  sito_web: "www.giuliaameglio.it",
  // foto
  photos: [
    "https://picsum.photos/seed/talent1/900/1200",
    "https://picsum.photos/seed/talent2/900/1200",
    "https://picsum.photos/seed/talent3/900/1200",
    "https://picsum.photos/seed/talent4/900/1200",
    "https://picsum.photos/seed/talent5/900/1200",
    "https://picsum.photos/seed/talent6/900/1200",
    "https://picsum.photos/seed/talent7/900/1200",
    "https://picsum.photos/seed/talent8/900/1200",
  ],
};
