import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  gmailInitialiseMock,
  gmailInitialiseAccountBookingsMock,
  readSpreadsheetTitleMock,
  readFinancialYearLedgersMock,
  appendLedgerNoteMock,
  updateLedgerStatusMock,
  writeVerificationRecordMock,
  writeFinanceAgentLogRecordMock,
  matchAccountBookingRecordAcrossLedgersMock,
} = vi.hoisted(() => ({
  gmailInitialiseMock: vi.fn(),
  gmailInitialiseAccountBookingsMock: vi.fn(),
  readSpreadsheetTitleMock: vi.fn(),
  readFinancialYearLedgersMock: vi.fn(),
  appendLedgerNoteMock: vi.fn(),
  updateLedgerStatusMock: vi.fn(),
  writeVerificationRecordMock: vi.fn(),
  writeFinanceAgentLogRecordMock: vi.fn(),
  matchAccountBookingRecordAcrossLedgersMock: vi.fn(),
}));

vi.mock("./gmail", () => ({
  GmailAgent: class {
    initialise = gmailInitialiseMock;
    initialiseAccountBookings =
      gmailInitialiseAccountBookingsMock;
  },
}));

vi.mock("./account-booking-matcher", () => ({
  matchAccountBookingRecordAcrossLedgers:
    matchAccountBookingRecordAcrossLedgersMock,
}));

vi.mock("./sheets", () => ({
  SheetsAgent: class {
    readSpreadsheetTitle = readSpreadsheetTitleMock;
    readFinancialYearLedgers = readFinancialYearLedgersMock;
    appendLedgerNote = appendLedgerNoteMock;
    updateLedgerStatus = updateLedgerStatusMock;
    writeVerificationRecord = writeVerificationRecordMock;
    writeFinanceAgentLogRecord =
      writeFinanceAgentLogRecordMock;
  },
}));

import { FinanceService } from "./service";

describe("FinanceService automatic verification recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    gmailInitialiseAccountBookingsMock.mockResolvedValue([]);

    readSpreadsheetTitleMock.mockResolvedValue(
      "Taxi Business Records v2.0",
    );
  });

  it("restores the ledger to Pending when audit logging fails", async () => {
    gmailInitialiseMock.mockResolvedValue([
      {
        validationStatus: "VALID",
        messageId: "test-message-id",
        paymentLines: [
          {
            invoiceDate: "16 Aug 2026",
            reference: "16082026",
            invoiceTotal: 122.9,
            amountPaid: 122.9,
            stillOwing: 0,
          },
        ],
      },
    ]);

    readFinancialYearLedgersMock.mockResolvedValue({
      August: [
        [
          "16/08",
          "$72.40",
          "$122.90",
          "$0.00",
          "$195.30",
          "CTL Export",
          "Pending",
        ],
      ],
    });

    updateLedgerStatusMock.mockResolvedValue(undefined);

    writeVerificationRecordMock.mockRejectedValue(
      new Error("Audit log write failed"),
    );

    const service = new FinanceService();

    await expect(
      service.initialise(),
    ).rejects.toThrow("Audit log write failed");

    expect(updateLedgerStatusMock).toHaveBeenNthCalledWith(
      1,
      "August",
      1,
      "Verified",
    );

    expect(updateLedgerStatusMock).toHaveBeenNthCalledWith(
      2,
      "August",
      1,
      "Pending",
    );

    expect(writeVerificationRecordMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ledgerDate: "16/08",
        method: "AUTOMATIC",
        source: "CTL remittance test-message-id",
        actionKey:
          "VERIFY|AUTOMATIC|16/08|test-message-id",
      }),
    );
  });

  it("reports both failures when audit logging and rollback fail", async () => {
    gmailInitialiseMock.mockResolvedValue([
      {
        validationStatus: "VALID",
        messageId: "test-message-id",
        paymentLines: [
          {
            invoiceDate: "16 Aug 2026",
            reference: "16082026",
            invoiceTotal: 122.9,
            amountPaid: 122.9,
            stillOwing: 0,
          },
        ],
      },
    ]);

    readFinancialYearLedgersMock.mockResolvedValue({
      August: [
        [
          "16/08",
          "$72.40",
          "$122.90",
          "$0.00",
          "$195.30",
          "CTL Export",
          "Pending",
        ],
      ],
    });

    updateLedgerStatusMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        new Error("Rollback failed"),
      );

    writeVerificationRecordMock.mockRejectedValue(
      new Error("Audit log write failed"),
    );

    const service = new FinanceService();

    await expect(
      service.initialise(),
    ).rejects.toThrow(
      "Audit log write failed; rollback to Pending failed: Rollback failed",
    );
  });
});

