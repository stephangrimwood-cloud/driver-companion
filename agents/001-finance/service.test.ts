import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  gmailInitialiseMock,
  gmailInitialiseAccountBookingsMock,
  readSpreadsheetTitleMock,
  readFinancialYearLedgersMock,
  updateLedgerStatusMock,
  writeVerificationRecordMock,
} = vi.hoisted(() => ({
  gmailInitialiseMock: vi.fn(),
  gmailInitialiseAccountBookingsMock: vi.fn(),
  readSpreadsheetTitleMock: vi.fn(),
  readFinancialYearLedgersMock: vi.fn(),
  updateLedgerStatusMock: vi.fn(),
  writeVerificationRecordMock: vi.fn(),
}));

vi.mock("./gmail", () => ({
  GmailAgent: class {
    initialise = gmailInitialiseMock;
    initialiseAccountBookings =
      gmailInitialiseAccountBookingsMock;
  },
}));

vi.mock("./sheets", () => ({
  SheetsAgent: class {
    readSpreadsheetTitle = readSpreadsheetTitleMock;
    readFinancialYearLedgers = readFinancialYearLedgersMock;
    updateLedgerStatus = updateLedgerStatusMock;
    writeVerificationRecord = writeVerificationRecordMock;
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
  });
});