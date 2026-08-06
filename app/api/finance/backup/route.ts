import { NextRequest, NextResponse } from "next/server";

import { SheetsAgent } from "../../../../agents/001-finance/sheets";

import { parseReportBackups } from "../../../../agents/001-finance/parser";

export async function GET() {
  try {
    const sheets = new SheetsAgent();

    const backups = await sheets.readReportBackups();

    const reports = parseReportBackups(backups);

    return NextResponse.json({
      success: true,
      reports,
    });
    
  } catch (error) {
    console.error("Unable to read Driver Companion backups:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to read Driver Companion backups.",
      },
      {
        status: 500,
      },
    );
  }
}

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