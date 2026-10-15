import { describe, it, expect } from "vitest";
import { pillOff, pillOn, pillsAfterManualChange } from "./requirementPills";

const mandatory = { gender: "female", ageMin: 20, ageMax: 30 };
const optional = { heightMin: 170 };
const sets = { mandatory, optional };

describe("pillole requisiti", () => {
  it("accendendole entrambe i filtri si sommano", () => {
    expect(pillOn(pillOn({}, mandatory), optional)).toEqual({ ...mandatory, ...optional });
  });

  it("spegnendo una pillola restano i filtri scelti a mano", () => {
    const f = { ...mandatory, city: "Milano" };
    expect(pillOff(f, mandatory)).toEqual({ city: "Milano" });
  });

  it("spegnendo una pillola non si tocca un filtro modificato a mano", () => {
    expect(pillOff({ ...mandatory, ageMin: 25 }, mandatory)).toEqual({ ageMin: 25 });
  });

  it("modificare a mano un filtro della pillola la spegne senza disfare i filtri", () => {
    const state = pillsAfterManualChange({ ...mandatory, ageMin: 25 }, sets, { mandatory: true, optional: false });
    expect(state.mandatory).toBe(false);
  });

  it("modificare un filtro estraneo lascia la pillola accesa", () => {
    const state = pillsAfterManualChange({ ...mandatory, city: "Roma" }, sets, { mandatory: true, optional: false });
    expect(state.mandatory).toBe(true);
  });

  it("il reset spegne entrambe le pillole", () => {
    const state = pillsAfterManualChange({}, sets, { mandatory: true, optional: true });
    expect(state).toEqual({ mandatory: false, optional: false });
  });
});
