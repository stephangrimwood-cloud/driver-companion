export type ShiftMateReport = {
  shiftDate: string;
  cashTaken?: string;
  accountBookings?: string;
  areaCharge?: string;
  payable: number;
};

function parseAmount(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? "0");

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateForSheet(shiftDate: string): string {
  const [year, month, day] = shiftDate.split("-");

  return `${day}/${month}/${year}`;
}

export function mapReportToSheetRow(
  report: ShiftMateReport,
): (string | number)[] {

  const cashTaken = parseAmount(report.cashTaken);
  const areaCharge = parseAmount(report.areaCharge);
  const cashIncome = cashTaken - areaCharge;

  const settlement = -report.payable;
  const accountPayment = parseAmount(report.accountBookings);

  const totalIncome =
    cashIncome +
    settlement +
    accountPayment;

  return [
    formatDateForSheet(report.shiftDate),
    cashIncome,
    settlement,
    accountPayment,
    totalIncome,
    "CTL Export",
    "Pending",
  ];
}

export function mapReportsToSheetRow(
  reports: ShiftMateReport[],
): (string | number)[] {
  if (reports.length === 0) {
    throw new Error("At least one report is required.");
  }

  const shiftDate = reports[0].shiftDate;

  if (reports.some((report) => report.shiftDate !== shiftDate)) {
    throw new Error(
      "All reports must belong to the same shift date.",
    );
  }

  const cashIncome = reports.reduce(
    (total, report) =>
      total +
      parseAmount(report.cashTaken) -
      parseAmount(report.areaCharge),
    0,
  );

  const settlement = reports.reduce(
    (total, report) => total - report.payable,
    0,
  );

  const accountPayment = reports.reduce(
    (total, report) =>
      total + parseAmount(report.accountBookings),
    0,
  );

  const totalIncome =
    cashIncome +
    settlement +
    accountPayment;

  return [
    formatDateForSheet(shiftDate),
    cashIncome,
    settlement,
    accountPayment,
    totalIncome,
    reports.length > 1
      ? `CTL Export • ${reports.length} shifts`
      : "CTL Export",
    "Pending",
  ];
}