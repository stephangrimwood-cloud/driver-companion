import { RestorableReport } from "./parser";

type LocalReportReference = {
  id: string;
};

export function findMissingReports(
  localReports: LocalReportReference[],
  cloudReports: RestorableReport[],
): RestorableReport[] {
  const localIds = new Set(
    localReports.map((report) => report.id),
  );

  return cloudReports.filter(
    (report) => !localIds.has(report.id),
  );
}