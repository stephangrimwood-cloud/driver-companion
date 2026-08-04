import { describe, expect, it } from "vitest";

import { mapReportToSheetRow } from "./mapper";

describe("Finance report mapper", () => {
  it("maps a payment from Cairns Taxis into an income row", () => {
    const row = mapReportToSheetRow({
      shiftDate: "2026-07-29",
      cashTaken: "15.00",
      areaCharge: "20.00",
      accountBookings: "37.50",
      payable: -178.25,
    });

    expect(row).toEqual([
      "29/07/2026",
      -5,
      178.25,
      37.5,
      210.75,
      "CTL Export",
      "Pending",
    ]);
  });

  it("rejects a report where the driver owes Cairns Taxis", () => {
    expect(() =>
      mapReportToSheetRow({
        shiftDate: "2026-07-29",
        cashTaken: "15.00",
        areaCharge: "20.00",
        accountBookings: "37.50",
        payable: 25,
      }),
    ).toThrow(
      "This report shows money payable to Cairns Taxis and cannot be exported as income.",
    );
  });
});