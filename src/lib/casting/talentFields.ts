// =============================================================
// talentFields.ts — Registry dei campi talent (v2, completo)
// Unica fonte di verità per: template PDF, card web, checklist
// di creazione round. Copre tutti i campi di profiles +
// talent_attributes rilevanti per la comp card.
// Aggiungere un campo = aggiungere una riga qui (+ mapper).
// =============================================================

export interface Talent {
  id: string;
  nome: string; // stage_name o first_name + last_name
  // --- anagrafica
  eta?: number | null;          // calcolata da birth_date
  genere?: string | null;
  citta?: string | null;        // city (+ country se estero)
  nazionalita?: string | null;
  etnia?: string | null;
  citta_lavoro?: string[] | null; // work_cities
  // --- fisico
  altezza_cm?: number | null;
  peso_kg?: number | null;
  occhi?: string | null;
  capelli?: string | null;       // colore
  capelli_lunghezza?: string | null;
  capelli_tipo?: string | null;
  segni_particolari?: string[] | null; // composito: tatuaggi, piercing, lentiggini, diastema…
  // --- misure e taglie
  taglia_maglia?: string | null;
  taglia_pantaloni?: string | null;
  taglia_giacca?: string | null;
  taglia_reggiseno?: string | null;
  vita_cm?: number | null;
  petto_cm?: number | null;
  fianchi_cm?: number | null;
  larghezza_spalle_cm?: number | null;
  collo_cm?: number | null;
  numero_scarpe?: number | null;
  // --- competenze
  lingue?: string[] | null;
  abilita?: string[] | null;     // composito: abilities + ability_* con dettagli
  patenti?: string[] | null;
  disponibilita_viaggio?: string | null;
  // --- contatti
  email?: string | null;         // profiles.contact_email
  telefono?: string | null;
  whatsapp?: string | null;
  sito_web?: string | null;
  // --- foto
  photos: string[];
}

export type FieldGroup = "anagrafica" | "fisico" | "misure" | "competenze" | "contatti";

export interface FieldDef {
  key: string;
  label: string;
  group: FieldGroup;
  accessor: (t: Talent) => string | number | null | undefined;
  format?: (v: string | number) => string;
}

const cm = (v: string | number) => `${v} cm`;
const kg = (v: string | number) => `${v} kg`;
const list = (v?: string[] | null) => (v && v.length ? v.join(", ") : null);

export const FIELD_REGISTRY: FieldDef[] = [
  // --- anagrafica ---------------------------------------------------
  { key: "eta",               label: "Età",               group: "anagrafica", accessor: t => t.eta },
  { key: "genere",            label: "Genere",            group: "anagrafica", accessor: t => t.genere },
  { key: "citta",             label: "Città",             group: "anagrafica", accessor: t => t.citta },
  { key: "nazionalita",       label: "Nazionalità",       group: "anagrafica", accessor: t => t.nazionalita },
  { key: "etnia",             label: "Etnia",             group: "anagrafica", accessor: t => t.etnia },
  { key: "citta_lavoro",      label: "Città di lavoro",   group: "anagrafica", accessor: t => list(t.citta_lavoro) },
  // --- fisico --------------------------------------------------------
  { key: "altezza",           label: "Altezza",           group: "fisico", accessor: t => t.altezza_cm, format: cm },
  { key: "peso",              label: "Peso",              group: "fisico", accessor: t => t.peso_kg, format: kg },
  { key: "occhi",             label: "Occhi",             group: "fisico", accessor: t => t.occhi },
  { key: "capelli",           label: "Capelli",           group: "fisico", accessor: t => t.capelli },
  { key: "capelli_lunghezza", label: "Lunghezza capelli", group: "fisico", accessor: t => t.capelli_lunghezza },
  { key: "capelli_tipo",      label: "Tipo capelli",      group: "fisico", accessor: t => t.capelli_tipo },
  { key: "segni_particolari", label: "Segni particolari", group: "fisico", accessor: t => list(t.segni_particolari) },
  // --- misure e taglie (ordine = ordine di stampa) --------------------
  { key: "taglia_maglia",     label: "Taglia maglia",     group: "misure", accessor: t => t.taglia_maglia },
  { key: "taglia_pantaloni",  label: "Taglia pantaloni",  group: "misure", accessor: t => t.taglia_pantaloni },
  { key: "vita",              label: "Vita",              group: "misure", accessor: t => t.vita_cm, format: cm },
  { key: "larghezza_spalle",  label: "Larghezza spalle",  group: "misure", accessor: t => t.larghezza_spalle_cm, format: cm },
  { key: "numero_scarpe",     label: "Numero di scarpe",  group: "misure", accessor: t => t.numero_scarpe },
  { key: "taglia_giacca",     label: "Taglia giacca",     group: "misure", accessor: t => t.taglia_giacca },
  { key: "petto",             label: "Petto",             group: "misure", accessor: t => t.petto_cm, format: cm },
  { key: "fianchi",           label: "Fianchi",           group: "misure", accessor: t => t.fianchi_cm, format: cm },
  { key: "collo",             label: "Collo",             group: "misure", accessor: t => t.collo_cm, format: cm },
  { key: "taglia_reggiseno",  label: "Taglia reggiseno",  group: "misure", accessor: t => t.taglia_reggiseno },
  // --- competenze ------------------------------------------------------
  { key: "lingue",            label: "Lingue",            group: "competenze", accessor: t => list(t.lingue) },
  { key: "abilita",           label: "Abilità",           group: "competenze", accessor: t => list(t.abilita) },
  { key: "patenti",           label: "Patenti",           group: "competenze", accessor: t => list(t.patenti) },
  { key: "disponibilita_viaggio", label: "Disponibilità viaggio", group: "competenze", accessor: t => t.disponibilita_viaggio },
  // --- contatti --------------------------------------------------------
  { key: "email",             label: "Email",             group: "contatti", accessor: t => t.email },
  { key: "telefono",          label: "Telefono",          group: "contatti", accessor: t => t.telefono },
  { key: "whatsapp",          label: "WhatsApp",          group: "contatti", accessor: t => t.whatsapp },
  { key: "sito_web",          label: "Sito web",          group: "contatti", accessor: t => t.sito_web },
];

export const GROUP_LABELS: Record<FieldGroup, string> = {
  anagrafica: "Anagrafica",
  fisico: "Caratteristiche fisiche",
  misure: "Misure e taglie",
  competenze: "Lingue e abilità",
  contatti: "Contatti talent",
};
