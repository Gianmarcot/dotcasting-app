import { describe, expect, it } from "vitest";
import { canOpenSubmenu } from "./menu-depth";

describe("menu nesting limit", () => {
  it("allows the second menu level", () => expect(canOpenSubmenu(0)).toBe(true));
  it("prevents a third menu level", () => expect(canOpenSubmenu(1)).toBe(false));
});