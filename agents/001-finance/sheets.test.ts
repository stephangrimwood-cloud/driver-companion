import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  getMock,
  updateMock,
  appendMock,
} = vi.hoisted(() => ({
  getMock: vi.fn(),
  updateMock: vi.fn(),
  appendMock: vi.fn(),
}));

vi.mock("./auth", () => ({
  createGoogleSheetsClient: () => ({
    spreadsheets: {
      values: {
        get: getMock,
        update: updateMock,
        append: appendMock,
      },
    },
  }),

  loadGoogleSheetsConfig: () => ({
    spreadsheet_id: "test-spreadsheet",
    template_sheet: "Template",
  }),
}));

import { SheetsAgent } from "./sheets";

describe("SheetsAgent manual verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getMock.mockResolvedValue({
      data: {
        values: [],
      },
    });
  });

  it(
    "adds a note, verifies the row, and writes a MANUAL audit record",
    async () => {
      getMock
        .mockResolvedValueOnce({
          data: {
            values: [["Pending"]],
          },
        })
        .mockResolvedValueOnce({
          data: {
            values: [["CTL Export"]],
          },
        });

      updateMock.mockResolvedValue({
        data: {},
      });

      appendMock.mockResolvedValue({
        data: {},
      });

      const sheets = new SheetsAgent();

      await sheets.verifyLedgerRowManually(
        "August",
        19,
        "14/08",
        "Split shift manually reviewed",
      );

      expect(updateMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          range: "'August'!F19",
          requestBody: {
            values: [[
              "CTL Export | Split shift manually reviewed",
            ]],
          },
        }),
      );

      expect(updateMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          range: "'August'!G19",
          requestBody: {
            values: [["Verified"]],
          },
        }),
      );

      expect(appendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          range: "'Finance Agent Log'!A:E",
          requestBody: {
            values: [[
              "14/08",
              "MANUAL",
              expect.any(String),
              "Split shift manually reviewed",
              "VERIFY|MANUAL|14/08",
            ]],
          },
        }),
      );
    },
  );

  it(
    "does nothing when the row is already Verified",
    async () => {
      getMock.mockResolvedValueOnce({
        data: {
          values: [["Verified"]],
        },
      });

      const sheets = new SheetsAgent();

      await sheets.verifyLedgerRowManually(
        "August",
        19,
        "14/08",
        "Split shift manually reviewed",
      );

      expect(updateMock).not.toHaveBeenCalled();
      expect(appendMock).not.toHaveBeenCalled();
    },
  );

  it(
    "restores the row to Pending when MANUAL audit logging fails",
    async () => {
      getMock
        .mockResolvedValueOnce({
          data: {
            values: [["Pending"]],
          },
        })
        .mockResolvedValueOnce({
          data: {
            values: [["CTL Export"]],
          },
        });

      updateMock.mockResolvedValue({
        data: {},
      });

      appendMock.mockRejectedValue(
        new Error("Audit log write failed"),
      );

      const sheets = new SheetsAgent();

      await expect(
        sheets.verifyLedgerRowManually(
          "August",
          19,
          "14/08",
          "Split shift manually reviewed",
        ),
      ).rejects.toThrow("Audit log write failed");

      expect(updateMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          range: "'August'!F19",
        }),
      );

      expect(updateMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          range: "'August'!G19",
          requestBody: {
            values: [["Verified"]],
          },
        }),
      );

      expect(updateMock).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          range: "'August'!G19",
          requestBody: {
            values: [["Pending"]],
          },
        }),
      );
    },
  );

  it(
    "reports both failures when MANUAL audit logging and rollback fail",
    async () => {
      getMock
        .mockResolvedValueOnce({
          data: {
            values: [["Pending"]],
          },
        })
        .mockResolvedValueOnce({
          data: {
            values: [["CTL Export"]],
          },
        });

      updateMock
        .mockResolvedValueOnce({
          data: {},
        })
        .mockResolvedValueOnce({
          data: {},
        })
        .mockRejectedValueOnce(
          new Error("Rollback failed"),
        );

      appendMock.mockRejectedValue(
        new Error("Audit log write failed"),
      );

      const sheets = new SheetsAgent();

      await expect(
        sheets.verifyLedgerRowManually(
          "August",
          19,
          "14/08",
          "Split shift manually reviewed",
        ),
      ).rejects.toThrow(
        "Audit log write failed; rollback to Pending failed: Rollback failed",
      );
    },
  );
});

