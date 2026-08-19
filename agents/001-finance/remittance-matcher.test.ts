import { describe, expect, it } from "vitest";

import {
  matchRemittancePaymentLine,
} from "./remittance-matcher";

import type {
  RemittancePaymentLine,
} from "./types";

describe("Remittance ledger matcher", () => {
  const ledgerRows = [
    [
      "15/08",
      "$13.50",
      "$173.85",
      "$11.50",
      "$198.85",
      "CTL Export",
      "Pending",
    ],
    [
      "16/08",
      "$72.40",
      "$122.90",
      "$0.00",
      "$195.30",
      "CTL Export",
      "Pending",
    ],
  ];

  it("finds an exact CTL settlement match", () => {
    const paymentLine: RemittancePaymentLine = {
      invoiceDate: "16 Aug 2026",
      reference: "16082026",
      invoiceTotal: 122.9,
      amountPaid: 122.9,
      stillOwing: 0,
    };

    const result =
      matchRemittancePaymentLine(
        paymentLine,
        ledgerRows,
      );

    expect(result).toEqual({
      ledgerDate: "16/08",
      rowNumber: 2,
      settlement: 122.9,
      currentStatus: "Pending",
      remittanceAmount: 122.9,
      result: "EXACT",
    });
  });

  it("does not claim an exact match when the CTL remittance is only part of the daily settlement", () => {
    const paymentLine: RemittancePaymentLine = {
      invoiceDate: "15 Aug 2026",
      reference: "15082026",
      invoiceTotal: 23.05,
      amountPaid: 23.05,
      stillOwing: 0,
    };

    const result =
      matchRemittancePaymentLine(
        paymentLine,
        ledgerRows,
      );

    expect(result).toEqual({
      ledgerDate: "15/08",
      rowNumber: 1,
      settlement: 173.85,
      currentStatus: "Pending",
      remittanceAmount: 23.05,
      result: "NO_MATCH",
    });
  });

  it("ignores worksheet header rows before matching ledger dates", () => {
    const paymentLine: RemittancePaymentLine = {
        invoiceDate: "16 Aug 2026",
        reference: "16082026",
        invoiceTotal: 122.9,
        amountPaid: 122.9,
        stillOwing: 0,
    };

    const rowsWithHeader = [
        [
        "Date",
        "Cash",
        "Settlement",
        "Account Payment",
        "Total Income",
        "Notes",
        "Status",
        ],
        [
        "16/08",
        "$72.40",
        "$122.90",
        "$0.00",
        "$195.30",
        "CTL Export",
        "Pending",
        ],
    ];

    const result =
        matchRemittancePaymentLine(
        paymentLine,
        rowsWithHeader,
        );

    expect(result?.result).toBe("EXACT");
    expect(result?.ledgerDate).toBe("16/08");
    });
});