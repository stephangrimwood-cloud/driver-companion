import { NextResponse } from "next/server";

type AirportArrival = {
  date: string;
  airline: string;
  flight: string;
  from: string;
  scheduled: string;
  estimated: string;
  status: string;
  terminal: string;
};

function cleanText(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const day = searchParams.get("day") || "today";
  try {
    const response = await fetch(
      day === "tomorrow"
        ? "https://www.cairnsairport.com.au/travelling/flight-info/arrivals?date=tomorrow"
        : "https://www.cairnsairport.com.au/travelling/flight-info/arrivals/",
      {
        cache: "no-store",
      }
    );

    const html = await response.text();

    const rows = [...html.matchAll(/<tr class="data-row">([\s\S]*?)<\/tr>/g)];

    const arrivals: AirportArrival[] = rows.map((row) => {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
        (cell) => cleanText(cell[1])
      );

      return {
        date: cells[1] ?? "",
        airline: cells[2] ?? "",
        flight: cells[3]?.split(" ")[0] ?? "",
        from: cells[4] ?? "",
        terminal: cells[5] ?? "",
        scheduled: cells[6] ?? "",
        estimated: cells[7] ?? "",
        status: cells[8] || "Scheduled",
      };
    });

    return NextResponse.json({
      ok: true,
      count: arrivals.length,
      arrivals,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not fetch airport arrivals.",
      },
      { status: 500 }
    );
  }
}