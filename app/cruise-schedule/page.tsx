"use client";

import { useState } from "react";
import Link from "next/link";
import { cruiseSchedule } from "./cruiseSchedule";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getArrivalSize(passengers: number) {
  if (passengers >= 2500) {
    return "major";
  }

  if (passengers >= 1000) {
    return "medium";
  }

  return "small";
}

function getArrivalDot(passengers: number) {
  const size = getArrivalSize(passengers);

  if (size === "major") {
    return (
      <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
    );
  }

  if (size === "medium") {
    return (
      <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
    );
  }

  return (
    <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
  );
}

export default function CruiseSchedulePage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  function getCruiseArrivalDateTime(cruise: (typeof cruiseSchedule)[number]) {
    return new Date(`${cruise.date}T${cruise.arrival}:00`);
  }

  function getCruiseDepartureDateTime(cruise: (typeof cruiseSchedule)[number]) {
    return new Date(`${cruise.date}T${cruise.departure}:00`);
  }

  const currentCruise = cruiseSchedule.find((cruise) => {
    const arrivalDateTime = getCruiseArrivalDateTime(cruise);
    const departureDateTime = getCruiseDepartureDateTime(cruise);

    return arrivalDateTime <= now && departureDateTime >= now;
  });

  const upcomingCruises = cruiseSchedule
  .filter((cruise) => {
    const arrivalDateTime = getCruiseArrivalDateTime(cruise);
    return arrivalDateTime > now;
  })
  .sort(
    (a, b) =>
      getCruiseArrivalDateTime(a).getTime() -
      getCruiseArrivalDateTime(b).getTime()
  );

  const nextCruise = currentCruise ?? upcomingCruises[0];
  const remainingCruises = upcomingCruises.slice(0, 2);

  const featuredCruiseKeys = [
        currentCruise,
        ...remainingCruises,
      ]
        .filter(Boolean)
        .map((cruise) => `${cruise!.date}-${cruise!.ship}`);

      const selectedYearCruises = selectedYear
        ? cruiseSchedule
            .filter(
              (cruise) =>
                cruise.date.startsWith(String(selectedYear)) &&
                getCruiseArrivalDateTime(cruise) >= now &&
                !featuredCruiseKeys.includes(`${cruise.date}-${cruise.ship}`)
            )
            .sort(
              (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )
        : [];

  return (

    <main className="min-h-screen bg-gradient-to-b from-[#2f2f30] via-[#2b2b2c] to-[#242425] p-5 text-zinc-100">
      <div className="mx-auto max-w-md space-y-5">
        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Cruise Schedule
              </h1>

              <p className="mt-2 text-sm text-zinc-300">
                Upcoming cruise ship activity for Cairns.
              </p>

            <div className="mt-2 text-xs text-zinc-400">
              <p>Arrival Size</p>

              <p className="mt-1">
                🟢 Small (&lt;1000 pax)
              </p>

              <p>
                🟠 Medium (1000-2499 pax)
              </p>

              <p>
                🔴 Major (2500+ pax)
              </p>
            </div>

            </div>
             <Link
              href="/"
              className="shrink-0 rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-400/60 hover:from-[#5a4a34] hover:to-[#35302a] hover:text-white"
            >
              Home
            </Link>
          </div>
        </section>

        {currentCruise ? (
          <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#3b352b] to-[#2c2925] p-4 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Current Vessel in Port
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              <span>{formatDate(currentCruise.date)}</span>
              <span>
                {currentCruise.arrival} — {currentCruise.departure}
              </span>
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
              {currentCruise.ship}
            </h2>

            {currentCruise.passengers && (
              <div className="mt-5 rounded-xl bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Passengers
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {currentCruise.passengers}
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#3b352b] to-[#2c2925] p-4 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Current Vessel in Port
            </p>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
              No vessel currently in port.
            </h2>

          </section>
        )}

        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-white">
            Upcoming Arrivals
          </h2>

          <div className="mt-4 divide-y divide-[#4a4a4b]">
            {remainingCruises.map((cruise) => (
              <div key={`${cruise.date}-${cruise.ship}`} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-zinc-400">
                    {formatDate(cruise.date)}
                  </p>

                  <p className="text-right text-base font-bold text-white">
                    {cruise.ship}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-400">
                    {cruise.arrival} → {cruise.departure}
                  </p>

                  {cruise.passengers && (
                  <div className="flex items-center justify-end gap-2 text-right font-semibold text-amber-400">
                    {getArrivalDot(cruise.passengers)}
                    <span>{cruise.passengers} pax</span>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() =>
              setSelectedYear(selectedYear === 2026 ? null : 2026)
            }
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              selectedYear === 2026
                ? "border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] text-amber-100"
                : "border border-[#5e5e60] bg-[#303031] text-zinc-200"
            }`}
          >
            2026 Schedule
          </button>

          <button
            onClick={() =>
              setSelectedYear(selectedYear === 2027 ? null : 2027)
            }
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              selectedYear === 2027
                ? "border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] text-amber-100"
                : "border border-[#5e5e60] bg-[#303031] text-zinc-200"
            }`}
          >
            2027 Schedule
          </button>
        </section>

        {selectedYear && (
          <section className="rounded-2xl border border-[#4a4a4b] bg-[#303031] p-4">
            <h2 className="text-lg font-bold text-white">
              {selectedYear} Schedule
            </h2>

            <div className="mt-4 divide-y divide-[#4a4a4b]">
              {selectedYearCruises.map((cruise) => (
                <div key={`${cruise.date}-${cruise.ship}`} className="py-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="w-20 shrink-0 text-sm text-zinc-400">
                      {formatShortDate(cruise.date)}
                    </p>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {cruise.ship}
                      </p>

                      {cruise.passengers && (
                    <div className="mt-0.5 flex items-center justify-end gap-2 text-sm font-semibold text-amber-300">
                      {getArrivalDot(cruise.passengers)}
                      <span>{cruise.passengers} pax</span>
                    </div>
                  )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}