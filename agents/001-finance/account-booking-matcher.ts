import type {
  AccountBookingEmailRecord,
} from "./types";

export interface LedgerAccountBookingMatch {
  ledgerDate: string;
  rowNumber: number;
  accountPayment: number;
  currentStatus: string;
  bookingAmount: number;
  bookingReference: string;
  result: "EXACT" | "NO_MATCH";
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

function parsePaymentDate(
  paymentDate: string,
): Date | null {
  const match = paymentDate.match(
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/,
  );

  if (!match) {
    return null;
  }

  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const month = months[match[2]];

  if (month === undefined) {
    return null;
  }

  return new Date(
    Date.UTC(
      Number(match[3]),
      month,
      Number(match[1]),
    ),
  );
}

function parseLedgerDate(
  ledgerDate: string,
  year: number,
): Date | null {
  const match = ledgerDate.match(
    /^(\d{2})\/(\d{2})$/,
  );

  if (!match) {
    return null;
  }

  return new Date(
    Date.UTC(
      year,
      Number(match[2]) - 1,
      Number(match[1]),
    ),
  );
}

export function matchAccountBookingRecord(
  record: AccountBookingEmailRecord,
  ledgerRows: string[][],
): LedgerAccountBookingMatch | null {
  if (
    record.paymentDate === null ||
    record.paymentAmount === null ||
    record.bookingReference === null
  ) {
    return null;
  }

  const paymentDate =
    parsePaymentDate(record.paymentDate);

  if (!paymentDate) {
    return null;
  }

  const paymentYear =
    paymentDate.getUTCFullYear();

  const matches: LedgerAccountBookingMatch[] = [];

  for (const [rowIndex, row] of ledgerRows.entries()) {
    const ledgerDate = row[0];

    if (!ledgerDate) {
      continue;
    }

    const parsedLedgerDate =
      parseLedgerDate(
        ledgerDate,
        paymentYear,
      );

    if (
      !parsedLedgerDate ||
      parsedLedgerDate > paymentDate
    ) {
      continue;
    }

    const accountPayment =
      parseCurrency(row[3]);

    if (accountPayment === null) {
      continue;
    }

    const currentStatus =
      row[6] ?? "";

    if (currentStatus !== "Pending") {
      continue;
    }

    const exactMatch =
      Math.abs(
        accountPayment - record.paymentAmount,
      ) < 0.001;

    if (!exactMatch) {
      continue;
    }

    matches.push({
      ledgerDate,
      rowNumber: rowIndex + 1,
      accountPayment,
      currentStatus,
      bookingAmount: record.paymentAmount,
      bookingReference:
        record.bookingReference,
      result: "EXACT",
    });
  }

  if (matches.length !== 1) {
    return null;
  }

  return matches[0];
}