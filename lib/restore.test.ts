import { describe, expect, it } from "vitest";

import { mergeMissingReports } from "./restore";

describe("Restore report merger", () => {
  it("adds missing reports and sorts newest first", () => {
    const localReports = [
      {
        id: "report-1",
        createdAt: "2026-08-04T10:00:00.000Z",
      },
    ];

    const missingReports = [
      {
        id: "report-2",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
    ];

    expect(
      mergeMissingReports(localReports, missingReports),
    ).toEqual([
      {
        id: "report-2",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
      {
        id: "report-1",
        createdAt: "2026-08-04T10:00:00.000Z",
      },
    ]);
  });

  it("does not add a report whose ID already exists locally", () => {
    const localReports = [
      {
        id: "report-1",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
    ];

    const missingReports = [
      {
        id: "report-1",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
    ];

    expect(
      mergeMissingReports(localReports, missingReports),
    ).toEqual(localReports);
  });

  it("adds only one copy when the cloud list contains duplicate IDs", () => {
    const missingReports = [
      {
        id: "report-2",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
      {
        id: "report-2",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
    ];

    expect(
      mergeMissingReports([], missingReports),
    ).toEqual([
      {
        id: "report-2",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
    ]);
  });

  it("does not modify the original arrays", () => {
    const localReports = [
      {
        id: "report-1",
        createdAt: "2026-08-04T10:00:00.000Z",
      },
    ];

    const missingReports = [
      {
        id: "report-2",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
    ];

    const originalLocalReports = [...localReports];
    const originalMissingReports = [...missingReports];

    mergeMissingReports(localReports, missingReports);

    expect(localReports).toEqual(originalLocalReports);
    expect(missingReports).toEqual(originalMissingReports);
  });
});