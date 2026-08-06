import { GmailAgent } from "./gmail";
import { financeAgentConfig } from "./config";
import { SheetsAgent } from "./sheets";

export class FinanceService {
  private gmail = new GmailAgent(financeAgentConfig);
  private sheets = new SheetsAgent();

  initialise(): void {
    this.gmail.initialise();
    void this.sheets.readSpreadsheetTitle();
    void this.sheets.writeTestCell();
  }
}