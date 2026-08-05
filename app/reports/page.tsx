"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCloudBackupSummary,
  getMissingReports,
  type CloudBackupSummary,
} from "@/lib/restore";

const REPORTS_STORAGE_KEY = "driver-companion-reports";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Report = {
  id: string;
  createdAt: string;
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  cashTaken?: string;
  accountBookings?: string;
  meterTotal: string;
  areaCharge: string;
  tolls?: string;
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
  driverShare?: number;
  ownerShare?: number;
  exportedToGoogleSheets?: boolean;
  exportedAt?: string;
  note?: string;

  backedUpToGoogleSheets?: boolean;
  backedUpAt?: string;
  backupError?: string;
};

function parseAmount(value: string | undefined) {
  const parsed = Number.parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number | undefined | null) {
  return `$${(value ?? 0).toFixed(2)}`;
}

function signedMoney(value: number | undefined | null) {
  const safeValue = value ?? 0;

  if (safeValue < 0) {
    return `-$${Math.abs(safeValue).toFixed(2)}`;
  }

  if (safeValue > 0) {
    return `+$${safeValue.toFixed(2)}`;
  }

  return "$0.00";
}


function formatSettlement(value: number | undefined | null) {
  const safeValue = value ?? 0;

  // Settlement convention:
  // -$ = payable to the driver
  // +$ = payable to the owner/operator
  if (safeValue <= 0) {
    return `-$${Math.abs(safeValue).toFixed(2)}`;
  }

  return `+$${safeValue.toFixed(2)}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-AU");
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function getReportDateKey(report: Report) {
  return report.shiftDate || report.createdAt.split("T")[0];
}

function getDriverShare(report: Report) {
  return report.driverShare ?? report.ownerHalf - parseAmount(report.levy);
}

function getOwnerShare(report: Report) {
  return report.ownerShare ?? report.ownerHalf + parseAmount(report.levy);
}

function calculateShiftDuration(start?: string, end?: string) {
  if (!start || !end) return "";

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;

  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }

  const difference = endTotal - startTotal;
  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;

  return `${hours}h ${minutes}m worked`;
}

function loadReports(): Report[] {
  try {
    const storedValue = localStorage.getItem(REPORTS_STORAGE_KEY);

    if (!storedValue) return [];

    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as Report[]) : [];
  } catch (error) {
    console.error("Unable to load saved shift reports:", error);
    return [];
  }
}

function storeReports(reports: Report[]) {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [noteReportId, setNoteReportId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [cloudSummary, setCloudSummary] =
    useState<CloudBackupSummary | null>(null);
  const [isRestoringReports, setIsRestoringReports] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");    

  const [exportingReportId, setExportingReportId] = useState<string | null>(
    null,
  );

  const [exportResults, setExportResults] = useState<
    Record<string, "success" | "error">
  >({});

  const weekStart = getMonday(new Date());
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);

  const weekDates = WEEK_DAYS.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      day,
      date,
      isoDate: toLocalDateKey(date),
    };
  });

  useEffect(() => {
    const localReports = loadReports();

    setReports(localReports);

    getCloudBackupSummary(localReports)
      .then((summary) => {
        setCloudSummary(summary);
      })
      .catch((error) => {
        console.error(
          "Unable to load cloud backup summary:",
          error,
        );
      });
  }, []);

  const weeklyGross = weekDates.reduce((weekTotal, weekDay) => {
    const dayTotal = reports
      .filter((report) => getReportDateKey(report) === weekDay.isoDate)
      .reduce((total, report) => total + getDriverShare(report), 0);

    return weekTotal + dayTotal;
  }, 0);

  const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
  const monthEnd = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const monthlyGross = reports
    .filter((report) => {
      const reportDate = parseLocalDate(getReportDateKey(report));
      return reportDate >= monthStart && reportDate <= monthEnd;
    })
    .reduce((total, report) => total + getDriverShare(report), 0);

  const weeklyGstEstimate = weeklyGross / 11;
  const weeklyEstimatedRemaining = weeklyGross - weeklyGstEstimate;
  const monthlyGstEstimate = monthlyGross / 11;
  const monthlyEstimatedRemaining = monthlyGross - monthlyGstEstimate;

  function updateReports(updatedReports: Report[]) {
    setReports(updatedReports);
    storeReports(updatedReports);
  }

  function saveNote() {
    if (!noteReportId) return;

    const updatedReports = reports.map((report) =>
      report.id === noteReportId ? { ...report, note: noteText } : report
    );

    updateReports(updatedReports);
    setNoteReportId(null);
    setNoteText("");
  }

  function deleteReport(reportId: string) {
    const updatedReports = reports.filter((report) => report.id !== reportId);
    updateReports(updatedReports);
  }

  async function exportToGoogleSheets(report: Report) {
    setExportingReportId(report.id);

    try {
      const response = await fetch("/api/finance/export/google-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Export failed.");
      }

      setExportResults((current) => ({
        ...current,
        [report.id]: "success",
      }));

      const updatedReports = reports.map((existingReport) =>
        existingReport.id === report.id
          ? {
              ...existingReport,
              exportedToGoogleSheets: true,
              exportedAt: new Date().toISOString(),
            }
          : existingReport,
      );

      updateReports(updatedReports);

    } catch (error) {
      console.error("Unable to export report:", error);

      setExportResults((current) => ({
        ...current,
        [report.id]: "error",
      }));
    } finally {
      setExportingReportId(null);
    }
  }

  async function restoreMissingCloudReports() {
    setIsRestoringReports(true);
    setRestoreMessage("");

    try {
      const localReports = loadReports();

      const missingReports = await getMissingReports(localReports);

      const restoredReports: Report[] = missingReports.map((report) => ({
        ...report,
        backedUpToGoogleSheets: true,
        backupError: undefined,
      }));

      const mergedReports: Report[] = [
        ...restoredReports,
        ...localReports,
      ].sort(
        (firstReport, secondReport) =>
          new Date(secondReport.createdAt).getTime() -
          new Date(firstReport.createdAt).getTime(),
      );

      localStorage.setItem(
        REPORTS_STORAGE_KEY,
        JSON.stringify(mergedReports),
      );

      setReports(mergedReports);

      setCloudSummary((currentSummary) =>
        currentSummary
          ? {
              ...currentSummary,
              localReportCount: mergedReports.length,
              missingReportCount: 0,
            }
          : null,
      );

      setRestoreMessage(
        restoredReports.length === 1
          ? "✓ 1 report restored successfully."
          : `✓ ${restoredReports.length} reports restored successfully.`,
      );
    } catch (error) {
      console.error("Unable to restore reports:", error);

      setRestoreMessage(
        "Restore failed. Existing local reports were not changed.",
      );
    } finally {
      setIsRestoringReports(false);
    }
  }

  return (

    <main className="min-h-screen bg-gradient-to-b from-[#2f2f30] via-[#2b2b2c] to-[#242425] p-5 text-zinc-100">
      <div className="mx-auto max-w-md space-y-5">
        <section className="rounded-2xl bg-[#3a3a3b] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-zinc-100">
                Weekly Reports
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Week: {formatDate(weekDates[0].date)} -{" "}
                {formatDate(weekDates[6].date)}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWeekOffset((current) => current - 1)}
                  className="rounded-xl border border-[#5e5e60] bg-[#303031] px-3 py-2 text-sm font-semibold text-zinc-200"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className={
                    weekOffset === 0
                      ? "rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] px-3 py-2 text-sm font-semibold text-amber-100"
                      : "rounded-xl border border-[#5e5e60] bg-[#303031] px-3 py-2 text-sm font-semibold text-zinc-200"
                  }
                >
                  Current
                </button>

                <button
                  type="button"
                  onClick={() => setWeekOffset((current) => current + 1)}
                  className="rounded-xl border border-[#5e5e60] bg-[#303031] px-3 py-2 text-sm font-semibold text-zinc-200"
                >
                  Next
                </button>
              </div>
            </div>

            <Link
              href="/"
              className="shrink-0 rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] px-4 py-2 text-sm font-semibold text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_4px_14px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-amber-400/60 hover:from-[#5a4a34] hover:to-[#35302a] hover:text-white"
            >
              Home
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
            ☁ Cloud Backup Status
          </p>

          {cloudSummary === null ? (
            <p className="mt-3 text-sm text-zinc-300">
              Checking cloud backups...
            </p>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 px-2 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Cloud
                  </p>

                  <p className="mt-1 text-lg font-semibold text-sky-200">
                    {cloudSummary.cloudReportCount}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 px-2 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Device
                  </p>

                  <p className="mt-1 text-lg font-semibold text-zinc-200">
                    {cloudSummary.localReportCount}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 px-2 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Missing
                  </p>

                  <p
                    className={`mt-1 text-lg font-semibold ${
                      cloudSummary.missingReportCount === 0
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {cloudSummary.missingReportCount}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-zinc-300">
                {cloudSummary.missingReportCount === 0 ? (
                  <>
                    <span className="font-semibold text-emerald-300">
                      ✓ Device is fully synchronised.
                    </span>

                    <br />

                    No reports require restoration.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-amber-300">
                      ⚠ {cloudSummary.missingReportCount} report
                      {cloudSummary.missingReportCount === 1 ? "" : "s"} available for
                      restoration.
                    </span>

                    <br />

                    Restore available from your cloud backup.
                  </>
                )}
              </p>

              {cloudSummary.missingReportCount > 0 && (
                <button
                  type="button"
                  onClick={restoreMissingCloudReports}
                  disabled={isRestoringReports}
                  className="mt-4 w-full rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRestoringReports
                    ? "Restoring reports..."
                    : `Restore ${cloudSummary.missingReportCount} Report${
                        cloudSummary.missingReportCount === 1 ? "" : "s"
                      }`}
                </button>
              )}

              {restoreMessage && (
                <p className="mt-3 text-sm text-zinc-300">
                  {restoreMessage}
                </p>
              )}
            </>
          )}
        </section>

        <section className="space-y-3 rounded-2xl bg-[#3a3a3b] p-4">
          {weekDates.map((weekDay) => {
            const dayReports = reports.filter(
              (report) => getReportDateKey(report) === weekDay.isoDate
            );

            const dayTotal = dayReports.reduce(
              (total, report) => total + getDriverShare(report),
              0
            );

            const isOpen = openDate === weekDay.isoDate;

            return (
              <div
                key={weekDay.isoDate}
                className="rounded-xl border border-[#4a4a4b] bg-[#2f2f30] p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenDate(isOpen ? null : weekDay.isoDate)
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-zinc-400">
                          {formatDate(weekDay.date)}
                        </p>

                        {dayReports.some((report) => report.note?.trim()) && (
                          <span className="text-[11px] font-medium text-amber-400/70">
                            ● Note Added
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xl font-bold text-zinc-100">
                        {weekDay.day}
                      </p>
                    </div>

                    <p className="text-2xl font-black text-emerald-300">
                      {money(dayTotal)}
                    </p>
                  </div>
                </button>

                {isOpen && dayReports.length > 0 && (
                  <div className="mt-4 space-y-4 border-t border-[#4a4a4b] pt-4">
                    {dayReports.map((report) => {
                      const reportDateKey = getReportDateKey(report);
                      const reportDate = parseLocalDate(reportDateKey);
                      const driverShare = getDriverShare(report);
                      const ownerShare = getOwnerShare(report);

                      return (
                        <div
                          key={report.id}
                          className="rounded-xl bg-[#242425] p-4 text-sm"
                        >
                          <p className="mb-4 font-semibold text-zinc-200">
                            {formatDate(reportDate)} •{" "}
                            {reportDate.toLocaleDateString("en-AU", {
                              weekday: "long",
                            })}
                          </p>

                          {report.shiftStart && report.shiftEnd && (
                            <div className="mb-4 flex justify-between gap-3 text-sm text-zinc-400">
                              <span>
                                Shift: {report.shiftStart} - {report.shiftEnd}
                              </span>

                              <span>
                                {calculateShiftDuration(
                                  report.shiftStart,
                                  report.shiftEnd
                                )}
                              </span>
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-zinc-300">Cash Taken</span>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] italic text-zinc-500">
                                Reference only
                              </span>

                              <span className="tabular-nums text-zinc-200">
                                {money(parseAmount(report.cashTaken))}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-zinc-300">Account Bookings</span>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] italic text-zinc-500">
                                Reference only
                              </span>

                              <span className="tabular-nums text-zinc-200">
                                {money(parseAmount(report.accountBookings))}
                              </span>
                            </div>
                          </div>

                          <div className="my-3 border-t border-[#4a4a4b]" />

                          <ReceiptRow
                            label="Meter Total"
                            value={money(parseAmount(report.meterTotal))}
                            underline
                          />
                          <ReceiptRow
                            label="Less Area Charge"
                            value={signedMoney(
                              -parseAmount(report.areaCharge ?? report.tolls)
                            )}
                          />
                          <ReceiptRow
                            label="Plus Quotes"
                            value={signedMoney(parseAmount(report.quotes))}
                          />
                          <ReceiptRow
                            label="Less Evasions / Errors"
                            value={signedMoney(-parseAmount(report.emes))}
                            underline
                          />

                          <ReceiptRow
                            label="Shift Total"
                            value={money(report.shiftTotal)}
                            underline
                          />

                          <ReceiptRow
                            label="Owner 50%"
                            value={money(report.ownerHalf)}
                          />
                          <ReceiptRow
                            label="Plus Shift Levy"
                            value={signedMoney(parseAmount(report.levy))}
                            underline
                          />
                          <ReceiptRow
                            label="Owner Amount"
                            value={money(ownerShare)}
                            underline
                          />

                          <ReceiptRow
                            label="Less Owner Dockets"
                            value={signedMoney(-parseAmount(report.dockets))}
                          />
                          <ReceiptRow
                            label="Less Fuel Cash"
                            value={signedMoney(-parseAmount(report.fuel))}
                          />
                          <ReceiptRow
                            label="Less EFTPOS"
                            value={signedMoney(-parseAmount(report.eftpos))}
                            underline
                          />

                          <div className="pt-3">
                            <ReceiptRow
                              label="Settlement"
                              value={formatSettlement(report.payable)}
                              doubleUnderline
                              strong
                            />
                          </div>

                          <p className="mt-2 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            {report.payable >= 0
                              ? "Pay Into Envelope"
                              : "Payable to Driver"}
                          </p>

                          <div className="mt-5 border-t border-[#4a4a4b] pt-4">
                            <ReceiptRow
                              label="Driver Share"
                              value={money(driverShare)}
                            />
                            <ReceiptRow
                              label="Owner Share"
                              value={money(ownerShare)}
                            />
                          </div>

                          <div className="my-4 border-t border-[#4a4a4b]" />

                          <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-900/30 px-3 py-2">
                            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
                              Reconciliation Check
                            </p>

                            <div className="space-y-1 text-center text-xs italic text-zinc-400">
                              <div>Cash Taken</div>
                              <div>+ Account Bookings (if any)</div>
                              <div>+ Settlement Paid to Driver</div>
                              <div>− Area Charge</div>

                              <div className="my-2 border-t border-zinc-700" />

                              <div className="font-medium text-zinc-300">
                                = Driver Share
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div
                              className={`rounded-xl border px-3 py-2 text-center ${
                                report.backedUpToGoogleSheets
                                  ? "border-sky-400/30 bg-sky-500/10"
                                  : "border-red-400/30 bg-red-500/10"
                              }`}
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                Cloud Backup
                              </p>

                              <p
                                className={`mt-1 text-sm font-semibold ${
                                  report.backedUpToGoogleSheets
                                    ? "text-sky-200"
                                    : "text-red-200"
                                }`}
                              >
                                {report.backedUpToGoogleSheets
                                  ? "☁ Backed Up"
                                  : "⚠ Not Backed Up"}
                              </p>
                            </div>

                            <div
                              className={`rounded-xl border px-3 py-2 text-center ${
                                report.exportedToGoogleSheets
                                  ? "border-emerald-400/30 bg-emerald-500/10"
                                  : "border-amber-400/30 bg-amber-500/10"
                              }`}
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                                Monthly Ledger
                              </p>

                              <p
                                className={`mt-1 text-sm font-semibold ${
                                  report.exportedToGoogleSheets
                                    ? "text-emerald-200"
                                    : "text-amber-200"
                                }`}
                              >
                                {report.exportedToGoogleSheets
                                  ? "✓ Synced"
                                  : "Pending Sync"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => exportToGoogleSheets(report)}
                            disabled={exportingReportId === report.id}
                            className="mt-4 w-full rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {exportingReportId === report.id
                              ? "Exporting..."
                              : report.exportedToGoogleSheets
                                ? "☁ Synced"
                                : exportResults[report.id] === "error"
                                  ? "Export failed — try again"
                                  : "Export to Google Sheets"}
                          </button>

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNoteReportId(report.id);
                                setNoteText(report.note ?? "");
                              }}
                              className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
                            >
                              {report.note ? "Edit Note" : "Add Note"}
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteReport(report.id)}
                              className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                            >
                              Delete Report
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="space-y-4 rounded-2xl bg-[#3a3a3b] p-4">
          <h2 className="text-lg font-semibold text-white">Weekly Summary</h2>

          <SummaryRow
            label="Weekly Gross Earnings"
            value={money(weeklyGross)}
            highlight
          />
          <SummaryRow
            label="Estimated GST"
            value={money(weeklyGstEstimate)}
            warning
          />

          <div className="border-t border-[#4a4a4b] pt-4">
            <SummaryRow
              label="Estimated Remaining"
              value={money(weeklyEstimatedRemaining)}
              strong
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-[#3a3a3b] p-4">
          <h2 className="text-lg font-semibold text-white">Monthly Summary</h2>

          <p className="text-sm text-zinc-400">
            {monthStart.toLocaleDateString("en-AU", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <SummaryRow
            label="Monthly Gross Earnings"
            value={money(monthlyGross)}
            highlight
          />
          <SummaryRow
            label="Estimated GST"
            value={money(monthlyGstEstimate)}
            warning
          />

          <div className="border-t border-[#4a4a4b] pt-4">
            <SummaryRow
              label="Estimated Remaining"
              value={money(monthlyEstimatedRemaining)}
              strong
            />
          </div>
        </section>
      </div>

      {noteReportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
          <div className="w-full max-w-md rounded-2xl border border-[#4a4a4b] bg-[#303031] p-4 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Report Note</h2>

            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Add a note for this shift..."
              className="mt-4 min-h-32 w-full rounded-xl border border-[#5e5e60] bg-[#242425] p-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setNoteReportId(null);
                  setNoteText("");
                }}
                className="rounded-xl border border-[#5e5e60] bg-[#303031] px-4 py-2 text-sm font-semibold text-zinc-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveNote}
                className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] px-4 py-2 text-sm font-semibold text-amber-100"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ReceiptRow({
  label,
  value,
  underline = false,
  doubleUnderline = false,
  strong = false,
  spacer = false,
}: {
  label: string;
  value: string;
  underline?: boolean;
  doubleUnderline?: boolean;
  strong?: boolean;
  spacer?: boolean;
}) {
  return (
    <div
      className={`${
        spacer ? "mt-4" : "mt-2"
      } grid grid-cols-[1fr_110px] gap-4`}
    >
      <span className="text-zinc-300">{label}</span>

      <span
        className={`text-right tabular-nums ${
          strong ? "font-semibold text-zinc-100" : "text-zinc-200"
        } ${
          underline
            ? "border-b border-zinc-400 pb-1.5"
            : doubleUnderline
              ? "border-b-4 border-double border-zinc-300 pb-1"
              : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
  warning = false,
  strong = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between text-lg">
      <span className="text-zinc-300">{label}</span>

      <span
        className={`font-bold tabular-nums ${
          highlight
            ? "text-emerald-300"
            : warning
              ? "text-red-300"
              : strong
                ? "text-zinc-100"
                : "text-zinc-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
