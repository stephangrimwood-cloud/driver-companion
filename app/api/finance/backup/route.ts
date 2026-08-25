import { NextRequest, NextResponse } from "next/server";

import { SheetsAgent } from "../../../../agents/001-finance/sheets";

import { parseReportBackups } from "../../../../agents/001-finance/parser";

import {
  getBackupActionKey,
} from "../../../../agents/001-finance/verification-action-key";

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
    console.error("Unable to read Shift Mate backups:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to read Shift Mate backups.",
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

    const backedUpAt = new Date().toISOString();

    await sheets.writeReportBackup(
      report.id,
      report.shiftDate,
      backedUpAt,
      "0.1.0",
      JSON.stringify(report),
    );

    await sheets.writeFinanceAgentLogRecord({
      reference: report.id,
      type: "BACKUP",
      loggedAt: backedUpAt,
      source: "Shift Mate cloud backup",
      actionKey: getBackupActionKey(
        report.id,
        backedUpAt,
      ),
    });

    return NextResponse.json({
      success: true,
      message: "Shift Mate report backed up.",
    });
  } catch (error) {
    console.error("Unable to back up Shift Mate report:", error);

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

export async function DELETE(request: NextRequest) {
  try {
    const { reportId } = await request.json();

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Report ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const sheets = new SheetsAgent();

    await sheets.deleteReportBackup(reportId);

    return NextResponse.json({
      success: true,
      message: "Shift Mate cloud backup deleted.",
    });
  } catch (error) {
    console.error(
      "Unable to delete Shift Mate backup:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete cloud backup.",
      },
      {
        status: 500,
      },
    );
  }
}