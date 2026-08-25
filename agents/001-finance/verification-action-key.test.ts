import { describe, expect, it } from "vitest";

import {
  getAccountBookingEmailActionKey,
  getAutomaticVerificationActionKey,
  getManualVerificationActionKey,
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
});