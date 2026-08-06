import { NextRequest, NextResponse } from "next/server";

import { mapReportToSheetRow } from "../../../../../agents/001-finance/mapper";
import { SheetsAgent } from "../../../../../agents/001-finance/sheets";
import {
  getWorksheetName,
  getWorksheetRow,
} from "../../../../../agents/001-finance/worksheet";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    const row = mapReportToSheetRow(report);
    const sheetName = getWorksheetName(report.shiftDate);
    const rowNumber = getWorksheetRow(report.shiftDate);

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