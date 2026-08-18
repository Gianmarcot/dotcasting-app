// =============================================================
// talentDetailData.ts — Costruisce le sezioni in sola lettura
// della modale di dettaglio talent a partire da profiles +
// talent_attributes. Ordine, raggruppamenti e icone rispecchiano
// il form di modifica profilo (src/components/profile/v2).
// =============================================================

import {
  Briefcase,
  GraduationCap,
  IdCard,
  Mail,
  MapPin,
  Shirt,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { GENDERS, REPRESENTATION_TYPES } from "@/lib/profileOptions";

type Row = Record<string, unknown>;

export interface DetailField {
  label: string;
  value: string;
  /** occupa tutta la larghezza della colonna (es. indirizzo) */
  wide?: boolean;
}

export interface DetailSection {
  key: string;
  title?: string;
  icon?: LucideIcon;
  fields: DetailField[];
  /** ruoli mostrati come pill non cliccabili */
  pills?: string[];
}

// ---------- helper ------------------------------------------------
const s = (v: unknown): string => (typeof v === "string" ? v.trim() : v == null ? "" : String(v));
const num = (v: unknown, suffix = ""): string =>
  v === null || v === undefined || v === "" ? "" : `${v}${suffix}`;
const yesNo = (v: unknown): string => (v === true ? "Sì" : v === false ? "No" : "");
const list = (v: unknown): string =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).join(", ") : "";

