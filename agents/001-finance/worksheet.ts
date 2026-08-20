const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const FINANCIAL_YEAR_MONTHS = [
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
] as const;

const FIRST_DATA_ROW = 6;

export function getWorksheetName(
  shiftDate: string,
): string {
  const [, month] = shiftDate.split("-");

  return MONTHS[Number(month) - 1];
}

export function getWorksheetRow(
  shiftDate: string,
): number {
  const [, , day] = shiftDate.split("-");

  return FIRST_DATA_ROW + Number(day) - 1;
}

export function getFinancialYearWorksheetNames():
  string[] {
  return [...FINANCIAL_YEAR_MONTHS];
}

export function getWorksheetNameFromReference(
  reference: string,
): string | null {
  if (!/^\d{8}$/.test(reference)) {
    return null;
  }

  const month = reference.slice(2, 4);
  const monthNumber = Number(month);

  if (
    !Number.isInteger(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return null;
  }

  return MONTHS[monthNumber - 1];
}

export function getFinancialYearWorksheetNameFromReference(
  reference: string,
  financialYearStartYear: number,
): string | null {
  const sheetName =
    getWorksheetNameFromReference(reference);

  if (!sheetName) {
    return null;
  }

  const month =
    Number(reference.slice(2, 4));

  const year =
    Number(reference.slice(4, 8));

  const expectedYear =
    month >= 7
      ? financialYearStartYear
      : financialYearStartYear + 1;

  if (year !== expectedYear) {
    return null;
  }

  return sheetName;
}