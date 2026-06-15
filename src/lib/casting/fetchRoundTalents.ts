// =============================================================
// fetchRoundTalents.ts — Dal DB reale al Talent della card (v2)
// Assembla profiles + talent_attributes + talent_media in un
// Talent flat. Registry, preset e template non sanno nulla
// dello schema DB: per nuovi campi si tocca solo qui + registry.
// =============================================================

import { supabase } from "@/integrations/supabase/client";
import { Talent } from "./talentFields";

interface DbMedia { url: string; sort_order: number; media_type: string; category: string | null }
interface DbAttrs {
  height: number | null; weight: number | null;
  hair_color: string | null; eye_color: string | null;
  hair_length: string | null; hair_type: string | null;
  languages: string[] | null; abilities: string[] | null;
  shirt_size: string | null; pants_size: string | null; jacket_size: string | null;
  underwear_sizes: string | null;
  chest: number | null; waist: number | null; hips: number | null;
  shoulder_width: number | null; neck_size: number | null; shoe_size: number | null;
  has_tattoos: boolean | null; has_piercings: boolean | null;
  has_freckles: boolean | null; has_diastema: boolean | null;
  has_vitiligo: boolean | null; has_albinism: boolean | null; has_dwarfism: boolean | null;
  ability_dance: boolean | null; ability_sing: boolean | null;
  ability_instruments: boolean | null; ability_instruments_detail: string | null;
  ability_sports: boolean | null; ability_sports_detail: string | null;
  ability_bartender: boolean | null;
  ability_other: boolean | null; ability_other_detail: string | null;
}
interface DbProfile {
  id: string;
  first_name: string | null; last_name: string | null; stage_name: string | null;
  gender: string | null; ethnicity: string | null; birth_date: string | null;
  city: string | null; country: string | null; nationality: string | null;
  work_cities: string[] | null;
  phone_prefix: string | null; phone_number: string | null;
  whatsapp_prefix: string | null; whatsapp_number: string | null;
  website_url: string | null;
  contact_email: string | null;
  driving_licenses: string[] | null;
  travel_availability: unknown; // jsonb in DB
  // PostgREST può restituire la riga singola come array o come oggetto
  attributes: DbAttrs[] | DbAttrs | null;
  media: DbMedia[] | null;
}

const age = (birth?: string | null) => {
  if (!birth) return null;
  const b = new Date(birth);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
};

const phone = (prefix?: string | null, number?: string | null) =>
  number ? `${(prefix ?? "").trim()} ${number}`.trim() : null;

const GENDER_LABELS: Record<string, string> = {
  male: "Uomo", female: "Donna", M: "Uomo", F: "Donna",
};

const travelToText = (v: unknown): string | null => {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const parts: string[] = [];
    // Forma legacy: flag booleani
    if (o.italy) parts.push("Italia");
    if (o.europe) parts.push("Europa");
    if (o.world) parts.push("Mondo");
    // Forma corrente: liste continents + countries
    if (Array.isArray(o.continents)) {
      for (const c of o.continents) if (typeof c === "string" && c.trim()) parts.push(c);
    }
    if (Array.isArray(o.countries)) {
      for (const c of o.countries) if (typeof c === "string" && c.trim()) parts.push(c);
    }
    const unique = Array.from(new Set(parts));
    if (unique.length) return `Disponibile: ${unique.join(", ")}`;
    if (typeof o.notes === "string" && o.notes.trim()) return o.notes;
  }
  return null;
};

/**
 * Reroute a Supabase Storage URL through the image transformation endpoint,
 * capping the longest side at ~1500px. Falls back to the original URL when
 * the path doesn't match the public object format (e.g. external URLs).
 */
