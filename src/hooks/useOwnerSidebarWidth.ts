import { useCallback, useEffect, useState } from "react";

export const OWNER_SIDEBAR_MIN = 256;
export const OWNER_SIDEBAR_MAX = 384;
const STORAGE_KEY = "dc.owner-sidebar.width";
const EVENT_NAME = "dc:owner-sidebar-width";

const clamp = (n: number) =>
  Math.min(OWNER_SIDEBAR_MAX, Math.max(OWNER_SIDEBAR_MIN, Math.round(n)));

const readInitial = (): number => {
  if (typeof window === "undefined") return OWNER_SIDEBAR_MIN;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) return clamp(n);
    }
  } catch {
    /* ignore */
  }
  return OWNER_SIDEBAR_MIN;
};

export function useOwnerSidebarWidth() {
  const [width, setWidthState] = useState<number>(readInitial);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") setWidthState(detail);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const setWidth = useCallback((next: number) => {
    const c = clamp(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(c));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent<number>(EVENT_NAME, { detail: c }));
  }, []);

  const resetWidth = useCallback(() => setWidth(OWNER_SIDEBAR_MIN), [setWidth]);

  return { width, setWidth, resetWidth, min: OWNER_SIDEBAR_MIN, max: OWNER_SIDEBAR_MAX };
}
