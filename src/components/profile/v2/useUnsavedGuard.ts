import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Warns before leaving the page with pending changes:
 * - browser exit (tab close, reload, external navigation)
 * - in-app navigation (any link/route change inside the SPA)
 */
export const useUnsavedGuard = (isDirty: boolean) => {
  const navigate = useNavigate();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.getAttribute("target") === "_blank") return;
      if (href === window.location.pathname) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isDirty]);

  const confirmLeave = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) navigate(href);
  }, [navigate, pendingHref]);

  const cancelLeave = useCallback(() => setPendingHref(null), []);

  return { pendingHref, confirmLeave, cancelLeave };
};
