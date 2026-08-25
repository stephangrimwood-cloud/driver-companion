import {
  createGoogleSheetsClient,
  loadGoogleSheetsConfig,
} from "./auth";

import {
  getFinancialYearWorksheetNames,
} from "./worksheet";

import {
  getManualVerificationActionKey,
} from "./verification-action-key";

import type { VerificationRecord } from "./types";

export class SheetsAgent {
  private client = createGoogleSheetsClient();
  private config = loadGoogleSheetsConfig();

  async readSpreadsheetTitle(): Promise<void> {
    const response = await this.client.spreadsheets.get({
      spreadsheetId: this.config.spreadsheet_id,
      fields: "properties.title",
    });

    console.log(
      "Google Sheets connected:",
      response.data.properties?.title ?? "(Unknown title)",
    );
  }

  async writeReportRow(
    sheetName: string,
    rowNumber: number,
    row: (string | number)[],
  ): Promise<void> {
    await this.client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheet_id,
      range: `'${sheetName}'!A${rowNumber}:G${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    console.log(
      `✓ Report exported to '${sheetName}' row ${rowNumber}.`,
    );
  }

  async writeReportBackup(
    reportId: string,
    shiftDate: string,
    backedUpAt: string,
    appVersion: string,
    reportJson: string,
  ): Promise<void> {
    const backupSheetName = "Shift Mate Backup";

    const existingRows =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: `'${backupSheetName}'!A:E`,
      });

    const rows = existingRows.data.values ?? [];

    const existingRowIndex = rows.findIndex(
      (row) => row[0] === reportId,
    );

    const targetRow =
      existingRowIndex >= 0
        ? existingRowIndex + 1
        : rows.length + 1;

    await this.client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheet_id,
      range: `'${backupSheetName}'!A${targetRow}:E${targetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            reportId,
            shiftDate,
            backedUpAt,
            appVersion,
            reportJson,
          ],
        ],
      },
    });

    console.log(
      `✓ Shift Mate backup saved to row ${targetRow}.`
    );
  }

  async deleteReportBackup(
    reportId: string,
  ): Promise<void> {
    const backupSheetName = "Shift Mate Backup";

    const existingRows =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: `'${backupSheetName}'!A:E`,
      });

    const rows = existingRows.data.values ?? [];

    const existingRowIndex = rows.findIndex(
      (row) => row[0] === reportId,
    );

    if (existingRowIndex < 0) {
      console.log(
        `No cloud backup found for report ${reportId}.`,
      );
      return;
    }

    const targetRow = existingRowIndex + 1;

    await this.client.spreadsheets.values.clear({
      spreadsheetId: this.config.spreadsheet_id,
      range: `'${backupSheetName}'!A${targetRow}:E${targetRow}`,
    });

    console.log(
      `✓ Shift Mate backup deleted from row ${targetRow}.`,
    );
  }

  async readReportBackups(): Promise<string[]> {
    const backupSheetName = "Shift Mate Backup";

    const response =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: `'${backupSheetName}'!E2:E`,
      });

    const rows = response.data.values ?? [];

    return rows
      .map((row) => row[0])
      .filter(
        (reportJson): reportJson is string =>
          typeof reportJson === "string" &&
          reportJson.trim().length > 0,
      );
  }

  async readMonthlyLedger(
    sheetName: string,
  ): Promise<string[][]> {
    const response =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: `'${sheetName}'!A:G`,
      });

    const rows = response.data.values ?? [];

    console.log(
      `Ledger rows from '${sheetName}':`,
      rows,
    );

    return rows;
  }

  async readFinancialYearLedgers(): Promise<
    Record<string, string[][]>
  > {
    const ledgers: Record<string, string[][]> = {};

    for (
      const sheetName of getFinancialYearWorksheetNames()
    ) {
      ledgers[sheetName] =
        await this.readMonthlyLedger(sheetName);
    }

    return ledgers;
  }

  async readFinanceAgentLog(): Promise<string[][]> {
    const response =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: "'Finance Agent Log'!A:Z",
      });

    const rows = response.data.values ?? [];

    console.log(
      "Finance Agent Log rows:",
      rows,
    );

    return rows;
  }

  async writeVerificationRecord(
    record: VerificationRecord,
  ): Promise<void> {
    const logRows =
      await this.readFinanceAgentLog();

    const alreadyLogged =
      logRows.some(
        (row) => row[4] === record.actionKey,
      );

    if (alreadyLogged) {
      console.log(
        `Verification action already logged: ${record.actionKey}.`,
      );
      return;
    }

    await this.client.spreadsheets.values.append({
      spreadsheetId: this.config.spreadsheet_id,
      range: "'Finance Agent Log'!A:E",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          record.ledgerDate,
          record.method,
          record.verifiedAt,
          record.source,
          record.actionKey,
        ]],
      },
    });

    console.log(
      `✓ Verification logged: ${record.ledgerDate} (${record.method})`,
    );
  }

  async backfillManualVerificationRecord(
    sheetName: string,
    rowNumber: number,
    ledgerDate: string,
    source: string,
  ): Promise<void> {
    const statusResponse =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: `'${sheetName}'!G${rowNumber}`,
      });

    const currentStatus =
      statusResponse.data.values?.[0]?.[0] ?? "";

    if (currentStatus !== "Verified") {
      console.log(
        `Manual audit backfill skipped: ${ledgerDate} is currently '${currentStatus}'.`,
      );
      return;
    }

    const logRows =
      await this.readFinanceAgentLog();

    const alreadyLogged =
      logRows.some(
        (row) =>
          row[0] === ledgerDate &&
          row[1] === "MANUAL",
      );

    if (alreadyLogged) {
      console.log(
        `Manual audit already exists: ${ledgerDate}.`,
      );
      return;
    }

    await this.writeVerificationRecord({
      ledgerDate,
      method: "MANUAL",
      verifiedAt: new Date().toISOString(),
      source,
      actionKey: getManualVerificationActionKey(
        ledgerDate,
      ),
    });
  }

  async verifyLedgerRowManually(
    sheetName: string,
    rowNumber: number,
    ledgerDate: string,
    source: string,
  ): Promise<void> {

    const statusResponse =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: `'${sheetName}'!G${rowNumber}`,
      });

    const currentStatus =
      statusResponse.data.values?.[0]?.[0] ?? "";

    if (currentStatus !== "Pending") {
      console.log(
        `Manual verification skipped: ${ledgerDate} is currently '${currentStatus}'.`,
      );
      return;
    }

    await this.appendLedgerNote(
      sheetName,
      rowNumber,
      source,
    );

    await this.updateLedgerStatus(
      sheetName,
      rowNumber,
      "Verified",
    );

    try {
      await this.writeVerificationRecord({
        ledgerDate,
        method: "MANUAL",
        verifiedAt: new Date().toISOString(),
        source,
        actionKey: getManualVerificationActionKey(
          ledgerDate,
        ),
      });
    } catch (error) {
      try {
        await this.updateLedgerStatus(
          sheetName,
          rowNumber,
          "Pending",
        );
      } catch (rollbackError) {
        const auditMessage =
          error instanceof Error
            ? error.message
            : String(error);

        const rollbackMessage =
          rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError);

        throw new Error(
          `${auditMessage}; rollback to Pending failed: ${rollbackMessage}`,
        );
      }

      throw error;
    }
  }

  async appendLedgerNote(
    sheetName: string,
    rowNumber: number,
    note: string,
  ): Promise<void> {
    const response =
      await this.client.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheet_id,
        range: `'${sheetName}'!F${rowNumber}`,
      });

    const currentNotes =
      response.data.values?.[0]?.[0] ?? "";

    if (currentNotes.includes(note)) {
      console.log(
        `Ledger note already present: '${sheetName}' row ${rowNumber}.`,
      );
      return;
    }

    const updatedNotes =
      currentNotes.trim().length > 0
        ? `${currentNotes} | ${note}`
        : note;

    await this.client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheet_id,
      range: `'${sheetName}'!F${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[updatedNotes]],
      },
    });

    console.log(
      `✓ Ledger note updated: '${sheetName}' row ${rowNumber}.`,
    );
  }

  async updateLedgerStatus(
    sheetName: string,
    rowNumber: number,
    status: string,
  ): Promise<void> {
    await this.client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheet_id,
      range: `'${sheetName}'!G${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });

    console.log(
      `✓ Ledger status updated: '${sheetName}' row ${rowNumber} → ${status}`,
    );
  }

  async listSheetNames(): Promise<void> {
    const response = await this.client.spreadsheets.get({
      spreadsheetId: this.config.spreadsheet_id,
      fields: "sheets.properties.title",
    });

    const sheetNames =
      response.data.sheets
        ?.map((sheet) => sheet.properties?.title)
        .filter((title): title is string => Boolean(title)) ?? [];

    console.log("Google Sheets tabs:", sheetNames);
  }
}