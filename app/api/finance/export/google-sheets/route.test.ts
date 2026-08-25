import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest } from "next/server";

const {
  mapReportsToSheetRowMock,
  getWorksheetNameMock,
  getWorksheetRowMock,
  writeReportRowMock,
  writeFinanceAgentLogRecordMock,
} = vi.hoisted(() => ({
  mapReportsToSheetRowMock: vi.fn(),
  getWorksheetNameMock: vi.fn(),
  getWorksheetRowMock: vi.fn(),
  writeReportRowMock: vi.fn(),
  writeFinanceAgentLogRecordMock: vi.fn(),
}));

vi.mock(
  "../../../../../agents/001-finance/mapper",
  () => ({
    mapReportsToSheetRow:
      mapReportsToSheetRowMock,
  }),
);

vi.mock(
  "../../../../../agents/001-finance/worksheet",
  () => ({
    getWorksheetName: getWorksheetNameMock,
    getWorksheetRow: getWorksheetRowMock,
  }),
);

vi.mock(
  "../../../../../agents/001-finance/sheets",
  () => ({
    SheetsAgent: class {
      writeReportRow = writeReportRowMock;
      writeFinanceAgentLogRecord =
        writeFinanceAgentLogRecordMock;
    },
  }),
);

import { POST } from "./route";

describe(
  "POST /api/finance/export/google-sheets",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mapReportsToSheetRowMock.mockReturnValue([
        "25/08",
        "Steve",
        100,
        50,
        0,
        150,
        "CTL Export",
      ]);

      getWorksheetNameMock.mockReturnValue("August");
      getWorksheetRowMock.mockReturnValue(30);

      writeReportRowMock.mockResolvedValue(undefined);

      writeFinanceAgentLogRecordMock.mockResolvedValue(
        undefined,
      );
    });

    it("logs a successful Google Sheets export", async () => {
      const request = new NextRequest(
        "http://localhost/api/finance/export/google-sheets",
        {
          method: "POST",
          body: JSON.stringify({
            reports: [
              {
                id: "report-123",
                shiftDate: "2026-08-25",
              },
            ],
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);

      expect(writeReportRowMock).toHaveBeenCalledWith(
        "August",
        30,
        [
          "25/08",
          "Steve",
          100,
          50,
          0,
          150,
          "CTL Export",
        ],
      );

      const logRecord =
        writeFinanceAgentLogRecordMock.mock.calls[0][0];

      expect(logRecord).toEqual({
        reference: "2026-08-25",
        type: "EXPORT",
        loggedAt: expect.any(String),
        source: "Google Sheets August row 30",
        actionKey:
          `EXPORT|GOOGLE_SHEETS|2026-08-25|${logRecord.loggedAt}`,
      });
    });

    it("does not log an export action when the ledger write fails", async () => {
      writeReportRowMock.mockRejectedValue(
        new Error("Ledger export failed"),
      );

      const request = new NextRequest(
        "http://localhost/api/finance/export/google-sheets",
        {
          method: "POST",
          body: JSON.stringify({
            reports: [
              {
                id: "report-123",
                shiftDate: "2026-08-25",
              },
            ],
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);

      expect(
        writeFinanceAgentLogRecordMock,
      ).not.toHaveBeenCalled();
    });
  },
);