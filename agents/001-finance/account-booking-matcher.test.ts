import { describe, expect, it } from "vitest";

import {
  matchAccountBookingRecord,
  matchAccountBookingRecordAcrossLedgers,
} from "./account-booking-matcher";

import type {
  AccountBookingEmailRecord,
} from "./types";

describe("Account Booking matcher", () => {
  it("matches an Account Booking to the ledger by invoice date and amount", () => {
    const accountBookingRecord:
      AccountBookingEmailRecord = {
        messageId: "account-booking-message-123",
        classification: "ACCOUNT_BOOKING",
        subject:
          "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70",
        receivedDate:
          "Tue, 28 Jul 2026 02:23:34 +0000",
        paymentDate: "28 Jul 2026",
        invoiceDate: "27 Jul 2026",
        pdfTotal: 19.70,
        bookingReference: "8091343",
        subjectTotalMatchesPdfTotal: true,
        validationStatus: "VALID",
        senderName: "Tammy Sabbadin",
        senderEmail:
          "messaging-service@post.xero.com",
        paymentAmount: 19.70,
        attachments: [],
      };

    const ledgerRows = [
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
        "27/07",
        "-$58.90",
        "$141.28",
        "$19.70",
        "$102.08",
        "CTL Export",
        "Pending",
      ],
    ];

    const match =
      matchAccountBookingRecord(
        accountBookingRecord,
        ledgerRows,
      );

    expect(match).toEqual({
      ledgerDate: "27/07",
      rowNumber: 2,
      accountPayment: 19.70,
      currentStatus: "Pending",
      bookingAmount: 19.70,
      bookingReference: "8091343",
      result: "EXACT",
    });
  });

  it("finds an earlier outstanding Account Payment before the payment date", () => {
    const accountBookingRecord:
        AccountBookingEmailRecord = {
        messageId: "1a00d509b7667410",
        classification: "ACCOUNT_BOOKING",
        subject:
            "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 11.50",
        receivedDate:
            "Mon, 17 Aug 2026 01:23:00 +0000",
        paymentDate: "17 Aug 2026",
        invoiceDate: "16 Aug 2026",
        pdfTotal: 11.50,
        bookingReference: "8176745",
        subjectTotalMatchesPdfTotal: true,
        validationStatus: "VALID",
        senderName: "Tammy Sabbadin",
        senderEmail:
            "messaging-service@post.xero.com",
        paymentAmount: 11.50,
        attachments: [],
        };

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
        "Verified",
        ],
    ];

    const match =
        matchAccountBookingRecord(
        accountBookingRecord,
        ledgerRows,
        );

    expect(match).toEqual({
        ledgerDate: "15/08",
        rowNumber: 1,
        accountPayment: 11.50,
        currentStatus: "Pending",
        bookingAmount: 11.50,
        bookingReference: "8176745",
        result: "EXACT",
    });
  });

  it("does not guess when more than one Pending Account Payment has the same amount", () => {
    const accountBookingRecord:
        AccountBookingEmailRecord = {
        messageId: "duplicate-amount-test",
        classification: "ACCOUNT_BOOKING",
        subject:
            "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 11.50",
        receivedDate:
            "Mon, 17 Aug 2026 01:23:00 +0000",
        paymentDate: "17 Aug 2026",
        invoiceDate: "16 Aug 2026",
        pdfTotal: 11.50,
        bookingReference: "8176745",
        subjectTotalMatchesPdfTotal: true,
        validationStatus: "VALID",
        senderName: "Tammy Sabbadin",
        senderEmail:
            "messaging-service@post.xero.com",
        paymentAmount: 11.50,
        attachments: [],
        };

    const ledgerRows = [
        [
        "14/08",
        "$40.00",
        "$100.00",
        "$11.50",
        "$151.50",
        "CTL Export",
        "Pending",
        ],
        [
        "15/08",
        "$13.50",
        "$173.85",
        "$11.50",
        "$198.85",
        "CTL Export",
        "Pending",
        ],
    ];

    const match =
        matchAccountBookingRecord(
        accountBookingRecord,
        ledgerRows,
        );

    expect(match).toBeNull();
  });

  it("finds an Account Booking across financial year ledgers", () => {
    const accountBookingRecord:
      AccountBookingEmailRecord = {
        messageId: "19fa688dcca5cc67",
        classification: "ACCOUNT_BOOKING",
        subject:
          "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70",
        receivedDate:
          "Tue, 28 Jul 2026 02:23:34 +0000",
        paymentDate: "28 Jul 2026",
        invoiceDate: "27 Jul 2026",
        pdfTotal: 19.70,
        bookingReference: "8091343",
        subjectTotalMatchesPdfTotal: true,
        validationStatus: "VALID",
        senderName: "Tammy Sabbadin",
        senderEmail:
          "messaging-service@post.xero.com",
        paymentAmount: 19.70,
        attachments: [],
      };

    const financialYearLedgers = {
      July: [
        [
          "27/07",
          "-$18.10",
          "$140.75",
          "$19.70",
          "$142.35",
          "CTL Export",
          "Pending",
        ],
      ],
      August: [
        [
          "15/08",
          "$13.50",
          "$173.85",
          "$11.50",
          "$198.85",
          "CTL Export",
          "Pending",
        ],
      ],
    };

    const match =
      matchAccountBookingRecordAcrossLedgers(
        accountBookingRecord,
        financialYearLedgers,
        2026,
      );

    expect(match).toEqual({
      sheetName: "July",
      ledgerDate: "27/07",
      rowNumber: 1,
      accountPayment: 19.70,
      currentStatus: "Pending",
      bookingAmount: 19.70,
      bookingReference: "8091343",
      result: "EXACT",
    });
  });
});