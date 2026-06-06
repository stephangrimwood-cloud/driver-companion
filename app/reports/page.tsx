"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Report = {
  id: string;
  createdAt: string;
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  meterTotal: string;
  tolls: string;
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
  note?: string;
};

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function money(value: number | undefined | null) {
  return `$${(value ?? 0).toFixed(2)}`;
}

function saveNote(
  reportId: string,
  note: string,
  reports: Report[],
  setReports: React.Dispatch<React.SetStateAction<Report[]>>
) {
  const updatedReports = reports.map((report) =>
    report.id === reportId
      ? { ...report, note }
      : report
  );

  setReports(updatedReports);
  localStorage.setItem("shiftReports", JSON.stringify(updatedReports));
}

function calculateShiftDuration(start?: string, end?: string) {
  if (!start || !end) return "";

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;

  // Handles overnight shifts
  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }

  const diff = endTotal - startTotal;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return `${hours}h ${minutes}m worked`;
}

function signedMoney(value: number | undefined | null) {
  const safeValue = value ?? 0;

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

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [noteDate, setNoteDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const weekStart = getMonday(new Date());

  weekStart.setDate(weekStart.getDate() + weekOffset * 7);

  const weekDates = weekDays.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const isoDate = toLocalDateKey(date);

    return {
      day,
      date,
      isoDate,
    };
  });

  useEffect(() => {
    const savedReports = JSON.parse(
      localStorage.getItem("driver-companion-reports") || "[]"
    );

    setReports(savedReports);
  }, []);

  const weeklyGross = weekDates.reduce((total, weekDay) => {
    const dayReports = reports.filter((report) => {
      const reportDate = report.shiftDate || report.createdAt.split("T")[0];
      return reportDate === weekDay.isoDate;
    });

    const dayTotal = dayReports.reduce((sum, report) => {
      const driverShare =
        report.driverShare ??
        report.ownerHalf - (parseFloat(report.levy) || 0);

      return sum + driverShare;
    }, 0);

    return total + dayTotal;
  }, 0);

  const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
  const monthEnd = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 0);

  const monthReports = reports.filter((report) => {
    const reportDateString = report.shiftDate || report.createdAt.split("T")[0];
    const reportDate = new Date(reportDateString);

    return reportDate >= monthStart && reportDate <= monthEnd;
  });

  const monthlyGross = monthReports.reduce((total, report) => {
    const driverShare =
      report.driverShare ??
      report.ownerHalf - (parseFloat(report.levy) || 0);

    return total + driverShare;
  }, 0);

  const monthlyGstEstimate = monthlyGross / 11;
  const monthlyEstimatedRemaining = monthlyGross - monthlyGstEstimate;

    function toLocalDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

    const gstEstimate = weeklyGross / 11;
    const estimatedRemaining = weeklyGross - gstEstimate;

    function deleteReport(reportId: string) {
    const updatedReports = reports.filter((report) => report.id !== reportId);

    setReports(updatedReports);

    localStorage.setItem(
      "driver-companion-reports",
      JSON.stringify(updatedReports)
    );

  }

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-[#2f2f30] via-[#2b2b2c] to-[#242425] p-5 text-zinc-100">
          <div className="mx-auto max-w-md space-y-5">
          <section className="rounded-2xl bg-[#3a3a3b] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold text-zinc-100">Weekly Reports</h1>

                <p className="mt-2 text-sm text-zinc-400">
                  Week: {formatDate(weekDates[0].date)} -{" "}
                  {formatDate(weekDates[6].date)}
                </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setWeekOffset((current) => current - 1)}
                  className="rounded-xl border border-[#5e5e60] bg-[#303031] px-3 py-2 text-sm font-semibold text-zinc-200"
                >
                  Previous
                </button>

                <button
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

        <section className="space-y-3 rounded-2xl bg-[#3a3a3b] p-4">
          {weekDates.map((weekDay) => {
            const dayReports = reports.filter((report) => {
              const reportDate =
                report.shiftDate || report.createdAt.split("T")[0];

              return reportDate === weekDay.isoDate;
            });

            const dayTotal = dayReports.reduce((sum, report) => {
              const driverShare =
                report.driverShare ??
                report.ownerHalf - (parseFloat(report.levy) || 0);

              return sum + driverShare;
            }, 0);

            const isOpen = openDate === weekDay.isoDate;

            return (
              <div
                key={weekDay.isoDate}
                className="rounded-xl border border-[#4a4a4b] bg-[#2f2f30] p-4"
              >
                <button
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
                      const driverShare =
                        report.driverShare ??
                        report.ownerHalf - (parseFloat(report.levy) || 0);

                        const ownerShare =
                        report.ownerShare ??
                        report.ownerHalf + (parseFloat(report.levy) || 0);

                      return (

                        <div
                          key={report.id}
                          className="rounded-xl bg-[#242425] p-4 text-sm"
                        >
                          <p className="mb-4 font-semibold text-zinc-200">
                            {formatDate(parseLocalDate(report.shiftDate || report.createdAt.split("T")[0]))} •{" "}
                            {parseLocalDate(
                              report.shiftDate || report.createdAt.split("T")[0]
                            ).toLocaleDateString("en-AU", {
                              weekday: "long",
                            })}
                          </p>

                          {report.shiftStart && report.shiftEnd && (
                            <div className="mb-4 flex justify-between text-sm text-zinc-400">
                                <span>
                                Shift: {report.shiftStart} - {report.shiftEnd}
                                </span>

                                <span>
                                {calculateShiftDuration(report.shiftStart, report.shiftEnd)}
                                </span>
                            </div>
                            )}

                          <ReceiptRow
                            label="Meter Total"
                            value={money(parseFloat(report.meterTotal) || 0)}
                            underline
                            />
                          <ReceiptRow label="Less Tolls" value={signedMoney(-(parseFloat(report.tolls) || 0))} />
                          <ReceiptRow label="Plus Quotes" value={`+$${(parseFloat(report.quotes) || 0).toFixed(2)}`} />
                          <ReceiptRow label="Less Evasions / Errors" value={signedMoney(-(parseFloat(report.emes) || 0))} underline />

                          <ReceiptRow
                            label="Shift Total"
                            value={money(report.shiftTotal)}
                            underline
                            />

                          <ReceiptRow label="Owner 50%" value={money(report.ownerHalf)} />

                            <ReceiptRow
                            label="Plus Shift Levy"
                            value={signedMoney(parseFloat(report.levy) || 0)}
                            underline
                            />

                            <ReceiptRow
                            label="Owner Amount"
                            value={money(ownerShare)}
                            underline
                            />

                          <ReceiptRow label="Less Owner Dockets" value={signedMoney(-(parseFloat(report.dockets) || 0))} />
                          <ReceiptRow label="Less Fuel Cash" value={signedMoney(-(parseFloat(report.fuel) || 0))} />
                          <ReceiptRow
                            label="Less EFTPOS"
                            value={signedMoney(-(parseFloat(report.eftpos) || 0))}
                            underline
                            />

                            <div className="pt-3">
                            <ReceiptRow
                                label="Settlement"
                                value={signedMoney(report.payable)}
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
                            <ReceiptRow label="Driver Share" value={money(driverShare)} />
                            <ReceiptRow label="Owner Share" value={money(ownerShare)} />
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setNoteDate(report.id);
                                setNoteText(report.note ?? "");
                              }}
                              className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
                            >
                              {report.note ? "Edit Note" : "Add Note"}
                            </button>

                            <button
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
          <h2 className="text-lg font-semibold text-white">
            Weekly Summary
          </h2>

          <SummaryRow label="Weekly Gross Earnings" value={money(weeklyGross)} highlight />
          <SummaryRow label="Estimated GST" value={money(gstEstimate)} warning />

          <div className="border-t border-[#4a4a4b] pt-4">
            <SummaryRow label="Estimated Remaining" value={money(estimatedRemaining)} strong />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-[#3a3a3b] p-4">
          <h2 className="text-lg font-semibold text-white">
            Monthly Summary
          </h2>

          <p className="text-sm text-zinc-400">
            {monthStart.toLocaleDateString("en-AU", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <SummaryRow label="Monthly Gross Earnings" value={money(monthlyGross)} highlight />
          <SummaryRow label="Estimated GST" value={money(monthlyGstEstimate)} warning />

          <div className="border-t border-[#4a4a4b] pt-4">
            <SummaryRow
              label="Estimated Remaining"
              value={money(monthlyEstimatedRemaining)}
              strong
            />
          </div>
        </section>

            </div>

      {noteDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">
          <div className="w-full max-w-md rounded-2xl border border-[#4a4a4b] bg-[#303031] p-4 shadow-xl">
            <h2 className="text-lg font-semibold text-white">
              Report Note
            </h2>

            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Add a note for this shift..."
              className="mt-4 min-h-32 w-full rounded-xl border border-[#5e5e60] bg-[#242425] p-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setNoteDate(null);
                  setNoteText("");
                }}
                className="rounded-xl border border-[#5e5e60] bg-[#303031] px-4 py-2 text-sm font-semibold text-zinc-200"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  saveNote(noteDate, noteText, reports, setReports);
                  setNoteDate(null);
                  setNoteText("");
                }}
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
    <div className={`${spacer ? "mt-4" : "mt-2"} grid grid-cols-[1fr_110px] gap-4`}>
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