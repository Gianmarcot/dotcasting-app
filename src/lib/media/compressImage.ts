import imageCompression from "browser-image-compression";

export type CompressPreset = "avatar" | "gallery" | "generic";

interface PresetConfig {
  maxWidthOrHeight: number;
  maxSizeMB: number;
  initialQuality: number;
}

const PRESETS: Record<CompressPreset, PresetConfig> = {
  avatar: { maxWidthOrHeight: 1024, maxSizeMB: 0.3, initialQuality: 0.85 },
  gallery: { maxWidthOrHeight: 2000, maxSizeMB: 0.8, initialQuality: 0.85 },
  generic: { maxWidthOrHeight: 1920, maxSizeMB: 0.6, initialQuality: 0.85 },
};

// File types we DO NOT recompress (animated, vector, non-image, transparent originals we want to keep as-is)
const SKIP_TYPES = new Set([
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/heic",
  "image/heif",
]);

/**
 * Lightly compress an image before upload.
 * - Returns a File (preserving original name when possible).
 * - PNG with alpha and WebP are kept in their original format.
 * - JPEG / other large raster images are recompressed to JPEG.
 * - Files already under the target size are returned unchanged.
 * - On any failure, returns the original input (never blocks the upload).
 */
export async function compressImage(
  input: File | Blob,
  preset: CompressPreset = "generic"
): Promise<File> {
  const config = PRESETS[preset];
  const name = input instanceof File ? input.name : `image-${Date.now()}.jpg`;
  const type = input.type || "image/jpeg";

  // Only handle images
  if (!type.startsWith("image/")) {
    return toFile(input, name, type);
  }

  // Skip formats we shouldn't touch
  if (SKIP_TYPES.has(type)) {
    return toFile(input, name, type);
  }

  // Already small enough — pass through
  if (input.size <= config.maxSizeMB * 1024 * 1024) {
    return toFile(input, name, type);
  }

  try {
    // Preserve PNG/WebP format; otherwise output JPEG
    const keepFormat = type === "image/png" || type === "image/webp";
    const compressed = await imageCompression(toFile(input, name, type), {
      maxSizeMB: config.maxSizeMB,
      maxWidthOrHeight: config.maxWidthOrHeight,
      initialQuality: config.initialQuality,
      useWebWorker: true,
      preserveExif: true,
      fileType: keepFormat ? type : "image/jpeg",
    });

    // Ensure we return a File with a sensible name/extension
    const outName = keepFormat ? name : swapExt(name, "jpg");
    return new File([compressed], outName, {
      type: compressed.type || (keepFormat ? type : "image/jpeg"),
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("[compressImage] fallback to original:", err);
    return toFile(input, name, type);
  }
}

function toFile(input: File | Blob, name: string, type: string): File {
  if (input instanceof File) return input;
  return new File([input], name, { type, lastModified: Date.now() });
}

function swapExt(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return `${name}.${ext}`;
  return `${name.slice(0, dot)}.${ext}`;
}
