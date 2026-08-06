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

const FIRST_DATA_ROW = 6;

export function getWorksheetName(shiftDate: string): string {
  const [, month] = shiftDate.split("-");

  return MONTHS[Number(month) - 1];
}

export function getWorksheetRow(shiftDate: string): number {
  const [, , day] = shiftDate.split("-");

  return FIRST_DATA_ROW + Number(day) - 1;
}