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
}