describe("SheetsAgent manual verification audit backfill", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getMock.mockResolvedValue({
      data: {
        values: [],
      },
    });
  });

  it(
    "adds a MANUAL audit record for an already Verified row",
    async () => {
      getMock
        .mockResolvedValueOnce({
          data: {
            values: [["Verified"]],
          },
        })
        .mockResolvedValueOnce({
          data: {
            values: [
              [
                "Ledger Date",
                "Method",
                "Verified At",
                "Source",
              ],
              [
                "31/07",
                "AUTOMATIC",
                "2026-08-20T05:39:07.042Z",
                "CTL remittance",
              ],
            ],
          },
        });

      appendMock.mockResolvedValue({
        data: {},
      });

      const sheets = new SheetsAgent();

      await sheets.backfillManualVerificationRecord(
        "August",
        19,
        "14/08",
        "Historical manual verification backfill",
      );

      expect(updateMock).not.toHaveBeenCalled();

      expect(appendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          range: "'Finance Agent Log'!A:E",
          requestBody: {
            values: [[
              "14/08",
              "MANUAL",
              expect.any(String),
              "Historical manual verification backfill",
              "VERIFY|MANUAL|14/08",
            ]],
          },
        }),
      );
    },
  );

  it(
    "does nothing when the ledger row is not Verified",
    async () => {
      getMock.mockResolvedValueOnce({
        data: {
          values: [["Pending"]],
        },
      });

      const sheets = new SheetsAgent();

      await sheets.backfillManualVerificationRecord(
        "August",
        19,
        "14/08",
        "Historical manual verification backfill",
      );

      expect(updateMock).not.toHaveBeenCalled();
      expect(appendMock).not.toHaveBeenCalled();
    },
  );

  it(
    "does not create a duplicate MANUAL audit record",
    async () => {
      getMock
        .mockResolvedValueOnce({
          data: {
            values: [["Verified"]],
          },
        })
        .mockResolvedValueOnce({
          data: {
            values: [
              [
                "Ledger Date",
                "Method",
                "Verified At",
                "Source",
              ],
              [
                "14/08",
                "MANUAL",
                "2026-08-20T08:00:00.000Z",
                "Existing manual verification",
              ],
            ],
          },
        });

      const sheets = new SheetsAgent();

      await sheets.backfillManualVerificationRecord(
        "August",
        19,
        "14/08",
        "Historical manual verification backfill",
      );

      expect(updateMock).not.toHaveBeenCalled();
      expect(appendMock).not.toHaveBeenCalled();
    },
  );

  it(
    "leaves a Verified row unchanged when audit backfill fails",
    async () => {
      getMock
        .mockResolvedValueOnce({
          data: {
            values: [["Verified"]],
          },
        })
        .mockResolvedValueOnce({
          data: {
            values: [
              [
                "Ledger Date",
                "Method",
                "Verified At",
                "Source",
              ],
            ],
          },
        });

      appendMock.mockRejectedValue(
        new Error("Audit log write failed"),
      );

      const sheets = new SheetsAgent();

      await expect(
        sheets.backfillManualVerificationRecord(
          "August",
          19,
          "14/08",
          "Historical manual verification backfill",
        ),
      ).rejects.toThrow("Audit log write failed");

      expect(updateMock).not.toHaveBeenCalled();
    },
  );

  describe("SheetsAgent verification action key duplicate protection", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("does not append a verification record when its action key already exists", async () => {
      getMock.mockResolvedValueOnce({
        data: {
          values: [
            [
              "Ledger Date",
              "Method",
              "Verified At",
              "Source",
              "Action Key",
            ],
            [
              "14/08",
              "MANUAL",
              "2026-08-25T01:00:00.000Z",
              "Existing verification",
              "VERIFY|MANUAL|14/08",
            ],
          ],
        },
      });

      const sheets = new SheetsAgent();

      await sheets.writeVerificationRecord({
        ledgerDate: "14/08",
        method: "MANUAL",
        verifiedAt: "2026-08-25T02:00:00.000Z",
        source: "Duplicate attempt",
        actionKey: "VERIFY|MANUAL|14/08",
      });

      expect(appendMock).not.toHaveBeenCalled();
    });
  });
});