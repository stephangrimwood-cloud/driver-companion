import type {
  RemittancePaymentLine,
} from "./types";

export interface LedgerRemittanceMatch {
  ledgerDate: string;
  rowNumber: number;
  settlement: number;
  accountPayment: number;
  notes: string;
  currentStatus: string;
  remittanceAmount: number;
  result:
  | "EXACT"
  | "ROUNDING_TOLERANCE"
  | "NO_MATCH";
}

function parseCurrency(
  value: string | undefined,
): number | null {
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

    const accountPayment =
      parseCurrency(row[3]) ?? 0;

    const notes = row[5] ?? "";
    const currentStatus = row[6] ?? "";

    const settlementCents =
      Math.round(settlement * 100);

    const remittanceCents =
      Math.round(paymentLine.amountPaid * 100);

    const differenceCents =
      Math.abs(
        settlementCents - remittanceCents,
      );

    const result =
      differenceCents === 0
        ? "EXACT"
        : differenceCents === 1
          ? "ROUNDING_TOLERANCE"
          : "NO_MATCH";

    return {
      ledgerDate,
      rowNumber: rowIndex + 1,
      settlement,
      accountPayment,
      notes,
      currentStatus,
      remittanceAmount: paymentLine.amountPaid,
      result,
    };
  }

  return null;
}

export function canVerifyRemittanceMatch(
  match: LedgerRemittanceMatch,
): boolean {
  if (
  (
    match.result !== "EXACT" &&
    match.result !== "ROUNDING_TOLERANCE"
  ) ||
  match.currentStatus !== "Pending"
) {
  return false;
}

  if (match.accountPayment <= 0) {
    return true;
  }

  return match.notes.includes(
    "Account Booking ref:",
  );
}