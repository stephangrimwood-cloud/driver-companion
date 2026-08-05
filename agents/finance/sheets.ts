import {
  createGoogleSheetsClient,
  loadGoogleSheetsConfig,
} from "./auth";

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

  async writeTestCell(): Promise<void> {
    await this.client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheet_id,
      range: `'${this.config.template_sheet}'!A40`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["Finance Agent Test"]],
      },
    });

    console.log("✓ Test value written to Google Sheets.");
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
    const backupSheetName = "Driver Companion Backup";

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
      `✓ Driver Companion backup saved to row ${targetRow}.`,
    );
  }

  async readReportBackups(): Promise<string[]> {
    const backupSheetName = "Driver Companion Backup";

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
}