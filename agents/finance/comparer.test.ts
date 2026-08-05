import { describe, expect, it } from "vitest";

import { findMissingReports } from "./comparer";

describe("Report comparer", () => {
  it("returns only reports missing from local storage", () => {
    const localReports = [
      {
        id: "report-1",
        createdAt: "2026-08-05T09:00:00.000Z",
        shiftDate: "2026-08-05",
      },
    ];

    const cloudReports = [
      {
        id: "report-1",
        createdAt: "2026-08-05T09:00:00.000Z",
        shiftDate: "2026-08-05",
      },
      {
        id: "report-2",
        createdAt: "2026-08-06T09:00:00.000Z",
        shiftDate: "2026-08-06",
      },
    ];

    const missingReports = findMissingReports(
      localReports,
      cloudReports,
    );

    expect(missingReports).toEqual([
      {
        id: "report-2",
        createdAt: "2026-08-06T09:00:00.000Z",
        shiftDate: "2026-08-06",
      },
    ]);
  });

  it("returns an empty array when all cloud reports already exist locally", () => {
    const reports = [
      {
        id: "report-1",
        createdAt: "2026-08-05T09:00:00.000Z",
        shiftDate: "2026-08-05",
      },
    ];

    expect(findMissingReports(reports, reports)).toEqual([]);
  });

  it("returns all cloud reports when local storage is empty", () => {
    const cloudReports = [
      {
        id: "report-1",
        createdAt: "2026-08-05T09:00:00.000Z",
        shiftDate: "2026-08-05",
      },
      {
        id: "report-2",
        createdAt: "2026-08-06T09:00:00.000Z",
        shiftDate: "2026-08-06",
      },
    ];

    expect(findMissingReports([], cloudReports)).toEqual(
      cloudReports,
    );
  });
});