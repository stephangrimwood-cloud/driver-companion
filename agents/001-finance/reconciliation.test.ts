import { describe, expect, it } from "vitest";

import {
  calculateReconciliationTotal,
  getReconciliationOutcome,
} from "./reconciliation";

describe("calculateReconciliationTotal", () => {
  it("subtracts settlement paid into the envelope", () => {
    expect(
      calculateReconciliationTotal({
        cashTaken: 100,
        accountBookings: 20,
        payable: 10,
        areaCharge: 5,
      }),
    ).toBe(105);
  });

  it("adds settlement when money is payable to the driver", () => {
    expect(
      calculateReconciliationTotal({
        cashTaken: 100,
        accountBookings: 20,
        payable: -10,
        areaCharge: 5,
      }),
    ).toBe(125);
  });

  it("returns MATCH when reconciliation equals driver share", () => {
    expect(
        getReconciliationOutcome(
        105,
        105,
        ),
    ).toBe("MATCH");
    });

    it("returns MISMATCH when reconciliation differs from driver share", () => {
    expect(
        getReconciliationOutcome(
        105,
        104.99,
        ),
    ).toBe("MISMATCH");
  });
});