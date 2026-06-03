"use client";

import Link from "next/link";

export default function DriverHubPage() {

  return (
    
    <main className="min-h-screen bg-gradient-to-b from-[#2f2f30] via-[#2b2b2c] to-[#242425] p-5 text-zinc-100">
      <div className="mx-auto flex max-w-md flex-col items-center">

        {/* Title */}
        <h1 className="mt-10 text-3xl font-semibold tracking-[0.22em] text-amber-400 uppercase">
          Driver
        </h1>

        <h2 className="mb-12 mt-2 text-lg tracking-[0.28em] text-white/80 uppercase">
          Companion
        </h2>

        {/* Navigation Cards */}
        <div className="w-full space-y-4">

         <Link
            href="/calculator"
            className="block w-full rounded-2xl border border-amber-400/20 bg-zinc-900/60 p-5 text-left transition hover:border-amber-400/40 hover:bg-zinc-800/70"
          >
            <div className="text-lg font-semibold text-zinc-100">
              Shift Calculator
            </div>

            <div className="mt-1 text-sm text-zinc-400">
              Calculate earnings and shift totals
            </div>
          </Link>

          <Link
            href="/reports"
            className="block w-full rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 text-left transition hover:border-zinc-500 hover:bg-zinc-800/70"
          >
            <div className="text-lg font-semibold text-zinc-100">
              Shift Reports
            </div>

            <div className="mt-1 text-sm text-zinc-400">
              Review completed shift reports
            </div>
          </Link>

          <Link
            href="/airport-arrivals"
            className="block w-full rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 text-left transition hover:border-zinc-500 hover:bg-zinc-800/70"
          >
            <div className="text-lg font-semibold text-zinc-100">
              Airport Arrivals
            </div>

            <div className="mt-1 text-sm text-zinc-400">
              View scheduled airport arrivals
            </div>
          </Link>

          <Link
            href="/cruise-schedule"
            className="block w-full rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 text-left transition hover:border-zinc-500 hover:bg-zinc-800/70"
          >
            <div className="text-lg font-semibold text-zinc-100">
              Cruise Schedule
            </div>

            <div className="mt-1 text-sm text-zinc-400">
              Upcoming cruise ship arrivals
            </div>
          </Link>

            <footer className="pb-4 pt-2 text-center text-xs text-zinc-400">
                Stephan Grimwood • Version 1.5 • May 2026
            </footer>


        </div>
      </div>
    </main>
  );
}