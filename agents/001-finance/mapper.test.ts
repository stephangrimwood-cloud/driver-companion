import { describe, expect, it } from "vitest";

import {
  mapReportToSheetRow,
  mapReportsToSheetRow,
} from "./mapper";

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

  it("maps a payment to Cairns Taxis as a negative settlement", () => {
    const row = mapReportToSheetRow({
      shiftDate: "2026-07-29",
      cashTaken: "100.00",
      areaCharge: "10.00",
      accountBookings: "20.00",
      payable: 25,
    });

    expect(row).toEqual([
      "29/07/2026",
      90,
      -25,
      20,
      85,
      "CTL Export",
      "Pending",
    ]);
  });

    it("combines multiple shifts from the same day into one income row", () => {
    const row = mapReportsToSheetRow([
      {
        shiftDate: "2026-08-15",
        cashTaken: "100.00",
        areaCharge: "10.00",
        accountBookings: "20.00",
        payable: 25,
      },
      {
        shiftDate: "2026-08-15",
        cashTaken: "50.00",
        areaCharge: "5.00",
        accountBookings: "0.00",
        payable: -40,
      },
    ]);

    expect(row).toEqual([
      "15/08/2026",
      135,
      15,
      20,
      170,
      "CTL Export • 2 shifts",
      "Pending",
    ]);
  });
});