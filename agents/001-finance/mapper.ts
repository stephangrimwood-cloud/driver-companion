export type DriverCompanionReport = {
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
  report: DriverCompanionReport,
): (string | number)[] {
  if (report.payable > 0) {
    throw new Error(
      "This report shows money payable to Cairns Taxis and cannot be exported as income.",
    );
  }

  const cashTaken = parseAmount(report.cashTaken);
  const areaCharge = parseAmount(report.areaCharge);
  const cashIncome = cashTaken - areaCharge;

  const settlement = Math.abs(report.payable);
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