import { GmailAgent } from "./gmail";
import { financeAgentConfig } from "./config";
import { SheetsAgent } from "./sheets";
import {
  canVerifyRemittanceMatch,
  matchRemittancePaymentLine,
} from "./remittance-matcher";
import {
  matchAccountBookingRecordAcrossLedgers,
} from "./account-booking-matcher";
import {
  getFinancialYearWorksheetNameFromReference,
} from "./worksheet";

export class FinanceService {
  private gmail = new GmailAgent(financeAgentConfig);
  private sheets = new SheetsAgent();

  async initialise(): Promise<void> {
    const remittanceRecords =
      await this.gmail.initialise();

    const accountBookingRecords =
      await this.gmail.initialiseAccountBookings();

    void this.sheets.readSpreadsheetTitle();

    let financialYearLedgers =
      await this.sheets.readFinancialYearLedgers();

    // Account Booking confirmations are processed first.
    for (const accountBookingRecord of accountBookingRecords) {
      console.log(
        "Finance Service received Account Booking:",
        accountBookingRecord,
      );

      if (
        accountBookingRecord.validationStatus === "VALID"
      ) {
        const match =
          matchAccountBookingRecordAcrossLedgers(
            accountBookingRecord,
            financialYearLedgers,
            2026,
          );

        console.log(`
ACCOUNT BOOKING

Invoice Date: ${accountBookingRecord.invoiceDate ?? "Unknown"}
Payment Date: ${accountBookingRecord.paymentDate ?? "Unknown"}
Booking Reference: ${accountBookingRecord.bookingReference ?? "Unknown"}
Amount: ${
          accountBookingRecord.paymentAmount !== null
            ? `$${accountBookingRecord.paymentAmount.toFixed(2)}`
            : "Unknown"
        }

MATCH RESULT

${
  match
    ? `Ledger Date: ${match.ledgerDate}
Account Payment: $${match.accountPayment.toFixed(2)}
Current Status: ${match.currentStatus}
Match: ${match.result}`
    : "No matching ledger date found"
}

${
  match
    ? "ACTION: Add Account Booking payment note"
    : "NO SHEET CHANGES MADE"
}
`);

        if (match) {
          const note =
            `Account Booking ref: ${match.bookingReference} — paid ${accountBookingRecord.paymentDate}`;

          await this.sheets.appendLedgerNote(
            match.sheetName,
            match.rowNumber,
            note,
          );
        }
      } else {
        console.log(`
ACCOUNT BOOKING REVIEW REQUIRED

Booking Reference: ${accountBookingRecord.bookingReference ?? "Unknown"}
Amount: ${
          accountBookingRecord.paymentAmount !== null
            ? `$${accountBookingRecord.paymentAmount.toFixed(2)}`
            : "Unknown"
        }

Validation: REVIEW_REQUIRED

NO SHEET CHANGES MADE
`);
      }
    }

    // Re-read the ledger so remittance verification sees
    // any Account Booking notes written above.
    financialYearLedgers =
      await this.sheets.readFinancialYearLedgers();

    for (const remittanceRecord of remittanceRecords) {
      console.log(
        "Finance Service received remittance:",
        remittanceRecord,
      );

      if (remittanceRecord.validationStatus === "VALID") {
        for (const paymentLine of remittanceRecord.paymentLines) {
          const sheetName =
            getFinancialYearWorksheetNameFromReference(
              paymentLine.reference,
              2026,
            );

          if (!sheetName) {
            console.log(`
          REMITTANCE LINE

          Date: ${paymentLine.invoiceDate}
          Amount: $${paymentLine.amountPaid.toFixed(2)}

          MATCH: INVALID WORKSHEET REFERENCE
          Proposed Action: None

          NO SHEET CHANGES MADE
          `);
            continue;
          }

          const ledgerRowsForPayment =
            financialYearLedgers[sheetName];

          const match =
            matchRemittancePaymentLine(
              paymentLine,
              ledgerRowsForPayment,
            );

          if (!match) {
            console.log(`
REMITTANCE LINE

Date: ${paymentLine.invoiceDate}
Amount: $${paymentLine.amountPaid.toFixed(2)}

MATCH: NO LEDGER ROW FOUND
Proposed Action: None

NO SHEET CHANGES MADE
`);
            continue;
          }

          const shouldVerify =
            canVerifyRemittanceMatch(match);

          console.log(`
REMITTANCE LINE

Date: ${paymentLine.invoiceDate}
Amount: $${paymentLine.amountPaid.toFixed(2)}

PROPOSED LEDGER MATCH

${match.ledgerDate}
Settlement: $${match.settlement.toFixed(2)}
Current Status: ${match.currentStatus}

MATCH: ${match.result}
Proposed Action: ${
            shouldVerify
              ? "Pending → Verified"
              : match.result === "EXACT"
                ? `None — current status is ${match.currentStatus}`
                : "None — leave Pending"
          }
`);

          if (shouldVerify) {
            await this.sheets.updateLedgerStatus(
              sheetName,
              match.rowNumber,
              "Verified",
            );

            await this.sheets.writeVerificationRecord({
              ledgerDate: match.ledgerDate,
              method: "AUTOMATIC",
              verifiedAt: new Date().toISOString(),
              source:
                match.result === "ROUNDING_TOLERANCE"
                  ? `CTL remittance ${remittanceRecord.messageId} (ROUNDING_TOLERANCE)`
                  : `CTL remittance ${remittanceRecord.messageId}`,
            });
          } else {
            console.log("NO SHEET CHANGES MADE");
          }
        }
      } else if (
        remittanceRecord.validationStatus === "REVIEW_REQUIRED"
      ) {
        console.log(`
REMITTANCE REVIEW REQUIRED

Payment Date: ${remittanceRecord.paymentDate ?? "Unknown"}
Amount: ${
          remittanceRecord.paymentAmount !== null
            ? `$${remittanceRecord.paymentAmount.toFixed(2)}`
            : "Unknown"
        }

Reason:
Remittance failed one or more internal validation checks.

Proposed Action: None — manual review required

NO SHEET CHANGES MADE
`);
      }
    }
  }

  async verifyManually(
    sheetName: string,
    rowNumber: number,
    ledgerDate: string,
    source: string,
  ): Promise<void> {
    await this.sheets.verifyLedgerRowManually(
      sheetName,
      rowNumber,
      ledgerDate,
      source,
    );
  }
}