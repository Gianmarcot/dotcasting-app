import { PROFILE_PHOTO_CATEGORY } from "@/lib/roleVisibility";

export const MEDIA_CATEGORIES = [
  {
    key: PROFILE_PHOTO_CATEGORY,
    label: "Foto profilo",
    type: "photo" as const,
    minRequired: 1,
    description:
      "La foto che ti rappresenta sulla piattaforma. Volto ben visibile, sfondo neutro, senza filtri.",
  },
  {
    key: "main_photos",
    label: "Le tue foto",
    type: "photo" as const,
    minRequired: 4,
    description:
      "Le foto che mostrano al meglio il tuo aspetto attuale. Includi almeno una figura intera e un primo piano, con luce naturale e senza filtri.",
  },
  {
    key: "polaroids",
    label: "Foto al naturale (polaroids)",
    type: "photo" as const,
    description:
      "Scatti senza trucco e senza ritocchi, su sfondo neutro. Servono a mostrare il tuo aspetto reale.",
  },
  {
    key: "hands",
    label: "Foto mani",
    type: "photo" as const,
    description: "Primi piani delle mani su sfondo neutro, con e senza smalto se possibile.",
  },
  {
    key: "feet",
    label: "Foto piedi",
    type: "photo" as const,
    description: "Primi piani dei piedi su sfondo neutro, richiesti per i ruoli da piedista.",
  },
  {
    key: "works",
    label: "Foto dei tuoi lavori",
    type: "photo" as const,
    description:
      "Una selezione dei lavori che hai realizzato, utile a mostrare il tuo stile e la tua esperienza.",
  },
  {
    key: "intro_video",
    label: "Video di presentazione",
    type: "video" as const,
    description:
      "Un breve video in cui ti presenti guardando in camera: nome, età, città e lingue parlate.",
  },
  {
    key: "showreel",
    label: "Showreel professionale",
    type: "video" as const,
    description:
      "Il montaggio dei tuoi lavori migliori. Se ne hai più di uno, carica il più recente.",
  },
  {
    key: "other_videos",
    label: "Altri video",
    type: "video" as const,
    description: "Provini, scene, backstage o altro materiale video che vuoi mostrare.",
  },
] as const;

export type MediaCategory = typeof MEDIA_CATEGORIES[number]["key"];

export const PHOTO_CATEGORIES = MEDIA_CATEGORIES.filter((c) => c.type === "photo");

export const VIDEO_CATEGORIES = MEDIA_CATEGORIES.filter((c) => c.type === "video");

export const getCategoryLabel = (key: string) =>
  MEDIA_CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const getCategoryType = (key: string) =>
  MEDIA_CATEGORIES.find((c) => c.key === key)?.type ?? "photo";

export const getCategoryMin = (key: string): number | undefined =>
  (MEDIA_CATEGORIES.find((c) => c.key === key) as { minRequired?: number } | undefined)?.minRequired;

export const getCategoryDescription = (key: string): string =>
  (MEDIA_CATEGORIES.find((c) => c.key === key) as { description?: string } | undefined)
    ?.description ?? "";

export const isPhotoCategory = (key: string) => getCategoryType(key) === "photo";
