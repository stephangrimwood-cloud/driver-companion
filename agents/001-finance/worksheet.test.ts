import { describe, expect, it } from "vitest";

import {
  getFinancialYearWorksheetNames,
  getWorksheetName,
  getWorksheetNameFromReference,
  getWorksheetRow,
  getFinancialYearWorksheetNameFromReference,
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

  it("returns worksheet names in financial year order", () => {
    expect(
      getFinancialYearWorksheetNames(),
    ).toEqual([
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
    ]);
  });

  it("returns the worksheet name from a CTL remittance reference", () => {
    expect(
      getWorksheetNameFromReference("27072026"),
    ).toBe("July");

    expect(
      getWorksheetNameFromReference("16082026"),
    ).toBe("August");
  });

  it("only resolves remittance references inside the selected financial year", () => {
    expect(
      getFinancialYearWorksheetNameFromReference(
        "27072026",
        2026,
      ),
    ).toBe("July");

    expect(
      getFinancialYearWorksheetNameFromReference(
        "16082026",
        2026,
      ),
    ).toBe("August");

    expect(
      getFinancialYearWorksheetNameFromReference(
        "30062027",
        2026,
      ),
    ).toBe("June");

    expect(
      getFinancialYearWorksheetNameFromReference(
        "30062026",
        2026,
      ),
    ).toBeNull();

    expect(
      getFinancialYearWorksheetNameFromReference(
        "01072027",
        2026,
      ),
    ).toBeNull();
  });
});