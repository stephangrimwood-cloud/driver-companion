"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ShiftReport = {
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
};

const REPORTS_STORAGE_KEY = "driver-companion-reports";
const SHIFT_LEVY = "5.50";

function getLocalDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toNumber(value: string) {
  return parseFloat(value) || 0;
}

function loadReports(): ShiftReport[] {
  try {
    const storedReports = localStorage.getItem(REPORTS_STORAGE_KEY);

    if (!storedReports) {
      return [];
    }

    const parsedReports = JSON.parse(storedReports);

    return Array.isArray(parsedReports) ? parsedReports : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [shiftDate, setShiftDate] = useState(getLocalDateKey);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");

  const [cashTaken, setCashTaken] = useState("0.00");
  const [accountBookings, setAccountBookings] = useState("0.00");
  const [eftpos, setEftpos] = useState("0.00");
  const [meterTotal, setMeterTotal] = useState("0.00");
  const [areaCharge, setAreaCharge] = useState("0.00");
  const [quotes, setQuotes] = useState("0.00");
  const [emes, setEmes] = useState("0.00");
  const [dockets, setDockets] = useState("0.00");
  const [fuel, setFuel] = useState("0.00");

  const [saveMessage, setSaveMessage] = useState("");

  const shiftTotal =
    toNumber(meterTotal) -
    toNumber(areaCharge) +
    toNumber(quotes) -
    toNumber(emes);

  const ownerHalf = shiftTotal / 2;
  const ownerAmount = ownerHalf + toNumber(SHIFT_LEVY);

  const payable =
    ownerAmount -
    toNumber(dockets) -
    toNumber(fuel) -
    toNumber(eftpos);

  const driverShare =
    shiftTotal > 0 ? ownerHalf - toNumber(SHIFT_LEVY) : 0;

  const ownerShare = shiftTotal > 0 ? ownerAmount : 0;
  const displayOwnerAmount = shiftTotal > 0 ? ownerAmount : 0;
  const displayPayable = shiftTotal > 0 ? payable : 0;

  useEffect(() => {
    document.documentElement.style.colorScheme = "dark";
  }, []);

  function saveReport() {
    const now = new Date();

    const report: ShiftReport = {
      id: now.toISOString(),
      createdAt: now.toISOString(),
      shiftDate,
      shiftStart,
      shiftEnd,
      cashTaken,
      accountBookings,
      meterTotal,
      areaCharge,
      quotes,
      emes,
      shiftTotal,
      ownerHalf,
      levy: SHIFT_LEVY,
      ownerAmount,
      dockets,
      fuel,
      eftpos,
      payable,
      driverShare,
      ownerShare,
    };

    const existingReports = loadReports();
    const updatedReports = [report, ...existingReports];

    localStorage.setItem(
      REPORTS_STORAGE_KEY,
      JSON.stringify(updatedReports)
    );

    setSaveMessage("Report saved");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 3000);

    setCashTaken("0.00");
    setEftpos("0.00");
    setMeterTotal("0.00");
    setAreaCharge("0.00");
    setQuotes("0.00");
    setEmes("0.00");
    setDockets("0.00");
    setFuel("0.00");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2f2f30] via-[#2b2b2c] to-[#242425] p-5 text-zinc-100">
      <div className="mx-auto max-w-md space-y-5">
        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Shift Income Report Calculator
              </h1>

              <p className="mt-2 text-sm text-zinc-300">
                Calculate earnings and shift settlement totals.
              </p>
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
          <label className="block">
            <span className="text-sm text-zinc-300">
              Shift Start Date
            </span>

            <input
              type="date"
              value={shiftDate}
              onChange={(event) => setShiftDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#7b7b7c] bg-[#2f2f30] py-3 pl-3 pr-4 text-lg text-zinc-100 outline-none focus:border-[#b8b8ba]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <ShiftTimeInput
              label="Shift Start"
              value={shiftStart}
              setValue={setShiftStart}
            />

            <ShiftTimeInput
              label="Shift End"
              value={shiftEnd}
              setValue={setShiftEnd}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MoneyInput
              label="Cash Taken"
              value={cashTaken}
              setValue={setCashTaken}
            />

            <MoneyInput
              label="Account Bookings"
              value={accountBookings}
              setValue={setAccountBookings}
            />

            <MoneyInput
              label="EFTPOS Printout Total"
              value={eftpos}
              setValue={setEftpos}
            />
          </div>

          <MoneyInput
            label="Meter Total"
            value={meterTotal}
            setValue={setMeterTotal}
          />

          <MoneyInput
            label="Less Area Charge"
            value={areaCharge}
            setValue={setAreaCharge}
          />

          <MoneyInput
            label="Plus Quotes"
            value={quotes}
            setValue={setQuotes}
          />

          <MoneyInput
            label="Less Evasions or Meter Errors"
            value={emes}
            setValue={setEmes}
          />

          <MoneyInput
            label="Less Owner Dockets"
            value={dockets}
            setValue={setDockets}
          />

          <MoneyInput
            label="Less Fuel Cash (if any)"
            value={fuel}
            setValue={setFuel}
          />

          <MoneyInput
            label="Less EFTPOS (Auto)"
            value={eftpos}
            setValue={setEftpos}
            disabled
          />
        </section>

        <section className="space-y-3 rounded-2xl bg-[#3a3a3b] p-4">
          <Result label="Shift Total" value={shiftTotal} />

          <div>
            <Result
              label="Owner 50%"
              value={displayOwnerAmount}
            />

            <p className="text-xs text-zinc-300">
              + $5.50 shift levy included
            </p>
          </div>

          <Result label="Driver Share" value={driverShare} />

          <div
            className={`rounded-2xl border p-5 text-center ${
              displayPayable >= 0
                ? "border-red-400/50 bg-red-500/10"
                : "border-emerald-400/50 bg-emerald-500/10"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
              {displayPayable >= 0
                ? "Pay Into Envelope"
                : "Payable to Driver"}
            </p>

            <p className="mt-3 text-5xl font-black tracking-tight">
              {displayPayable >= 0 ? "+" : "-"}$
              {Math.abs(displayPayable).toFixed(2)}
            </p>

            {saveMessage && (
              <p className="mt-4 text-sm text-emerald-300">
                {saveMessage}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={saveReport}
                className="w-full rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Save Report
              </button>

              <Link
                href="/reports"
                className="w-full rounded-xl border border-[#7b7b7c] bg-[#2f2f30] px-5 py-2 text-center text-sm font-semibold text-zinc-200 transition hover:bg-[#3a3a3b]"
              >
                Reports
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatShiftTime(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function ShiftTimeInput({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-300">
        {label}
      </span>

      <input
        type="text"
        inputMode="numeric"
        placeholder="HH:MM"
        value={value}
        onChange={(event) =>
          setValue(formatShiftTime(event.target.value))
        }
        className="w-full rounded-xl border border-[#4a4a4b] bg-[#242425] px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-400"
      />
    </label>
  );
}

function MoneyInput({
  label,
  value,
  setValue,
  disabled = false,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
}) {
  const [entryMode, setEntryMode] = useState<"cents" | "decimal" | null>(
    null
  );

  function formatMoney() {
    const numberValue = parseFloat(value);

    setValue(
      Number.isNaN(numberValue)
        ? "0.00"
        : numberValue.toFixed(2)
    );

    setEntryMode(null);
  }

  function handlePaste(inputValue: string) {
    const cleanedValue = inputValue.replace(/[^0-9.]/g, "");

    if (!cleanedValue) {
      setValue("0.00");
      return;
    }

    if (cleanedValue.includes(".")) {
      const numberValue = parseFloat(cleanedValue);
      setValue(
        Number.isNaN(numberValue)
          ? "0.00"
          : numberValue.toFixed(2)
      );
      return;
    }

    const cents = parseInt(cleanedValue, 10);
    setValue((cents / 100).toFixed(2));
  }

  return (
    <label className="block">
      <span className="text-sm text-zinc-300">{label}</span>

      <input
        type="text"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onFocus={(event) => {
          setEntryMode(null);
          event.currentTarget.select();
        }}
        onChange={(event) => handlePaste(event.target.value)}
        onBlur={formatMoney}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }

          if (/^[0-9]$/.test(event.key)) {
            event.preventDefault();

            const digit = Number(event.key);

            if (entryMode === "decimal") {
              const [wholePart = "0", decimalPart = ""] =
                value.split(".");

              if (decimalPart.length < 2) {
                setValue(
                  `${wholePart}.${decimalPart}${event.key}`
                );
              }

              return;
            }

            const currentCents =
              entryMode === "cents"
                ? Math.round((parseFloat(value) || 0) * 100)
                : 0;

            const updatedCents = currentCents * 10 + digit;

            setEntryMode("cents");
            setValue((updatedCents / 100).toFixed(2));
            return;
          }

          if (event.key === ".") {
            event.preventDefault();
            setEntryMode("decimal");
            setValue("0.");
            return;
          }

          if (event.key === "Backspace") {
            event.preventDefault();

            if (entryMode === "decimal") {
              const shortenedValue = value.slice(0, -1);
              setValue(
                shortenedValue === "" || shortenedValue === "0"
                  ? "0."
                  : shortenedValue
              );
              return;
            }

            const currentCents = Math.round(
              (parseFloat(value) || 0) * 100
            );

            setEntryMode("cents");
            setValue(
              (Math.floor(currentCents / 10) / 100).toFixed(2)
            );
            return;
          }

          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="mt-1 w-full rounded-xl border border-[#7b7b7c] bg-[#2f2f30] px-4 py-3 text-lg outline-none focus:border-[#b8b8ba] disabled:opacity-60"
      />
    </label>
  );
}

function Result({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between text-lg">
      <span className="text-zinc-300">{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
