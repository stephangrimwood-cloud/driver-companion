import { GmailAgent } from "./gmail";
import { financeAgentConfig } from "./config";
import { SheetsAgent } from "./sheets";
import { matchRemittancePaymentLine } from "./remittance-matcher";

export class FinanceService {
  private gmail = new GmailAgent(financeAgentConfig);
  private sheets = new SheetsAgent();

  async initialise(): Promise<void> {
    const remittanceRecords =
      await this.gmail.initialise();

    void this.sheets.readSpreadsheetTitle();

    const ledgerRows =
      await this.sheets.readMonthlyLedger("August");

    for (const remittanceRecord of remittanceRecords) {
      console.log(
        "Finance Service received remittance:",
        remittanceRecord,
      );

      if (remittanceRecord.validationStatus === "VALID") {
        for (const paymentLine of remittanceRecord.paymentLines) {
          const match =
            matchRemittancePaymentLine(
              paymentLine,
              ledgerRows,
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
            match.result === "EXACT" &&
            match.currentStatus === "Pending";

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
              "August",
              match.rowNumber,
              "Verified",
            );

            await this.sheets.writeVerificationRecord({
              ledgerDate: match.ledgerDate,
              method: "AUTOMATIC",
              verifiedAt: new Date().toISOString(),
              source: `CTL remittance ${remittanceRecord.messageId}`,
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