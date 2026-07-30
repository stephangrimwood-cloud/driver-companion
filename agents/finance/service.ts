import { GmailAgent } from "./gmail";
import { financeAgentConfig } from "./config";

export class FinanceService {
  private gmail = new GmailAgent(financeAgentConfig);

  initialise(): void {
    this.gmail.initialise();
  }
}