import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest } from "next/server";

const {
  readReportBackupsMock,
  writeReportBackupMock,
  deleteReportBackupMock,
  writeFinanceAgentLogRecordMock,
} = vi.hoisted(() => ({
  readReportBackupsMock: vi.fn(),
  writeReportBackupMock: vi.fn(),
  deleteReportBackupMock: vi.fn(),
  writeFinanceAgentLogRecordMock: vi.fn(),
}));

vi.mock(
  "../../../../agents/001-finance/sheets",
  () => ({
    SheetsAgent: class {
      writeReportBackup = writeReportBackupMock;
      writeFinanceAgentLogRecord =
        writeFinanceAgentLogRecordMock;
      deleteReportBackup = deleteReportBackupMock;
      readReportBackups = readReportBackupsMock; 
    },
  }),
);

import { DELETE, GET, POST } from "./route";

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

  it("logs an ERROR when the backup write fails", async () => {
    writeReportBackupMock.mockRejectedValue(
      new Error("Backup write failed"),
    );

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

    expect(response.status).toBe(500);

    const logRecord =
      writeFinanceAgentLogRecordMock.mock.calls[0]?.[0];

    expect(logRecord).toEqual({
      reference: "report-123",
      type: "ERROR",
      loggedAt: expect.any(String),
      source: "BACKUP_WRITE — Backup write failed",
      actionKey:
        `ERROR|BACKUP_WRITE|report-123|${logRecord.loggedAt}`,
    });
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

  it("preserves the original backup error when ERROR logging also fails", async () => {
    writeReportBackupMock.mockRejectedValue(
      new Error("Backup write failed"),
    );

    writeFinanceAgentLogRecordMock.mockRejectedValue(
      new Error("Error log failed"),
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
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.message).toBe("Backup write failed");
  });

  it("logs an ERROR when deleting a backup fails", async () => {
    deleteReportBackupMock.mockRejectedValue(
      new Error("Backup delete failed"),
    );

    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );

    const request = new NextRequest(
      "http://localhost/api/finance/backup",
      {
        method: "DELETE",
        body: JSON.stringify({
          reportId: "report-123",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await DELETE(request);

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
      source: "BACKUP_DELETE — Backup delete failed",
      actionKey:
        `ERROR|BACKUP_DELETE|report-123|${logRecord.loggedAt}`,
    });
  });

  it("preserves the original delete error when ERROR logging also fails", async () => {
    deleteReportBackupMock.mockRejectedValue(
      new Error("Backup delete failed"),
    );

    writeFinanceAgentLogRecordMock.mockRejectedValue(
      new Error("Error log failed"),
    );

    const request = new NextRequest(
      "http://localhost/api/finance/backup",
      {
        method: "DELETE",
        body: JSON.stringify({
          reportId: "report-123",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await DELETE(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.message).toBe("Backup delete failed");
  });

  it("logs an ERROR when reading backups fails", async () => {
    readReportBackupsMock.mockRejectedValue(
      new Error("Backup read failed"),
    );

    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );

    const response = await GET();

    expect(response.status).toBe(500);

    expect(
      writeFinanceAgentLogRecordMock,
    ).toHaveBeenCalledTimes(1);

    const logRecord =
      writeFinanceAgentLogRecordMock.mock.calls[0][0];

    expect(logRecord).toEqual({
      reference: "REPORT_BACKUPS",
      type: "ERROR",
      loggedAt: expect.any(String),
      source: "BACKUP_READ — Backup read failed",
      actionKey:
        `ERROR|BACKUP_READ|REPORT_BACKUPS|${logRecord.loggedAt}`,
    });
  });

  it("preserves the original read error when ERROR logging also fails", async () => {
    readReportBackupsMock.mockRejectedValue(
      new Error("Backup read failed"),
    );

    writeFinanceAgentLogRecordMock.mockRejectedValue(
      new Error("Error log failed"),
    );

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.message).toBe("Backup read failed");
  });
});