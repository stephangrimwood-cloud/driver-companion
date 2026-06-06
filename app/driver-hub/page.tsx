"use client";

import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";

export default function DriverHubPage() {
  const router = useRouter();

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
        router.push("/reports");
    },

    delta: 50,
    swipeDuration: 500,
    trackTouch: true,
    trackMouse: true,
    preventScrollOnSwipe: false,
    });

  return (
    <main
      {...swipeHandlers}
      className="min-h-screen bg-[#2f2f30] px-4 py-6 text-zinc-100"
    >
      <div className="mx-auto max-w-md space-y-4">

        <section className="rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 shadow-lg">
          <h1 className="text-2xl font-semibold text-white">
            Driver Hub
          </h1>

          <p className="mt-2 text-sm text-zinc-300">
            Useful tools and planning information for your shift.
          </p>
        </section>

        <button
          onClick={() => router.push("/airport-arrivals")}
          className="w-full rounded-2xl border border-[#4a4a4b] bg-[#3a3a3b] p-4 text-left shadow-lg transition hover:border-zinc-300"
        >
          <div className="text-lg font-semibold text-white">
            Airport Arrivals
          </div>

          <div className="mt-1 text-sm text-zinc-300">
            View weekly arrival activity and peak inbound windows.
          </div>
        </button>
      </div>
    </main>
  );
}