import { createContext, useContext, type ReactNode } from "react";

const MenuDepthContext = createContext(0);
export const canOpenSubmenu = (depth: number) => depth < 1;

/** A root menu can own submenus; those submenus cannot own a third level. */
export function MenuSubLevel({ children }: { children: ReactNode }) {
  const depth = useContext(MenuDepthContext);
  if (!canOpenSubmenu(depth)) return null;
  return <MenuDepthContext.Provider value={depth + 1}>{children}</MenuDepthContext.Provider>;
}