// Mock data per la pagina di test della condivisione cliente.
// Aprire /round/preview per visualizzare il layout senza chiamare il backend.
// Modificare liberamente i dati qui sotto per testare varianti di layout.

import type { RoundPreset } from "@/lib/casting/roundPreset";

type CompanyStatus = "none" | "pending" | "proposed" | "confirmed" | "rejected";

interface MockMedia {
  url: string;
  sort_order: number;
  media_type: string;
  category: string | null;
}

interface MockRow {
  role_talent_id: string;
  pdf_path: string | null;
  company_status: CompanyStatus | null;
  profile: Record<string, unknown>;
  attributes: Record<string, unknown> | null;
  media: MockMedia[];
}

const photo = (seed: string) => `https://images.unsplash.com/${seed}?w=900&q=80`;

const makeTalent = (
  i: number,
  first: string,
  last: string,
  city: string,
  height: number,
  photos: string[],
  opts: Partial<{
    status: CompanyStatus;
    gender: string;
    eyes: string;
    hair: string;
    eth: string;
  }> = {}
): MockRow => ({
  role_talent_id: `mock-${i}`,
  pdf_path: i % 3 === 0 ? null : `mock/path-${i}.pdf`,
  company_status: opts.status ?? null,
  profile: {
    id: `profile-${i}`,
    first_name: first,
    last_name: last,
    stage_name: null,
    gender: opts.gender ?? (i % 2 === 0 ? "female" : "male"),
    ethnicity: opts.eth ?? "Caucasica",
    birth_date: `199${(i % 9) + 1}-0${(i % 9) + 1}-15`,
    city,
    country: "Italia",
    nationality: "Italiana",
    work_cities: ["Milano", "Roma"],
    phone_prefix: "+39",
    phone_number: "333 1234567",
    contact_email: `${first.toLowerCase()}@example.com`,
    driving_licenses: ["B"],
    travel_availability: { continents: ["Europa"] },
  },
  attributes: {
    height,
    weight: 60 + i,
    hair_color: opts.hair ?? "Castano",
    eye_color: opts.eyes ?? "Marroni",
    hair_length: "Medi",
    hair_type: "Lisci",
    languages: ["Italiano", "Inglese"],
    abilities: ["Recitazione"],
    shirt_size: "M",
    pants_size: "32",
    jacket_size: "48",
    chest: 90,
    waist: 75,
    hips: 95,
    shoulder_width: 45,
    neck_size: 38,
    shoe_size: 42,
    ability_dance: i % 2 === 0,
    ability_sing: false,
  },
  media: photos.map((url, idx) => ({
    url,
    sort_order: idx,
    media_type: "photo",
    category: "main_photos",
  })),
});

export const MOCK_SHARED_ROUND = {
  round: {
    id: "mock-round",
    label: "Selezione 1",
    field_preset: "default" as RoundPreset,
    shared_at: new Date().toISOString(),
  },
  casting: { title: "Campagna Primavera 2026" },
  role: { name: "Modella Lookbook" },
  branding: {
    agency_name: "dotCasting",
    agency_logo_url: null,
    contact_email: "hello@dotcasting.it",
  },
  is_latest_round: true,
  has_password: true,
  talents: [
    makeTalent(1, "Sofia", "Bianchi", "Milano", 176, [
      photo("photo-1494790108377-be9c29b29330"),
      photo("photo-1517841905240-472988babdf9"),
    ], { status: "confirmed" }),
    makeTalent(2, "Marco", "Rossi", "Roma", 184, [
      photo("photo-1500648767791-00dcc994a43e"),
      photo("photo-1506794778202-cad84cf45f1d"),
    ]),
    makeTalent(3, "Giulia", "Verdi", "Torino", 172, [
      photo("photo-1438761681033-6461ffad8d80"),
    ], { status: "confirmed" }),
    makeTalent(4, "Luca", "Neri", "Napoli", 188, [
      photo("photo-1492562080023-ab3db95bfbce"),
    ]),
    makeTalent(5, "Chiara", "Galli", "Firenze", 174, [
      photo("photo-1531746020798-e6953c6e8e04"),
      photo("photo-1521252659862-eec69941b071"),
    ], { status: "rejected" }),
    makeTalent(6, "Andrea", "Conti", "Bologna", 182, [
      photo("photo-1507003211169-0a1dd7228f2d"),
    ]),
    makeTalent(7, "Elena", "Marini", "Venezia", 170, [
      photo("photo-1488426862026-3ee34a7d66df"),
    ]),
    makeTalent(8, "Matteo", "Russo", "Palermo", 186, [
      photo("photo-1521119989659-a83eee488004"),
    ]),
  ],
};
