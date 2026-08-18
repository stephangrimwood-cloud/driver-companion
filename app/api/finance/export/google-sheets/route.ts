import { NextRequest, NextResponse } from "next/server";

import { mapReportsToSheetRow } from "../../../../../agents/001-finance/mapper";
import { SheetsAgent } from "../../../../../agents/001-finance/sheets";
import {
  getWorksheetName,
  getWorksheetRow,
} from "../../../../../agents/001-finance/worksheet";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const reports = Array.isArray(body.reports)
      ? body.reports
      : [body];

    if (reports.length === 0) {
      throw new Error("At least one report is required.");
    }

    const shiftDate = reports[0].shiftDate;

    const row = mapReportsToSheetRow(reports);
    const sheetName = getWorksheetName(shiftDate);
    const rowNumber = getWorksheetRow(shiftDate);

    const sheets = new SheetsAgent();

    await sheets.writeReportRow(
      sheetName,
      rowNumber,
      row,
    );

    return NextResponse.json({
      success: true,
      message: `Report exported to ${sheetName}, row ${rowNumber}.`,
    });
  } catch (error) {
    console.error("Unable to export Driver Companion report:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to export report.",
      },
      {
        status: 500,
      },
    );
  }
}