export const MEDIA_CATEGORIES = [
  { key: "main_photos", label: "Foto principali", type: "photo" as const, minRequired: 4 },
  { key: "polaroids", label: "Foto al naturale (polaroids)", type: "photo" as const },
  { key: "hands", label: "Foto delle mani", type: "photo" as const },
  { key: "feet", label: "Foto dei piedi", type: "photo" as const },
  { key: "works", label: "Foto dei lavori realizzati", type: "photo" as const },
  { key: "intro_video", label: "Video di presentazione", type: "video" as const },
  { key: "showreel", label: "Showreel professionale", type: "video" as const },
  { key: "other_videos", label: "Altri video", type: "video" as const },
] as const;

export type MediaCategory = typeof MEDIA_CATEGORIES[number]["key"];

export const getCategoryLabel = (key: string) =>
  MEDIA_CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const getCategoryType = (key: string) =>
  MEDIA_CATEGORIES.find((c) => c.key === key)?.type ?? "photo";

export const isPhotoCategory = (key: string) => getCategoryType(key) === "photo";
