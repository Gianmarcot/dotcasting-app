/**
 * Italian municipalities grouped by province name.
 * Loaded lazily so the ~110KB dataset stays out of the initial bundle.
 */
let cache: Record<string, string[]> | null = null;
let pending: Promise<Record<string, string[]>> | null = null;

export const loadComuni = async () => {
  if (cache) return cache;
  if (!pending) {
    pending = import("./comuni.json").then((mod) => {
      cache = (mod.default ?? mod) as Record<string, string[]>;
      return cache;
    });
  }
  return pending;
};

/** Synchronous access to the dataset once it has been loaded. */
export const getComuniSync = (province: string): string[] | null =>
  cache?.[province] ?? null;

export const hasComuniLoaded = () => cache !== null;
