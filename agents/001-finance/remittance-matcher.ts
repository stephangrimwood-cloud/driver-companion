import type {
  RemittancePaymentLine,
} from "./types";

export interface LedgerRemittanceMatch {
  ledgerDate: string;
  rowNumber: number;
  settlement: number;
  currentStatus: string;
  remittanceAmount: number;
  result: "EXACT" | "NO_MATCH";
}

function parseCurrency(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const cleaned = value
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .trim();

  const amount = Number(cleaned);

  return Number.isFinite(amount)
    ? amount
    : null;
}

function referenceMatchesLedgerDate(
  reference: string,
  ledgerDate: string,
): boolean {
  if (!/^\d{2}\/\d{2}$/.test(ledgerDate)) {
    return false;
  }

  const ledgerDateDigits =
    ledgerDate.replace(/\D/g, "");

  return reference.startsWith(ledgerDateDigits);
}

export function matchRemittancePaymentLine(
  paymentLine: RemittancePaymentLine,
  ledgerRows: string[][],
): LedgerRemittanceMatch | null {
  for (const [rowIndex, row] of ledgerRows.entries()) {
    const ledgerDate = row[0];

    if (
      !ledgerDate ||
      !referenceMatchesLedgerDate(
        paymentLine.reference,
        ledgerDate,
      )
    ) {
      continue;
    }

    const settlement = parseCurrency(row[2]);

    if (settlement === null) {
      return null;
    }

    const currentStatus = row[6] ?? "";

    const exactMatch =
      Math.abs(
        settlement - paymentLine.amountPaid,
      ) < 0.001;

    return {
      ledgerDate,
      rowNumber: rowIndex + 1,
      settlement,
      currentStatus,
      remittanceAmount: paymentLine.amountPaid,
      result: exactMatch
        ? "EXACT"
        : "NO_MATCH",
    };
  }

  return null;
}