const date = (v: unknown): string => {
  const raw = s(v);
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const labelFrom = (options: { value: string; label: string }[], v: unknown): string => {
  const raw = s(v);
  if (!raw) return "";
  return options.find((o) => o.value === raw)?.label ?? raw;
};

const phone = (prefix: unknown, number: unknown): string => {
  const n = s(number);
  if (!n) return "";
  return `${s(prefix)} ${n}`.trim();
};

interface AddressLike {
  street?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  province?: string;
  region?: string;
}

/** "Via e numero, Città, CAP, Stato" */
const composeAddress = (v: unknown): string => {
  if (!v || typeof v !== "object") return "";
  const a = v as AddressLike;
  return [a.street, a.city, a.postal_code, a.state]
    .map((x) => s(x))
    .filter(Boolean)
    .join(", ");
};

const push = (fields: DetailField[], label: string, value: string, wide = false) => {
  if (value) fields.push({ label, value, wide });
};

const SOCIALS: { key: string; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "Tiktok" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X (Twitter)" },
];

const MARKS: { key: string; label: string }[] = [
  { key: "has_vitiligo", label: "Vitiligine" },
  { key: "has_freckles", label: "Lentiggini" },
  { key: "has_diastema", label: "Diastema" },
  { key: "has_albinism", label: "Albinismo" },
  { key: "has_dwarfism", label: "Nanismo" },
  { key: "has_tattoos", label: "Tatuaggi" },
  { key: "has_piercings", label: "Piercing" },
];

const ABILITIES: { key: string; label: string; detail?: string }[] = [
  { key: "ability_dance", label: "Danza" },
  { key: "ability_sing", label: "Canto" },
  { key: "ability_instruments", label: "Strumenti musicali", detail: "ability_instruments_detail" },
  { key: "ability_sports", label: "Sport", detail: "ability_sports_detail" },
  { key: "ability_bartender", label: "Bartender" },
  { key: "ability_other", label: "Altro", detail: "ability_other_detail" },
];

// ---------- builder ------------------------------------------------
export const buildTalentDetail = (profile: Row | null, attrs: Row | null) => {
  const p: Row = profile ?? {};
  const a: Row = attrs ?? {};

  const fullName =
    [s(p.first_name), s(p.last_name)].filter(Boolean).join(" ") || s(p.stage_name) || "Senza nome";
  const location = [s(p.city), s(p.country)].filter(Boolean).join(", ");

  const sections: DetailSection[] = [];

  // --- blocco iniziale, senza intestazione ---------------------------
  const head: DetailField[] = [];
  push(head, "Nome", s(p.first_name));
  push(head, "Cognome", s(p.last_name));
  push(head, "Nome d'arte", s(p.stage_name));
  push(head, "Data di nascita", date(p.birth_date));
  push(head, "Sesso", labelFrom(GENDERS, p.gender));
  push(head, "Identità di genere", s(p.gender_identity));
  push(head, "Rappresentanza", labelFrom(REPRESENTATION_TYPES, p.representation_type));
  if (head.length) sections.push({ key: "head", fields: head });

  // --- contatti ------------------------------------------------------
  const contacts: DetailField[] = [];
  push(contacts, "Email", s(p.contact_email) || s(p.email));
  push(contacts, "Numero di telefono", phone(p.phone_prefix, p.phone_number));
  push(contacts, "WhatsApp", phone(p.whatsapp_prefix, p.whatsapp_number));
  push(contacts, "Sito Web", s(p.website_url));
  const socials = (p.social_links && typeof p.social_links === "object" ? p.social_links : {}) as Row;
  SOCIALS.forEach((soc) => push(contacts, soc.label, s(socials[soc.key])));
  if (contacts.length) sections.push({ key: "contatti", title: "Contatti", icon: Mail, fields: contacts });

  // --- indirizzo ------------------------------------------------------
  const residence = composeAddress(p.residence_address);
  const domicile = composeAddress(p.domicile_address) || residence;
  const address: DetailField[] = [];
  push(address, "Residenza", residence, true);
  push(address, "Domicilio", domicile, true);
  if (address.length) sections.push({ key: "indirizzo", title: "Indirizzo", icon: MapPin, fields: address });

  // --- documenti e fiscalità -------------------------------------------
  const docs: DetailField[] = [];
  push(docs, "Cittadinanza", s(p.nationality));
  push(docs, "Codice fiscale", s(p.fiscal_code));
  if (p.has_passport) {
    push(docs, "Passaporto", "Sì");
    push(docs, "Stato di emissione", s(p.passport_country));
  }
  if (p.has_vat_number) {
    push(docs, "Partita IVA", s(p.vat_number) || "Sì");
    push(docs, "Tipologia attività", s(p.vat_activity_type));
    push(docs, "Regime fiscale", s(p.vat_regime));
  }
  push(docs, "Banca", s(p.bank_name));
  push(docs, "Intestatario conto corrente", s(p.bank_account_holder));
  push(docs, "IBAN", s(p.iban), true);
  if (docs.length)
    sections.push({ key: "documenti", title: "Documenti e fiscalità", icon: IdCard, fields: docs });

  // --- aspetto fisico ---------------------------------------------------
  const physical: DetailField[] = [];
  push(physical, "Altezza", num(a.height, " cm"));
  push(physical, "Peso", num(a.weight, " kg"));
  push(physical, "Petto", num(a.chest, " cm"));
  push(physical, "Vita", num(a.waist, " cm"));
  push(physical, "Fianchi", num(a.hips, " cm"));
  push(physical, "Larghezza spalle", num(a.shoulder_width, " cm"));
  push(physical, "Misura collo camicia", num(a.neck_size, " cm"));
  push(physical, "Taglia giacca", s(a.jacket_size));
  push(physical, "Taglia maglia", s(a.shirt_size));
  push(physical, "Taglia pantaloni", s(a.pants_size));
  push(physical, "Numero scarpe", s(a.shoe_size));
  push(physical, "Colore capelli", s(a.hair_color));
  push(physical, "Colore occhi", s(a.eye_color));
  push(physical, "Lunghezza capelli", s(a.hair_length));
  push(physical, "Tipologia capelli", s(a.hair_type));
  push(physical, "Etnia", s(p.ethnicity));
  push(
    physical,
    "Segni particolari",
    MARKS.filter((m) => a[m.key] === true)
      .map((m) => m.label)
      .join(", "),
    true
  );
  push(physical, "Allergie o intolleranze alimentari", yesNo(a.has_food_allergies));
  if (physical.length)
    sections.push({ key: "fisico", title: "Aspetto fisico", icon: Shirt, fields: physical });

  // --- ruoli -------------------------------------------------------------
  const roles = Array.isArray(p.talent_categories) ? (p.talent_categories as string[]) : [];
  if (roles.length)
    sections.push({ key: "ruoli", title: "Ruoli e talenti", icon: Tag, fields: [], pills: roles });

  // --- bio, abilità e lingue ---------------------------------------------
  const bio: DetailField[] = [];
  push(bio, "Esperienze", s(p.bio), true);
  const abilities = ABILITIES.filter((ab) => a[ab.key] === true).map((ab) => {
    const detail = ab.detail ? s(a[ab.detail]) : "";
    return detail ? `${ab.label} (${detail})` : ab.label;
  });
  const freeAbilities = Array.isArray(a.abilities) ? (a.abilities as string[]) : [];
  push(bio, "Abilità", [...freeAbilities, ...abilities].filter(Boolean).join(", "), true);
  if (p.has_band !== null && p.has_band !== undefined)
    push(bio, "Band o gruppo di artisti", yesNo(p.has_band));
  push(bio, "Nome della band / gruppo", s(p.band_name));
  push(bio, "Titolo di studio", s(p.education_level));
  push(bio, "Ambito", s(p.education_field));
  const levels = (a.language_levels && typeof a.language_levels === "object"
    ? a.language_levels
    : {}) as Row;
  const languageKeys = Object.keys(levels).length
    ? Object.keys(levels)
    : Array.isArray(a.languages)
      ? (a.languages as string[])
      : [];
  push(
    bio,
    "Lingue",
    languageKeys
      .map((lang) => {
        const level = s(levels[lang]);
        return level ? `${lang} (${level})` : lang;
      })
      .join(", "),
    true
  );
  if (bio.length)
    sections.push({ key: "bio", title: "Bio, abilità e lingue", icon: GraduationCap, fields: bio });

  // --- lavoro e viaggi -----------------------------------------------------
  const work: DetailField[] = [];
  push(work, "Occupazione principale", s(p.main_occupation));
  push(work, "CV", s(p.cv_url) ? "Caricato" : "");
  push(work, "Città di appoggio", list(p.work_cities), true);
  push(work, "Patenti", list(p.driving_licenses), true);
  push(work, "Automobile", yesNo(p.has_car));
  push(work, "Moto", yesNo(p.has_motorbike));
  if (work.length)
    sections.push({ key: "lavoro", title: "Lavoro e viaggi", icon: Briefcase, fields: work });

  return { fullName, location, sections };
};
