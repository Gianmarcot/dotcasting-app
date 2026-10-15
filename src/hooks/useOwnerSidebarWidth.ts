import { useCallback, useEffect, useState } from "react";

export const OWNER_SIDEBAR_MIN = 256;
export const OWNER_SIDEBAR_MAX = 384;
export const OWNER_SIDEBAR_COLLAPSED = 72;
/** Sotto questa soglia il drag scatta in forma compressa (e viceversa). */
export const OWNER_SIDEBAR_SNAP = 164;
const WIDTH_KEY = "dc.owner-sidebar.width";
const COLLAPSED_KEY = "dc.owner-sidebar.collapsed";
const EVENT_NAME = "dc:owner-sidebar-width";

const clamp = (n: number) =>
  Math.min(OWNER_SIDEBAR_MAX, Math.max(OWNER_SIDEBAR_MIN, Math.round(n)));

const readInitial = (): number => {
  if (typeof window === "undefined") return OWNER_SIDEBAR_MIN;
  try {
    const raw = window.localStorage.getItem(WIDTH_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) return clamp(n);
    }
  } catch {
    /* ignore */
  }
  return OWNER_SIDEBAR_MIN;
};

const readCollapsed = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};

export function useOwnerSidebarWidth() {
  const [expandedWidth, setExpandedWidth] = useState<number>(readInitial);
  const [collapsed, setCollapsedState] = useState<boolean>(readCollapsed);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ width?: number; collapsed?: boolean }>).detail;
      if (!detail || typeof detail !== "object") return;
      if (typeof detail.width === "number") setExpandedWidth(detail.width);
      if (typeof detail.collapsed === "boolean") setCollapsedState(detail.collapsed);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const setWidth = useCallback((next: number) => {
    const c = clamp(next);
    try {
      window.localStorage.setItem(WIDTH_KEY, String(c));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { width: c } }));
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { collapsed: next } }));
  }, []);

  const toggleCollapsed = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed],
  );

  const resetWidth = useCallback(() => {
    setWidth(OWNER_SIDEBAR_MIN);
    setCollapsed(false);
  }, [setWidth, setCollapsed]);

  return {
    width: collapsed ? OWNER_SIDEBAR_COLLAPSED : expandedWidth,
    expandedWidth,
    collapsed,
    setWidth,
    setCollapsed,
    toggleCollapsed,
    resetWidth,
    min: OWNER_SIDEBAR_MIN,
    max: OWNER_SIDEBAR_MAX,
    collapsedWidth: OWNER_SIDEBAR_COLLAPSED,
    snap: OWNER_SIDEBAR_SNAP,
  };
}
