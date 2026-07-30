import type { FinanceAgentConfig } from "./types";

export class GmailAgent {
  constructor(private config: FinanceAgentConfig) {}

  initialise(): void {
    console.log("Finance Agent: Gmail initialised.");
  }
}