describe("FinanceService Account Booking logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    gmailInitialiseMock.mockResolvedValue([]);

    readSpreadsheetTitleMock.mockResolvedValue(
      "Taxi Business Records v2.0",
    );

    readFinancialYearLedgersMock.mockResolvedValue({
      August: [],
    });

    appendLedgerNoteMock.mockResolvedValue(undefined);

    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );
  });

  it("logs a successfully processed Account Booking email", async () => {
    gmailInitialiseAccountBookingsMock.mockResolvedValue([
      {
        messageId: "account-booking-message-id",
        validationStatus: "VALID",
        invoiceDate: "14 Aug 2026",
        paymentDate: "15 Aug 2026",
        bookingReference: "8091343",
        paymentAmount: 19.7,
      },
    ]);

    matchAccountBookingRecordAcrossLedgersMock.mockReturnValue({
      sheetName: "August",
      rowNumber: 19,
      ledgerDate: "14/08",
      accountPayment: 19.7,
      currentStatus: "Pending",
      result: "EXACT",
      bookingReference: "8091343",
    });

    const service = new FinanceService();

    await service.initialise();

    expect(appendLedgerNoteMock).toHaveBeenCalledWith(
      "August",
      19,
      "Account Booking ref: 8091343 — paid 15 Aug 2026",
    );

    expect(
      writeFinanceAgentLogRecordMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: "8091343",
        type: "ACCOUNT_BOOKING",
        source:
          "Gmail message account-booking-message-id",
        actionKey:
          "EMAIL|ACCOUNT_BOOKING|account-booking-message-id",
      }),
    );
  });

  it("does not log the Account Booking email when the ledger note write fails", async () => {
    gmailInitialiseAccountBookingsMock.mockResolvedValue([
      {
        messageId: "account-booking-message-id",
        validationStatus: "VALID",
        invoiceDate: "14 Aug 2026",
        paymentDate: "15 Aug 2026",
        bookingReference: "8091343",
        paymentAmount: 19.7,
      },
    ]);

    matchAccountBookingRecordAcrossLedgersMock.mockReturnValue({
      sheetName: "August",
      rowNumber: 19,
      ledgerDate: "14/08",
      accountPayment: 19.7,
      currentStatus: "Pending",
      result: "EXACT",
      bookingReference: "8091343",
    });

    appendLedgerNoteMock.mockRejectedValue(
      new Error("Ledger note write failed"),
    );

    const service = new FinanceService();

    await expect(
      service.initialise(),
    ).rejects.toThrow("Ledger note write failed");

    expect(
      writeFinanceAgentLogRecordMock,
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ACCOUNT_BOOKING",
      }),
    );

    expect(
      writeFinanceAgentLogRecordMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: "FINANCE_AGENT",
        type: "ERROR",
        source:
          "FINANCE_INITIALISE — Ledger note write failed",
      }),
    );
  });
});

