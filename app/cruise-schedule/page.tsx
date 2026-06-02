"use client";

import { useState } from "react";
import Link from "next/link";

const cruiseSchedule = [
  {
    date: "2026-06-02",
    ship: "Carnival Encounter",
    arrival: "10:00",
    departure: "18:30",
    passengers: 2596,
    crew: 1100,
    agent: "INCHCAPE",
  },
  {
    date: "2026-06-26",
    ship: "Carnival Adventure",
    arrival: "08:00",
    departure: "16:00",
    passengers: 2636,
    crew: 1100,
    agent: "INCHCAPE",
  },
  {
    date: "2026-06-28",
    ship: "Carnival Splendor",
    arrival: "09:00",
    departure: "17:30",
    passengers: 3016,
    crew: 1150,
    agent: "INCHCAPE",
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

const upcomingCruises = cruiseSchedule.filter((cruise) => {
  const arrivalDateTime = getCruiseArrivalDateTime(cruise);
  return arrivalDateTime > now;
});

const nextCruise = currentCruise ?? upcomingCruises[0];
const remainingCruises = upcomingCruises.slice(0, 2);

const selectedYearCruises = selectedYear
  ? cruiseSchedule.filter((cruise) =>
      cruise.date.startsWith(String(selectedYear))
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
            </div>

            <Link
              href="/"
              className="shrink-0 rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] px-4 py-2 text-sm font-semibold text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_4px_14px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-amber-400/60 hover:from-[#5a4a34] hover:to-[#35302a] hover:text-white"
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
              <span>
                {formatDate(currentCruise.date)}
              </span>

              <span>
                {currentCruise.arrival} — {currentCruise.departure}
              </span>
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
              {currentCruise.ship}
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Passengers
                </p>

                <p className="mt-1 text-2xl font-black text-white">
                  {currentCruise.passengers}
                </p>
              </div>

              <div className="rounded-xl bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Crew
                </p>

                <p className="mt-1 text-2xl font-black text-white">
                  {currentCruise.crew}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              Agent:{" "}
              <span className="font-semibold text-zinc-200">
                {currentCruise.agent}
              </span>
            </p>
          </section>
            ) : (
              <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#3b352b] to-[#2c2925] p-4 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  Current Vessel in Port
                </p>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
                  No vessel currently in port.
                </h2>

                {nextCruise && (
                  <p className="mt-4 text-sm text-zinc-400">
                    Next arrival:{" "}
                    <span className="font-semibold text-zinc-200">
                      {nextCruise.ship} · {formatDate(nextCruise.date)}
                    </span>
                  </p>
                )}
              </section>
            )}

        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-white">
            Upcoming Arrivals
          </h2>

          <div className="mt-3 space-y-3">
            {remainingCruises.map((cruise, index) => (
              <div
                key={`${cruise.date}-${cruise.ship}-${index}`}
                className="rounded-xl bg-black/20 p-3"
              >
                <p className="font-semibold text-white">{cruise.ship}</p>

                <p className="mt-1 text-sm text-zinc-400">
                  {formatDate(cruise.date)}
                </p>

                <p className="mt-1 text-sm text-zinc-300">
                  {cruise.arrival} – {cruise.departure} ·{" "}
                  {cruise.passengers} passengers
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              setSelectedYear(2026);
            }}
            className="rounded-xl border border-[#5e5e60] bg-[#303031] px-4 py-3 text-sm font-semibold text-zinc-200"
          >
            2026 Schedule
          </button>

          <button
            onClick={() => setSelectedYear(2027)}
            className="rounded-xl border border-[#5e5e60] bg-[#303031] px-4 py-3 text-sm font-semibold text-zinc-200"
          >
            2027 Schedule
          </button>
        </section>
        {selectedYear && (
            <section className="rounded-2xl border border-[#4a4a4b] bg-[#303031] p-4">
              <h2 className="text-lg font-bold text-white">
                {selectedYear} Schedule
              </h2>

              <div className="mt-4 space-y-3">
                {selectedYearCruises.map((cruise) => (
                  <div
                    key={`${cruise.date}-${cruise.ship}`}
                    className="rounded-xl bg-[#2b2b2c] p-3"
                  >
                    <p className="text-sm font-semibold text-white">
                      {cruise.ship}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      {formatDate(cruise.date)}
                    </p>

                    <p className="mt-1 text-xs text-zinc-300">
                      {cruise.arrival} — {cruise.departure} · {cruise.passengers} passengers
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </main>
  );
}