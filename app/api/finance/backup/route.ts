import { NextRequest, NextResponse } from "next/server";

import { SheetsAgent } from "../../../../agents/001-finance/sheets";

import { parseReportBackups } from "../../../../agents/001-finance/parser";

import {
  getBackupActionKey,
  getErrorActionKey,
  getReconciliationActionKey,
} from "../../../../agents/001-finance/verification-action-key";

import {
  calculateReconciliationTotal,
  getReconciliationOutcome,
} from "../../../../agents/001-finance/reconciliation";

export async function GET() {
  let sheets: SheetsAgent | null = null;

  try {
    sheets = new SheetsAgent();

    const backups = await sheets.readReportBackups();

    const reports = parseReportBackups(backups);

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Unable to read Shift Mate backups:", error);

    if (sheets) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      const occurredAt = new Date().toISOString();

      try {
        await sheets.writeFinanceAgentLogRecord({
          reference: "REPORT_BACKUPS",
          type: "ERROR",
          loggedAt: occurredAt,
          source: `BACKUP_READ — ${errorMessage}`,
          actionKey: getErrorActionKey(
            "BACKUP_READ",
            "REPORT_BACKUPS",
            occurredAt,
          ),
        });
      } catch (logError) {
        console.error(
          "Unable to log backup read error:",
          logError,
        );
      }
    }

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

    const reconciliationTotal =
      calculateReconciliationTotal({
        cashTaken: Number(report.cashTaken ?? 0),
        accountBookings: Number(
          report.accountBookings ?? 0,
        ),
        payable: Number(report.payable ?? 0),
        areaCharge: Number(
          report.areaCharge ?? report.tolls ?? 0,
        ),
      });

    const reconciliationOutcome =
      getReconciliationOutcome(
        reconciliationTotal,
        Number(report.driverShare ?? 0),
      );

    try {
  await sheets.writeReportBackup(
    report.id,
    report.shiftDate,
    backedUpAt,
    "0.1.0",
    JSON.stringify(report),
  );
} catch (error) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  const occurredAt = new Date().toISOString();

    try {
      await sheets.writeFinanceAgentLogRecord({
        reference: report.id,
        type: "ERROR",
        loggedAt: occurredAt,
        source: `BACKUP_WRITE — ${errorMessage}`,
        actionKey: getErrorActionKey(
          "BACKUP_WRITE",
          report.id,
          occurredAt,
        ),
      });
    } catch (logError) {
      console.error(
        "Unable to log backup processing error:",
        logError,
      );
    }

    throw error;
  }

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

    try {
      await sheets.writeFinanceAgentLogRecord({
        reference: report.id,
        type: "RECONCILIATION",
        loggedAt: backedUpAt,
        source:
          `${reconciliationOutcome} — ` +
          `Reconciliation $${reconciliationTotal.toFixed(2)} / ` +
          `Driver Share $${Number(report.driverShare ?? 0).toFixed(2)}`,
        actionKey: getReconciliationActionKey(
          report.id,
        ),
      });
    } catch (error) {
      console.error(
        "Unable to log reconciliation outcome:",
        error,
      );
    }

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

    try {
      await sheets.deleteReportBackup(reportId);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      const occurredAt = new Date().toISOString();

      try {
        await sheets.writeFinanceAgentLogRecord({
          reference: reportId,
          type: "ERROR",
          loggedAt: occurredAt,
          source: `BACKUP_DELETE — ${errorMessage}`,
          actionKey: getErrorActionKey(
            "BACKUP_DELETE",
            reportId,
            occurredAt,
          ),
        });
      } catch (logError) {
        console.error(
          "Unable to log backup deletion error:",
          logError,
        );
      }

      throw error;
    }

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