"use client";

import Link from "next/link";

const cruiseSchedule = [
  {
    date: "2026-06-02",
    day: "Tuesday",
    ship: "VISTA",
    arrival: "09:38",
    departure: "18:00",
    passengers: "1,150",
    crew: "800",
    agent: "Not listed",
  },
  {
    date: "2026-06-26",
    day: "Friday",
    ship: "Carnival Adventure",
    arrival: "10:00",
    departure: "18:15",
    passengers: "1,100",
    crew: "450",
    agent: "Tropical Reef Shipping",
  },
  {
    date: "2026-06-28",
    day: "Sunday",
    ship: "Carnival Encounter",
    arrival: "09:00",
    departure: "18:05",
    passengers: "1,150",
    crew: "500",
    agent: "Not listed",
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

        {nextCruise && (
          <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#3b352b] to-[#2c2925] p-4 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Current Vessel in Port
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              <span>
                {nextCruise.day} · {formatDate(nextCruise.date)}
              </span>

              <span>
                {nextCruise.arrival} — {nextCruise.departure}
              </span>
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
              {nextCruise.ship}
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Passengers
                </p>

                <p className="mt-1 text-2xl font-black text-white">
                  {nextCruise.passengers}
                </p>
              </div>

              <div className="rounded-xl bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Crew
                </p>

                <p className="mt-1 text-2xl font-black text-white">
                  {nextCruise.crew}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              Agent:{" "}
              <span className="font-semibold text-zinc-200">
                {nextCruise.agent}
              </span>
            </p>
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
                  {cruise.day}, {formatDate(cruise.date)}
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
          <a
            href="https://portsnorth-web.s3.ap-southeast-2.amazonaws.com/CruiseSchedule.pdf"
            target="_blank"
            className="rounded-xl border border-[#5e5e60] bg-[#303031] px-4 py-3 text-center text-sm font-semibold text-zinc-200"
          >
            2026 Schedule
          </a>

          <button
            disabled
            className="rounded-xl border border-[#4a4a4b] bg-[#2b2b2c] px-4 py-3 text-sm font-semibold text-zinc-500"
          >
            2027 Schedule
          </button>
        </section>
      </div>
    </main>
  );
}