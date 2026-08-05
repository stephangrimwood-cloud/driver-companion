import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  getCloudBackupSummary,
  mergeMissingReports,
} from "./restore";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Cloud backup summary", () => {
  it("reports cloud, device, and missing report counts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          reports: [
            {
              id: "report-1",
              createdAt: "2026-08-04T10:00:00.000Z",
              shiftDate: "2026-08-04",
            },
            {
              id: "report-2",
              createdAt: "2026-08-05T10:00:00.000Z",
              shiftDate: "2026-08-05",
            },
          ],
        }),
      }),
    );

    const summary = await getCloudBackupSummary([
      {
        id: "report-1",
      },
    ]);

    expect(summary).toEqual({
      cloudReportCount: 2,
      localReportCount: 1,
      missingReportCount: 1,
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/finance/backup",
    );
  });

  it("rejects when the cloud backup API cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(
      getCloudBackupSummary([
        {
          id: "report-1",
        },
      ]),
    ).rejects.toThrow("Unable to read cloud backups.");
  });
});

    it("rejects an invalid cloud backup response", async () => {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
            success: false,
            reports: null,
        }),
        }),
    );

    await expect(
        getCloudBackupSummary([]),
    ).rejects.toThrow("Cloud backup response was invalid.");
    });

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