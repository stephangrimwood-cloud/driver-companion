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
  getFinancialYearStartYearFromWorkbookTitle,
  getFinancialYearWorksheetNameFromReference,
} from "./worksheet";
import {
  getAccountBookingEmailActionKey,
  getAutomaticVerificationActionKey,
  getErrorActionKey,
  getRemittanceEmailActionKey,
} from "./verification-action-key";

export class FinanceService {
  private gmail = new GmailAgent(financeAgentConfig);
  private sheets = new SheetsAgent();

  async initialise(): Promise<void> {

    try {
    const remittanceRecords =
      await this.gmail.initialise();

    const accountBookingRecords =
      await this.gmail.initialiseAccountBookings();

    const workbookTitle =
      await this.sheets.readSpreadsheetTitle();

    const financialYearStartYear =
      getFinancialYearStartYearFromWorkbookTitle(
        workbookTitle,
      );

    console.log(
      `Active financial year: ${financialYearStartYear}-${financialYearStartYear + 1}`,
    );

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
            financialYearStartYear,
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

          await this.sheets.writeFinanceAgentLogRecord({
            reference: match.bookingReference,
            type: "ACCOUNT_BOOKING",
            loggedAt: new Date().toISOString(),
            source: `Gmail message ${accountBookingRecord.messageId}`,
            actionKey: getAccountBookingEmailActionKey(
              accountBookingRecord.messageId,
            ),
          });
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
        let allPaymentLinesHandled =
          remittanceRecord.paymentLines.length > 0;

        for (const paymentLine of remittanceRecord.paymentLines) {
          const sheetName =
            getFinancialYearWorksheetNameFromReference(
              paymentLine.reference,
              financialYearStartYear,
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

            allPaymentLinesHandled = false;
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
            allPaymentLinesHandled = false;

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

            try {
              await this.sheets.writeVerificationRecord({
                ledgerDate: match.ledgerDate,
                method: "AUTOMATIC",
                verifiedAt: new Date().toISOString(),
                source:
                  match.result === "ROUNDING_TOLERANCE"
                    ? `CTL remittance ${remittanceRecord.messageId} (ROUNDING_TOLERANCE)`
                    : `CTL remittance ${remittanceRecord.messageId}`,
                actionKey: getAutomaticVerificationActionKey(
                  match.ledgerDate,
                  remittanceRecord.messageId,
                ),
              });
            } catch (error) {
              try {
                await this.sheets.updateLedgerStatus(
                  sheetName,
                  match.rowNumber,
                  "Pending",
                );
              } catch (rollbackError) {
                const auditMessage =
                  error instanceof Error
                    ? error.message
                    : String(error);

                const rollbackMessage =
                  rollbackError instanceof Error
                    ? rollbackError.message
                    : String(rollbackError);

                throw new Error(
                  `${auditMessage}; rollback to Pending failed: ${rollbackMessage}`,
                );
              }

              throw error;
            }
          } else {
            const alreadyVerified =
              (
                match.result === "EXACT" ||
                match.result === "ROUNDING_TOLERANCE"
              ) &&
              match.currentStatus === "Verified";

            if (!alreadyVerified) {
              allPaymentLinesHandled = false;
            }

            console.log("NO SHEET CHANGES MADE");
          }
        }

        if (allPaymentLinesHandled) {
          await this.sheets.writeFinanceAgentLogRecord({
            reference:
              remittanceRecord.paymentReference ??
              remittanceRecord.messageId,
            type: "REMITTANCE",
            loggedAt: new Date().toISOString(),
            source: `Gmail message ${remittanceRecord.messageId}`,
            actionKey: getRemittanceEmailActionKey(
              remittanceRecord.messageId,
            ),
          });
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
      } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      const occurredAt = new Date().toISOString();

      try {
        await this.sheets.writeFinanceAgentLogRecord({
          reference: "FINANCE_AGENT",
          type: "ERROR",
          loggedAt: occurredAt,
          source:
            `FINANCE_INITIALISE — ${errorMessage}`,
          actionKey: getErrorActionKey(
            "FINANCE_INITIALISE",
            "FINANCE_AGENT",
            occurredAt,
          ),
        });
      } catch (logError) {
        console.error(
          "Unable to log Finance Agent processing error:",
          logError,
        );
      }

      throw error;
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