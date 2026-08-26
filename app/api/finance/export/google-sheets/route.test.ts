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
        reference: "report-123",
        type: "EXPORT",
        loggedAt: expect.any(String),
        source: "Google Sheets August row 30",
        actionKey:
          `EXPORT|GOOGLE_SHEETS|2026-08-25|${logRecord.loggedAt}`,
      });
    });

    it("logs an ERROR when the ledger write fails", async () => {
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
      ).toHaveBeenCalledTimes(1);

      const logRecord =
        writeFinanceAgentLogRecordMock.mock.calls[0][0];

      expect(logRecord).toEqual({
        reference: "report-123",
        type: "ERROR",
        loggedAt: expect.any(String),
        source: "EXPORT_WRITE — Ledger export failed",
        actionKey:
          `ERROR|EXPORT_WRITE|2026-08-25|${logRecord.loggedAt}`,
      });
    });

    it("preserves the original export error when ERROR logging also fails", async () => {
      writeReportRowMock.mockRejectedValue(
        new Error("Ledger export failed"),
      );

      writeFinanceAgentLogRecordMock.mockRejectedValue(
        new Error("Error log failed"),
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
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.message).toBe("Ledger export failed");
    });

    it("includes all Shift Mate report IDs in the export reference", async () => {
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
              {
                id: "report-456",
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

      expect(
        writeFinanceAgentLogRecordMock,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: "report-123, report-456",
          type: "EXPORT",
        }),
      );
    });
  },
);