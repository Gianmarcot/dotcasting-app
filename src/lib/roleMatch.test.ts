import { describe, it, expect } from "vitest";
import { compareRequirements, evaluateRequirements, summarizeRequirements, toRequirementSubject } from "./roleMatch";
import { mandatoryFilters, normalizeRequirements, readRoleRequirements } from "./roleRequirements";

const yearsAgo = (n: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};
const data = {
  values: { gender: "F", ageMin: 20, ageMax: 30, heightMin: 170, languages: ["Inglese", "Francese"] },
  mandatory: { gender: true, age: true, height: false, languages: true },
};
const talent = (p: Record<string, unknown>, attrs: Record<string, unknown> = {}) =>
  toRequirementSubject({ ...p, talent_attributes: [attrs] });

describe("evaluateRequirements", () => {
  it("empty talent field is missing, not unmet", () => {
    const r = evaluateRequirements(talent({}), data);
    expect(r.every((x) => x.status === "missing")).toBe(true);
  });
  it("list is met when talent has at least one value", () => {
    const r = evaluateRequirements(talent({}, { languages: ["francese"] }), data);
    expect(r.find((x) => x.key === "languages")?.status).toBe("met");
  });
  it("number below minimum is unmet", () => {
    const r = evaluateRequirements(talent({}, { height: 165 }), data);
    expect(r.find((x) => x.key === "height")).toMatchObject({ status: "unmet", requiredValue: "almeno 170 cm", mandatory: false });
  });
});

describe("summarizeRequirements", () => {
  it("unmet preferred requirements raise no warning", () => {
    const r = evaluateRequirements(talent({ gender: "F", birth_date: yearsAgo(25) }, { height: 160, languages: ["Inglese"] }), data);
    expect(summarizeRequirements(r)).toEqual({ kind: "ok" });
  });
  it("counts only mandatory unmet", () => {
    const r = evaluateRequirements(talent({ gender: "M", birth_date: yearsAgo(50) }, { height: 160, languages: ["Inglese"] }), data);
    expect(summarizeRequirements(r)).toEqual({ kind: "unmet-many", count: 2 });
  });
});

describe("compareRequirements", () => {
  it("same mandatory met: more preferred met ranks higher", () => {
    const a = evaluateRequirements(talent({ gender: "F" }, { height: 160 }), data);
    const b = evaluateRequirements(talent({ gender: "F" }, { height: 180 }), data);
    expect(compareRequirements(a, b)).toBeGreaterThan(0);
  });
});

describe("storage", () => {
  it("legacy columns become mandatory requirements", () => {
    const r = readRoleRequirements({ requirements: null, gender: "M", age_min: 18, age_max: null, required_skills: ["Danza"] });
    expect(r).toEqual({ values: { gender: "M", ageMin: 18, skills: ["Danza"] }, mandatory: { gender: true, age: true, skills: true } });
  });
  it("save drops empty requirements and mirrors columns", () => {
    const n = normalizeRequirements({ values: { gender: "F", eyeColor: "", languages: [] }, mandatory: { gender: true, eyeColor: true, languages: true } });
    expect(n.requirements).toEqual({ values: { gender: "F" }, mandatory: { gender: true } });
    expect(n).toMatchObject({ gender: "F", age_min: null, age_max: null, required_skills: [] });
  });
  it("picker filters use mandatory only", () => {
    expect(mandatoryFilters(data)).toEqual({ gender: "F", ageMin: 20, ageMax: 30, languages: ["Inglese", "Francese"] });
  });
});
