"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

type Arrival = {
  flight: string;
  airline: string;
  from: string;
  scheduled: string;
  estimated: string;
  status: string;
};

type ArrivalDay = {
  day: string;
  date: string;
  airportDate: string;
  international: number;
  domestic: number;
  peakWindows: string[];
  arrivals: Arrival[];
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

function formatAirportDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
  });
}

function isInternationalArrival(from: string) {
  const internationalPorts = [
    "Singapore",
    "Denpasar Bali",
    "Bali",
    "Tokyo",
    "Osaka",
    "Auckland",
    "Christchurch",
    "Port Moresby",
  ];

  return internationalPorts.some((port) =>
    from.toLowerCase().includes(port.toLowerCase())
  );
}

function getPeakWindows(arrivals: any[]) {
  const hourCounts: Record<number, number> = {};

  arrivals.forEach((arrival) => {
    const time = arrival.estimated || arrival.scheduled;
    const hour = Number(time?.split(":")[0]);

    if (isNaN(hour)) return;

    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const busyHours = Object.entries(hourCounts)
    .filter(([, count]) => count >= 5)
    .map(([hour]) => Number(hour))
    .sort((a, b) => a - b);

  if (busyHours.length === 0) {
    return null;
  }

  const windows: string[] = [];
  let startHour = busyHours[0];
  let previousHour = busyHours[0];

  for (let i = 1; i < busyHours.length; i++) {
    const currentHour = busyHours[i];

    if (currentHour === previousHour + 1) {
      previousHour = currentHour;
    } else {
      windows.push(
        `${String(startHour).padStart(2, "0")}:00 → ${String(
          previousHour + 1
        ).padStart(2, "0")}:00`
      );

      startHour = currentHour;
      previousHour = currentHour;
    }
  }

  windows.push(
    `${String(startHour).padStart(2, "0")}:00 → ${String(
      previousHour + 1
    ).padStart(2, "0")}:00`
  );

  return windows;
}

  export default function AirportArrivalsPage() {

    const [openDay, setOpenDay] = useState<string | null>(null);
    const [liveArrivals, setLiveArrivals] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [refreshError, setRefreshError] = useState(false);

    const today = new Date();

          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const arrivalDays: ArrivalDay[] = [
            {
              day: "Today",
              date: formatDate(today),
              airportDate: formatAirportDate(today),
              international: 0,
              domestic: 0,
              peakWindows: [],
              arrivals: [],
            },
            {
              day: "Tomorrow",
              date: formatDate(tomorrow),
              airportDate: formatAirportDate(tomorrow),
              international: 0,
              domestic: 0,
              peakWindows: [],
              arrivals: [],
            },
          ];

        useEffect(() => {


  async function loadArrivals() {
  try {
    const todayResponse = await fetch("/api/airport-arrivals?day=today");
    const todayData = await todayResponse.json();

    let tomorrowData = { ok: false, arrivals: [] };

    try {
      const tomorrowResponse = await fetch("/api/airport-arrivals?day=tomorrow");
      tomorrowData = await tomorrowResponse.json();
    } catch {
      tomorrowData = { ok: false, arrivals: [] };
    }

    const combinedArrivals = [
      ...(todayData.ok ? todayData.arrivals : []),
      ...(tomorrowData.ok ? tomorrowData.arrivals : []),
    ];

    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    setLastUpdated(
      new Date().toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit",
      })
    );

    setRefreshError(false);

    setLiveArrivals((previousArrivals) => {
      const freshArrivals = combinedArrivals.map((arrival: any) => {
        const previousMatch = previousArrivals.find(
          (previous: any) =>
            previous.flight === arrival.flight &&
            previous.date === arrival.date
        );

        return {
          ...arrival,
          landedAt:
            arrival.status === "Landed"
              ? previousMatch?.landedAt ?? now
              : undefined,
        };
      });

      const freshKeys = new Set(
        freshArrivals.map(
          (arrival: any) => `${arrival.date}-${arrival.flight}`
        )
      );

      const recentlyLanded = previousArrivals.filter((arrival: any) => {
        const key = `${arrival.date}-${arrival.flight}`;

        return (
          arrival.status === "Landed" &&
          arrival.landedAt &&
          now - arrival.landedAt < fifteenMinutes &&
          !freshKeys.has(key)
        );
      });

      return [...freshArrivals, ...recentlyLanded];
    });
    } catch {
    setRefreshError(true);
  }
}

  loadArrivals();

  const refreshTimer = setInterval(() => {
    loadArrivals();
  }, 60000);

  return () => clearInterval(refreshTimer);
}, []);

  return (

    <main 
    className="min-h-screen bg-gradient-to-b from-[#2f2f30] via-[#2b2b2c] to-[#242425] p-5 text-zinc-100">
      <div className="mx-auto max-w-md space-y-5">

        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Airport Arrivals
              </h1>

              <p className="mt-2 text-sm text-zinc-300">
                Live Cairns Airport arrivals for today and tomorrow.
              </p>
            </div>

            <Link
              href="/"
              className="shrink-0 rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#4a4030] to-[#2d2924] px-4 py-2 text-sm font-semibold text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_4px_14px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-amber-400/60 hover:from-[#5a4a34] hover:to-[#35302a] hover:text-white"
            >
              Home
            </Link>
          </div>

          <p className="mt-1 text-xs text-zinc-400">
            Live arrival information updates automatically.
            </p>

            {lastUpdated && (
          <p className="mt-1 text-xs text-amber-300/80">
            Last updated {lastUpdated}
          </p>
        )}

          {refreshError && (
            <p className="mt-1 text-xs text-red-300/80">
              Unable to refresh arrivals. Showing last known data.
            </p>
          )}
        </section>

        <section className="space-y-3">
          {arrivalDays.map((day) => {
            const isOpen = openDay === day.day;
            const matchingArrivals = liveArrivals.filter(
                (arrival) => arrival.date === day.airportDate
                );

            const internationalCount = matchingArrivals.filter((arrival) =>
                arrival.terminal === "T1"
                ).length;

            const domesticCount = matchingArrivals.length - internationalCount;

            const peakWindows = getPeakWindows(matchingArrivals);

            return (
              <div
                key={day.day}
                className={`rounded-2xl border p-4 shadow-lg transition-colors ${
                    day.airportDate === formatAirportDate(new Date())
                    ? "border-amber-400/30 bg-[#3f3a32]"
                    : "border-[#4a4a4b] bg-[#3a3a3b]"
                }`}
                >
                <button
                  onClick={() => setOpenDay(isOpen ? null : day.day)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-lg font-semibold text-white">
                            {day.day}
                        </div>

                        <div className="text-sm font-medium text-zinc-300">
                            {day.date}
                        </div>
                    </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <div className="rounded-full bg-sky-500/10 px-2 py-1 text-sky-200">
                            Intl: {internationalCount}
                        </div>

                        <div className="rounded-full bg-[#2f2f30] px-2 py-1 text-zinc-300">
                            Domestic: {domesticCount}
                        </div>
                        </div>
                    </div>

                    <div className="pt-2 text-right text-sm text-zinc-300">
                      <div>Busy Windows</div>
                      <div className="text-zinc-100">
                        {Array.isArray(peakWindows) ? (
                          peakWindows.map((window) => (
                            <div key={window}>{window}</div>
                          ))
                        ) : (
                          "No busy windows"
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {isOpen && (
                <div className="mt-4 space-y-3">
                    {matchingArrivals.length === 0 ? (
                    <div className="rounded-xl border border-[#4a4a4b] bg-[#2f2f30] p-3 text-sm text-zinc-300">
                        No arrival data published for this day yet.
                        Check again later.
                    </div>
                    ) : (
                        matchingArrivals.map((arrival) => (
                            <div
                            key={`${arrival.date}-${arrival.flight}-${arrival.scheduled}`}
                            className={`rounded-xl border p-3 ${
                                arrival.terminal === "T1"
                                    ? "border-sky-400/30 bg-sky-500/10"
                                    : "border-[#4a4a4b] bg-[#2f2f30]"
                                }`}
                            >
                            <div className="flex justify-between gap-4">
                                <div className="font-semibold text-white">
                                {arrival.flight} - {arrival.airline}
                                </div>

                                <div className="text-right text-sm text-zinc-300">
                                {arrival.from}
                                </div>
                            </div>

                            <div className="mt-2 flex justify-between gap-4 text-sm">
                                <div className="text-zinc-300">
                                {arrival.scheduled} →{" "}
                                {arrival.estimated || arrival.scheduled}
                                </div>

                               <div
                                className={`font-medium ${
                                    arrival.status === "Landed"
                                    ? "text-emerald-400"
                                    : arrival.status === "Delayed"
                                    ? "text-red-400"
                                    : "text-zinc-100"
                                }`}
                                >
                                {arrival.status}
                                </div>
                            </div>
                            </div>
                        ))
                    )}
                </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}