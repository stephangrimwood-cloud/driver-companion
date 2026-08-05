import { findMissingReports } from "../agents/finance/comparer";
import type { RestorableReport } from "../agents/finance/parser";

type LocalReportReference = {
  id: string;
};

type BackupResponse = {
  success: boolean;
  reports: RestorableReport[];
};

export type CloudBackupSummary = {
  cloudReportCount: number;
  localReportCount: number;
  missingReportCount: number;
};

async function fetchCloudReports(): Promise<RestorableReport[]> {
  const response = await fetch("/api/finance/backup");

  if (!response.ok) {
    throw new Error("Unable to read cloud backups.");
  }

  const data: BackupResponse = await response.json();

  if (!data.success || !Array.isArray(data.reports)) {
    throw new Error("Cloud backup response was invalid.");
  }

  return data.reports;
}

export async function getMissingReports(
  localReports: LocalReportReference[],
): Promise<RestorableReport[]> {
  const cloudReports = await fetchCloudReports();

  return findMissingReports(
    localReports,
    cloudReports,
  );
}

export async function checkForMissingReports(
  localReports: LocalReportReference[],
): Promise<number> {
  const missingReports = await getMissingReports(localReports);

  return missingReports.length;
}

export async function getCloudBackupSummary(
  localReports: LocalReportReference[],
): Promise<CloudBackupSummary> {
  const cloudReports = await fetchCloudReports();

  const missingReports = findMissingReports(
    localReports,
    cloudReports,
  );

  return {
    cloudReportCount: cloudReports.length,
    localReportCount: localReports.length,
    missingReportCount: missingReports.length,
  };
}

type StoredReportReference = {
  id: string;
  createdAt: string;
};

export function mergeMissingReports<
  T extends StoredReportReference,
>(
  localReports: T[],
  missingReports: T[],
): T[] {
  const seenIds = new Set(
    localReports.map((report) => report.id),
  );

  const uniqueMissingReports = missingReports.filter(
    (report) => {
      if (seenIds.has(report.id)) {
        return false;
      }

      seenIds.add(report.id);
      return true;
    },
  );

  return [
    ...uniqueMissingReports,
    ...localReports,
  ].sort(
    (firstReport, secondReport) =>
      new Date(secondReport.createdAt).getTime() -
      new Date(firstReport.createdAt).getTime(),
  );
}