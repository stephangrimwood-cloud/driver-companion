import { NextRequest, NextResponse } from "next/server";

import { SheetsAgent } from "../../../../agents/finance/sheets";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    const sheets = new SheetsAgent();

    await sheets.writeReportBackup(
      report.id,
      report.shiftDate,
      new Date().toISOString(),
      "0.1.0",
      JSON.stringify(report),
    );

    return NextResponse.json({
      success: true,
      message: "Driver Companion report backed up.",
    });
  } catch (error) {
    console.error("Unable to back up Driver Companion report:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to back up report.",
      },
      {
        status: 500,
      },
    );
  }
}