describe("FinanceService remittance email logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    gmailInitialiseAccountBookingsMock.mockResolvedValue([]);

    readSpreadsheetTitleMock.mockResolvedValue(
      "Taxi Business Records v2.0",
    );

    readFinancialYearLedgersMock.mockResolvedValue({
      August: [
        [
          "16/08",
          "$72.40",
          "$122.90",
          "$0.00",
          "$195.30",
          "CTL Export",
          "Pending",
        ],
      ],
    });

    updateLedgerStatusMock.mockResolvedValue(undefined);
    writeVerificationRecordMock.mockResolvedValue(undefined);
    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );
  });

  it("logs a remittance email after all payment lines are handled", async () => {
    gmailInitialiseMock.mockResolvedValue([
      {
        validationStatus: "VALID",
        messageId: "remittance-message-id",
        paymentReference: "CTL-16082026",
        paymentLines: [
          {
            invoiceDate: "16 Aug 2026",
            reference: "16082026",
            invoiceTotal: 122.9,
            amountPaid: 122.9,
            stillOwing: 0,
          },
        ],
      },
    ]);

    const service = new FinanceService();

    await service.initialise();

    expect(
      writeFinanceAgentLogRecordMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: "CTL-16082026",
        type: "REMITTANCE",
        source:
          "Gmail message remittance-message-id",
        actionKey:
          "EMAIL|REMITTANCE|remittance-message-id",
      }),
    );
  });

  it("does not log a remittance email when a payment line is unresolved", async () => {
    gmailInitialiseMock.mockResolvedValue([
      {
        validationStatus: "VALID",
        messageId: "remittance-message-id",
        paymentReference: "CTL-16082026",
        paymentLines: [
          {
            invoiceDate: "16 Aug 2026",
            reference: "16082026",
            invoiceTotal: 999,
            amountPaid: 999,
            stillOwing: 0,
          },
        ],
      },
    ]);

    const service = new FinanceService();

    await service.initialise();

    expect(
      writeFinanceAgentLogRecordMock,
    ).not.toHaveBeenCalled();
  });

  it("logs a remittance email when the matching ledger row is already Verified", async () => {
    readFinancialYearLedgersMock.mockResolvedValue({
      August: [
        [
          "16/08",
          "$72.40",
          "$122.90",
          "$0.00",
          "$195.30",
          "CTL Export",
          "Verified",
        ],
      ],
    });

    gmailInitialiseMock.mockResolvedValue([
      {
        validationStatus: "VALID",
        messageId: "already-verified-message-id",
        paymentReference: "CTL-16082026",
        paymentLines: [
          {
            invoiceDate: "16 Aug 2026",
            reference: "16082026",
            invoiceTotal: 122.9,
            amountPaid: 122.9,
            stillOwing: 0,
          },
        ],
      },
    ]);

    const service = new FinanceService();

    await service.initialise();

    expect(updateLedgerStatusMock).not.toHaveBeenCalled();

    expect(
      writeFinanceAgentLogRecordMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "REMITTANCE",
        actionKey:
          "EMAIL|REMITTANCE|already-verified-message-id",
      }),
    );
  });
});

describe("FinanceService processing error logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    writeFinanceAgentLogRecordMock.mockResolvedValue(
      undefined,
    );
  });

  it("logs an ERROR when Finance Agent processing fails", async () => {
    gmailInitialiseMock.mockRejectedValue(
      new Error("Gmail processing failed"),
    );

    const service = new FinanceService();

    await expect(
      service.initialise(),
    ).rejects.toThrow("Gmail processing failed");

    expect(
      writeFinanceAgentLogRecordMock,
    ).toHaveBeenCalledTimes(1);

    const logRecord =
      writeFinanceAgentLogRecordMock.mock.calls[0][0];

    expect(logRecord).toEqual({
      reference: "FINANCE_AGENT",
      type: "ERROR",
      loggedAt: expect.any(String),
      source:
        "FINANCE_INITIALISE — Gmail processing failed",
      actionKey:
        `ERROR|FINANCE_INITIALISE|FINANCE_AGENT|${logRecord.loggedAt}`,
    });
  });

  it("preserves the original processing error when ERROR logging also fails", async () => {
    gmailInitialiseMock.mockRejectedValue(
      new Error("Gmail processing failed"),
    );

    writeFinanceAgentLogRecordMock.mockRejectedValue(
      new Error("Error log failed"),
    );

    const service = new FinanceService();

    await expect(
      service.initialise(),
    ).rejects.toThrow("Gmail processing failed");
  });
});
