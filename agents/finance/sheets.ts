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
}