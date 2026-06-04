"use client";

import { useState } from "react";
import Link from "next/link";
import { events } from "./eventsData";

export default function EventsPage() {
const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 5, 1));

const monthLabel = selectedMonth.toLocaleDateString("en-AU", {
  month: "long",
  year: "numeric",
});

const selectedMonthEvents = events
  .filter((event) => {
    const eventDate = new Date(event.date);

    return (
      eventDate.getFullYear() === selectedMonth.getFullYear() &&
      eventDate.getMonth() === selectedMonth.getMonth()
    );
  })
  .sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2f2f30] via-[#2b2b2c] to-[#242425] px-4 py-6 text-white">
      <div className="mx-auto w-full max-w-md space-y-5">
        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Events</h1>
              <p className="mt-2 text-sm text-gray-200">
                Major Cairns events that may affect taxi demand.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Conferences, festivals, sporting events and major city activity.
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

        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-xl">
          <h2 className="text-lg font-bold">Upcoming Events</h2>

          <h3 className="mt-6 text-center text-xl font-bold text-amber-400">
            {monthLabel}
          </h3>

          <div className="mt-5 space-y-3">
            {selectedMonthEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-600 bg-zinc-900/30 p-4 text-center">
                <p className="text-sm font-semibold text-zinc-200">
                No major events recorded
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                No major events have been added for {monthLabel}.
                </p>
            </div>

            ) : (

                selectedMonthEvents.map((event) => (
                <div
                key={event.id}
                className={`rounded-xl border bg-zinc-900/40 p-4 ${
                    event.demand === "high"
                    ? "border-amber-500/30"
                    : "border-zinc-600"
                }`}
                >
                <div className="flex items-start justify-between gap-3">
                    <div>
                    <h3 className="font-semibold text-zinc-100">{event.title}</h3>

                    {(() => {

                const startDate = new Date(event.date);
                const endDate = new Date(event.endDate);

                const sameDay =
                    startDate.getTime() === endDate.getTime();

                const sameMonth =
                    startDate.getMonth() === endDate.getMonth() &&
                    startDate.getFullYear() === endDate.getFullYear();

                const sameYear =
                    startDate.getFullYear() === endDate.getFullYear();

                if (sameDay) {
                    return startDate.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    });
                }

                if (sameMonth) {
                    return `${startDate.getDate()}–${endDate.getDate()} ${startDate.toLocaleDateString(
                    "en-AU",
                    { month: "long" }
                    )}`;
                }

                if (sameYear) {
                    return `${startDate.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    })} – ${endDate.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    })}`;
                }

                return `${startDate.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })} – ${endDate.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}`;
                })()}

                    <p className="mt-1 text-sm text-zinc-400">
                        {event.type} • {event.venue}
                    </p>
                    </div>

                    <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        event.demand === "high"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-zinc-700 text-zinc-200"
                    }`}
                    >
                    {event.demand === "high" ? "High" : "Medium"}
                    </span>
                </div>

                <p className="mt-3 text-sm text-zinc-300">{event.notes}</p>
                </div>
                ))
                )}
            </div>

            <div className="mt-5 border-t border-zinc-700 pt-4">
            <div className="flex gap-2">
                <button
                    onClick={() =>
                        setSelectedMonth(
                        new Date(
                            selectedMonth.getFullYear(),
                            selectedMonth.getMonth() - 1,
                            1
                        )
                        )
                    }
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/70"
                    >
                Previous Month
                </button>

                <button
                onClick={() =>
                    setSelectedMonth(
                    new Date(
                        selectedMonth.getFullYear(),
                        selectedMonth.getMonth() + 1,
                        1
                    )
                    )
                }
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/70"
                >
                Next Month
                </button>
            </div>
          </div>

        </section>


        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-xl">
          <h2 className="text-lg font-bold">Driver Notes</h2>

          <p className="mt-2 text-sm text-zinc-300">
            Only events likely to affect taxi demand, airport movement, hotel
            activity, traffic, road closures or late-night passenger volume
            should be included.
            </p>

            <p className="mt-3 text-sm text-zinc-300">
            Demand ratings and event notes are intended as a guide only 
            and should not be relied upon as a guarantee of passenger activity, 
            traffic conditions or earnings.
            </p>

            <p className="mt-3 text-xs text-zinc-500">
            Small local events such as toddler groups, coffee mornings and minor
            suburb markets are intentionally excluded.
            </p>
        </section>
      </div>
    </main>
  );
}