const transformPhotoUrl = (url: string): string => {
  if (!url) return url;
  const marker = "/storage/v1/object/public/";
  if (!url.includes(marker)) return url;
  const base = url.replace(marker, "/storage/v1/render/image/public/");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=1500&height=1500&resize=contain&quality=80`;
};



export function mapToTalent(p: DbProfile): Talent {
  const a: Partial<DbAttrs> = Array.isArray(p.attributes)
    ? (p.attributes[0] ?? {})
    : (p.attributes ?? {});

  // segni particolari: composito dai boolean
  const segni: string[] = [];
  if (a.has_tattoos) segni.push("Tatuaggi");
  if (a.has_piercings) segni.push("Piercing");
  if (a.has_freckles) segni.push("Lentiggini");
  if (a.has_diastema) segni.push("Diastema");
  if (a.has_vitiligo) segni.push("Vitiligine");
  if (a.has_albinism) segni.push("Albinismo");
  if (a.has_dwarfism) segni.push("Nanismo");

  // abilità: array libero + flag con eventuale dettaglio
  const abilita: string[] = [...(a.abilities ?? [])];
  if (a.ability_dance) abilita.push("Danza");
  if (a.ability_sing) abilita.push("Canto");
  if (a.ability_instruments) abilita.push(a.ability_instruments_detail || "Strumenti musicali");
  if (a.ability_sports) abilita.push(a.ability_sports_detail || "Sport");
  if (a.ability_bartender) abilita.push("Bartending");
  if (a.ability_other && a.ability_other_detail) abilita.push(a.ability_other_detail);

  return {
    id: p.id,
    nome:
      p.stage_name?.trim() ||
      [p.first_name, p.last_name].filter(Boolean).join(" ").trim(),
    eta: age(p.birth_date),
    genere: p.gender ? (GENDER_LABELS[p.gender] ?? p.gender) : null,
    citta: [p.city, p.country && p.country !== "Italia" ? p.country : null]
      .filter(Boolean).join(", ") || null,
    nazionalita: p.nationality ?? null,
    etnia: p.ethnicity ?? null,
    citta_lavoro: p.work_cities?.length ? p.work_cities : null,
    altezza_cm: a.height ?? null,
    peso_kg: a.weight ?? null,
    occhi: a.eye_color ?? null,
    capelli: a.hair_color ?? null,
    capelli_lunghezza: a.hair_length ?? null,
    capelli_tipo: a.hair_type ?? null,
    segni_particolari: segni.length ? segni : null,
    taglia_maglia: a.shirt_size ?? null,
    taglia_pantaloni: a.pants_size ?? null,
    taglia_giacca: a.jacket_size ?? null,
    taglia_reggiseno: a.underwear_sizes ?? null,
    vita_cm: a.waist ?? null,
    petto_cm: a.chest ?? null,
    fianchi_cm: a.hips ?? null,
    larghezza_spalle_cm: a.shoulder_width ?? null,
    collo_cm: a.neck_size ?? null,
    numero_scarpe: a.shoe_size ?? null,
    lingue: a.languages?.length ? a.languages : null,
    abilita: abilita.length ? abilita : null,
    patenti: p.driving_licenses?.length ? p.driving_licenses : null,
    disponibilita_viaggio: travelToText(p.travel_availability),
    email: p.contact_email ?? null,
    telefono: phone(p.phone_prefix, p.phone_number),
    whatsapp: phone(p.whatsapp_prefix, p.whatsapp_number),
    sito_web: p.website_url ?? null,
    photos: (p.media ?? [])
      .filter(m => m.media_type === "photo" && (m.category ?? "main_photos") === "main_photos")
      .sort((x, y) => x.sort_order - y.sort_order)
      .map(m => transformPhotoUrl(m.url)),
  };
}

/**
 * Carica i talent di una selezione (righe di role_talents) già
 * mappati per la card.
 */
export async function fetchRoundTalents(roleTalentIds: string[]): Promise<
  { roleTalentId: string; talent: Talent }[]
> {
  const { data, error } = await supabase
    .from("role_talents")
    .select(`
      id,
      profile:profiles (
        id, first_name, last_name, stage_name, gender, ethnicity, birth_date,
        city, country, nationality, work_cities,
        phone_prefix, phone_number, whatsapp_prefix, whatsapp_number,
        website_url, contact_email, driving_licenses, travel_availability,
        attributes:talent_attributes (
          height, weight, hair_color, eye_color, hair_length, hair_type,
          languages, abilities, shirt_size, pants_size, jacket_size,
          underwear_sizes, chest, waist, hips, shoulder_width, neck_size,
          shoe_size, has_tattoos, has_piercings, has_freckles, has_diastema,
          has_vitiligo, has_albinism, has_dwarfism,
          ability_dance, ability_sing,
          ability_instruments, ability_instruments_detail,
          ability_sports, ability_sports_detail,
          ability_bartender, ability_other, ability_other_detail
        ),
        media:talent_media ( url, sort_order, media_type, category )
      )
    `)
    .in("id", roleTalentIds);

  if (error) throw error;

  return (data ?? [])
    .filter(r => r.profile)
    .map(r => ({
      roleTalentId: r.id as string,
      talent: mapToTalent(r.profile as unknown as DbProfile),
    }));
}

/**
 * Carica un singolo talent (per la preview /dev/card-preview) usando la
 * stessa proiezione di fetchRoundTalents così tutti i campi sono coperti.
 */
export async function fetchTalentByProfileId(profileId: string): Promise<Talent | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, first_name, last_name, stage_name, gender, ethnicity, birth_date,
      city, country, nationality, work_cities,
      phone_prefix, phone_number, whatsapp_prefix, whatsapp_number,
      website_url, contact_email, driving_licenses, travel_availability,
      attributes:talent_attributes (
        height, weight, hair_color, eye_color, hair_length, hair_type,
        languages, abilities, shirt_size, pants_size, jacket_size,
        underwear_sizes, chest, waist, hips, shoulder_width, neck_size,
        shoe_size, has_tattoos, has_piercings, has_freckles, has_diastema,
        has_vitiligo, has_albinism, has_dwarfism,
        ability_dance, ability_sing,
        ability_instruments, ability_instruments_detail,
        ability_sports, ability_sports_detail,
        ability_bartender, ability_other, ability_other_detail
      ),
      media:talent_media ( url, sort_order, media_type, category )
    `)
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapToTalent(data as unknown as DbProfile);
}
