import { describe, it, expect } from "vitest";
import { evaluateRequirements, summarizeRequirements } from "./roleMatch";

const role = { gender: "F", age_min: 20, age_max: 30, required_skills: ["Danza", "Canto"] };
const yearsAgo = (n: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

describe("evaluateRequirements", () => {
  it("empty talent field is missing, not unmet", () => {
    const r = evaluateRequirements({ gender: null, birth_date: null, skills: [] }, role);
    expect(r.every((x) => x.status === "missing")).toBe(true);
  });
  it("wrong gender is unmet", () => {
    const r = evaluateRequirements({ gender: "M", birth_date: yearsAgo(25), skills: ["danza", "canto"] }, role);
    expect(r.find((x) => x.key === "gender")?.status).toBe("unmet");
    expect(r.find((x) => x.key === "age")?.status).toBe("met");
  });
});

describe("summarizeRequirements", () => {
  it("one unmet shows its name", () => {
    const s = summarizeRequirements(evaluateRequirements({ gender: "M", birth_date: yearsAgo(25), skills: ["danza", "canto"] }, role));
    expect(s).toEqual({ kind: "unmet-one", label: "Sesso" });
  });
  it("several unmet shows the count", () => {
    const s = summarizeRequirements(evaluateRequirements({ gender: "M", birth_date: yearsAgo(50), skills: ["danza"] }, role));
    expect(s).toEqual({ kind: "unmet-many", count: 3 });
  });
  it("no unmet but missing data shows missing count", () => {
    const s = summarizeRequirements(evaluateRequirements({ gender: "F", birth_date: null, skills: ["danza", "canto"] }, role));
    expect(s).toEqual({ kind: "missing", count: 1 });
  });
  it("all met is in target", () => {
    const s = summarizeRequirements(evaluateRequirements({ gender: "F", birth_date: yearsAgo(25), skills: ["Danza", "Canto"] }, role));
    expect(s).toEqual({ kind: "ok" });
  });
});
