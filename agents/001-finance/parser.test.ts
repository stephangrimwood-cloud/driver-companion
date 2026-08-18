import { describe, expect, it } from "vitest";

import { parseReportBackups } from "./parser";

const validReport = {
  id: "report-1",
  createdAt: "2026-08-05T09:30:00.000Z",
  shiftDate: "2026-08-05",
  shiftStart: "08:00",
  shiftEnd: "16:00",
  cashTaken: "50.00",
  accountBookings: "0.00",
  meterTotal: "300.00",
  areaCharge: "0.00",
  quotes: "0.00",
  emes: "0.00",
  shiftTotal: 300,
  ownerHalf: 150,
  levy: "5.50",
  ownerAmount: 155.5,
  dockets: "0.00",
  fuel: "0.00",
  eftpos: "250.00",
  payable: -94.5,
  driverShare: 144.5,
  ownerShare: 155.5,
};

describe("Report backup parser", () => {
  it("parses valid Shift Mate backups", () => {
    const reports = parseReportBackups([
      JSON.stringify(validReport),
    ]);

    expect(reports).toEqual([validReport]);
  });

  it("skips malformed JSON", () => {
    const reports = parseReportBackups([
      "{not valid json}",
    ]);

    expect(reports).toEqual([]);
  });

  it("skips objects missing required report fields", () => {
    const invalidReport = {
      id: "report-1",
      createdAt: "2026-08-05T09:30:00.000Z",
      shiftDate: "2026-08-05",
    };

    const reports = parseReportBackups([
      JSON.stringify(invalidReport),
    ]);

    expect(reports).toEqual([]);
  });
});