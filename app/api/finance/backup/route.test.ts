import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest } from "next/server";

const {
  writeReportBackupMock,
  writeFinanceAgentLogRecordMock,
} = vi.hoisted(() => ({
  writeReportBackupMock: vi.fn(),
  writeFinanceAgentLogRecordMock: vi.fn(),
}));

vi.mock(
  "../../../../agents/001-finance/sheets",
  () => ({
    SheetsAgent: class {
      writeReportBackup = writeReportBackupMock;
      writeFinanceAgentLogRecord =
        writeFinanceAgentLogRecordMock;
    },
  }),
);

import { POST } from "./route";

describe("POST /api/finance/backup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });  
  
  it("logs a successful Shift Mate backup", async () => {
    writeReportBackupMock.mockResolvedValue(undefined);
    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );

    const request = new NextRequest(
      "http://localhost/api/finance/backup",
      {
        method: "POST",
        body: JSON.stringify({
          id: "report-123",
          shiftDate: "2026-08-25",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(200);

    const backedUpAt =
      writeReportBackupMock.mock.calls[0][2];

    expect(writeReportBackupMock).toHaveBeenCalledWith(
      "report-123",
      "2026-08-25",
      backedUpAt,
      "0.1.0",
      expect.any(String),
    );

    expect(
      writeFinanceAgentLogRecordMock,
    ).toHaveBeenCalledWith({
      reference: "report-123",
      type: "BACKUP",
      loggedAt: backedUpAt,
      source: "Shift Mate cloud backup",
      actionKey:
        `BACKUP|report-123|${backedUpAt}`,
    });
  });

  it("does not log a backup action when the backup write fails", async () => {
    writeReportBackupMock.mockRejectedValue(
        new Error("Backup write failed"),
    );

    const request = new NextRequest(
        "http://localhost/api/finance/backup",
        {
        method: "POST",
        body: JSON.stringify({
            id: "report-123",
            shiftDate: "2026-08-25",
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

  it("keeps the backup successful when reconciliation logging fails", async () => {
    writeReportBackupMock.mockResolvedValue(undefined);

    writeFinanceAgentLogRecordMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        new Error("Reconciliation log failed"),
      );

    const request = new NextRequest(
      "http://localhost/api/finance/backup",
      {
        method: "POST",
        body: JSON.stringify({
          id: "report-123",
          shiftDate: "2026-08-25",
          cashTaken: "100.00",
          accountBookings: "20.00",
          payable: 10,
          areaCharge: "5.00",
          driverShare: 105,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("logs a MATCH reconciliation outcome", async () => {
    writeReportBackupMock.mockResolvedValue(undefined);
    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );

    const request = new NextRequest(
      "http://localhost/api/finance/backup",
      {
        method: "POST",
        body: JSON.stringify({
          id: "report-123",
          shiftDate: "2026-08-25",
          cashTaken: "100.00",
          accountBookings: "20.00",
          payable: 10,
          areaCharge: "5.00",
          driverShare: 105,
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
        reference: "report-123",
        type: "RECONCILIATION",
        source:
          "MATCH — Reconciliation $105.00 / Driver Share $105.00",
        actionKey:
          "RECONCILIATION|report-123",
      }),
    );
  });

  it("logs a MISMATCH reconciliation outcome", async () => {
    writeReportBackupMock.mockResolvedValue(undefined);
    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );

    const request = new NextRequest(
      "http://localhost/api/finance/backup",
      {
        method: "POST",
        body: JSON.stringify({
          id: "report-456",
          shiftDate: "2026-08-25",
          cashTaken: "100.00",
          accountBookings: "20.00",
          payable: 10,
          areaCharge: "5.00",
          driverShare: 104,
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
        reference: "report-456",
        type: "RECONCILIATION",
        source:
          "MISMATCH — Reconciliation $105.00 / Driver Share $104.00",
        actionKey:
          "RECONCILIATION|report-456",
      }),
    );
  });
});