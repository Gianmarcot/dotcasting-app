import { describe, it, expect } from "vitest";
import { validatePhoneNumber } from "./phone";

describe("validatePhoneNumber", () => {
  it("rejects 111111", () => expect(validatePhoneNumber("+39", "111111")).not.toBeNull());
  it("rejects repeated digits on foreign prefix", () =>
    expect(validatePhoneNumber("+44", "1111111111")).not.toBeNull());
  it("rejects letters", () => expect(validatePhoneNumber("+39", "333abc4567")).not.toBeNull());
  it("accepts Italian mobile", () => expect(validatePhoneNumber("+39", "333 123 4567")).toBeNull());
  it("accepts Italian landline", () => expect(validatePhoneNumber("+39", "02 1234567")).toBeNull());
  it("rejects Italian number not starting with 3 or 0", () =>
    expect(validatePhoneNumber("+39", "5551234567")).not.toBeNull());
});
