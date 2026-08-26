import { describe, expect, it } from "vitest";

import {
  getAccountBookingEmailActionKey,
  getAutomaticVerificationActionKey,
  getBackupActionKey,
  getErrorActionKey,
  getManualVerificationActionKey,
  getRemittanceEmailActionKey,
  getGoogleSheetsExportActionKey,
  getReconciliationActionKey,
} from "./verification-action-key";

describe("Verification action keys", () => {
  it("creates a stable AUTOMATIC verification key", () => {
    expect(
      getAutomaticVerificationActionKey(
        "16/08",
        "test-message-id",
      ),
    ).toBe(
      "VERIFY|AUTOMATIC|16/08|test-message-id",
    );
  });

  it("creates a stable MANUAL verification key", () => {
    expect(
      getManualVerificationActionKey("14/08"),
    ).toBe("VERIFY|MANUAL|14/08");
  });

  it("creates a stable Account Booking email key", () => {
    expect(
      getAccountBookingEmailActionKey(
        "test-message-id",
      ),
    ).toBe(
      "EMAIL|ACCOUNT_BOOKING|test-message-id",
    );
  });

  it("creates a stable remittance email key", () => {
    expect(
      getRemittanceEmailActionKey(
        "test-message-id",
      ),
    ).toBe(
      "EMAIL|REMITTANCE|test-message-id",
    );
  });

  it("creates a stable backup action key", () => {
    expect(
      getBackupActionKey(
        "report-123",
        "2026-08-25T06:23:00.000Z",
      ),
    ).toBe(
      "BACKUP|report-123|2026-08-25T06:23:00.000Z",
    );
  });

  it("creates a stable Google Sheets export action key", () => {
    expect(
      getGoogleSheetsExportActionKey(
        "2026-08-25",
        "2026-08-25T06:45:00.000Z",
      ),
    ).toBe(
      "EXPORT|GOOGLE_SHEETS|2026-08-25|2026-08-25T06:45:00.000Z",
    );
  });

  it("creates a stable reconciliation action key", () => {
    expect(
      getReconciliationActionKey("report-123"),
    ).toBe(
      "RECONCILIATION|report-123",
    );
  });

  it("creates a stable processing error action key", () => {
    expect(
      getErrorActionKey(
        "BACKUP_WRITE",
        "report-123",
        "2026-08-26T02:45:00.000Z",
      ),
    ).toBe(
      "ERROR|BACKUP_WRITE|report-123|2026-08-26T02:45:00.000Z",
    );
  });
});