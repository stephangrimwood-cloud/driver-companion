export type RestorableReport = {
  id: string;
  createdAt: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  cashTaken: string;
  accountBookings: string;
  meterTotal: string;
  areaCharge: string;
  quotes: string;
  emes: string;
  shiftTotal: number;
  ownerHalf: number;
  levy: string;
  ownerAmount: number;
  dockets: string;
  fuel: string;
  eftpos: string;
  payable: number;
  driverShare: number;
  ownerShare: number;

  exportedToGoogleSheets?: boolean;
  exportedAt?: string;
  note?: string;

  backedUpToGoogleSheets?: boolean;
  backedUpAt?: string;
  backupError?: string;
};

export function parseReportBackups(
  backups: string[],
): RestorableReport[] {
  const reports: RestorableReport[] = [];

  for (const backup of backups) {
    try {
      const report: unknown = JSON.parse(backup);

      if (isRestorableReport(report)) {
        reports.push(report);
      }
    } catch (error) {
      console.warn("Skipping invalid backup JSON:", error);
    }
  }

  return reports;
}

function isRestorableReport(
  value: unknown,
): value is RestorableReport {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const report = value as Record<string, unknown>;

  const requiredStringFields = [
    "id",
    "createdAt",
    "shiftDate",
    "shiftStart",
    "shiftEnd",
    "cashTaken",
    "accountBookings",
    "meterTotal",
    "areaCharge",
    "quotes",
    "emes",
    "levy",
    "dockets",
    "fuel",
    "eftpos",
  ];

  const requiredNumberFields = [
    "shiftTotal",
    "ownerHalf",
    "ownerAmount",
    "payable",
    "driverShare",
    "ownerShare",
  ];

  const hasRequiredStrings = requiredStringFields.every(
    (field) => typeof report[field] === "string",
  );

  const hasRequiredNumbers = requiredNumberFields.every(
    (field) =>
      typeof report[field] === "number" &&
      Number.isFinite(report[field]),
  );

  const hasValidOptionalFields =
    (report.exportedToGoogleSheets === undefined ||
      typeof report.exportedToGoogleSheets === "boolean") &&
    (report.exportedAt === undefined ||
      typeof report.exportedAt === "string") &&
    (report.note === undefined ||
      typeof report.note === "string") &&
    (report.backedUpToGoogleSheets === undefined ||
      typeof report.backedUpToGoogleSheets === "boolean") &&
    (report.backedUpAt === undefined ||
      typeof report.backedUpAt === "string") &&
    (report.backupError === undefined ||
      typeof report.backupError === "string");

  return (
    hasRequiredStrings &&
    hasRequiredNumbers &&
    hasValidOptionalFields
  );
}