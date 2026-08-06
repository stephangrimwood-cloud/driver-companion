import { describe, expect, it } from "vitest";

import {
  getWorksheetName,
  getWorksheetRow,
} from "./worksheet";

describe("Worksheet resolver", () => {
  it("returns the correct worksheet name", () => {
    expect(getWorksheetName("2026-07-29")).toBe("July");
    expect(getWorksheetName("2026-08-04")).toBe("August");
  });

  it("returns the correct worksheet row", () => {
    expect(getWorksheetRow("2026-07-01")).toBe(6);
    expect(getWorksheetRow("2026-07-29")).toBe(34);
    expect(getWorksheetRow("2026-07-31")).toBe(36);
  });
});