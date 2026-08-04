import type { FinanceAgentConfig } from "./types";
import {
  createAuthenticatedGoogleOAuthClient,
  createGoogleSheetsClient,
  loadGoogleSpreadsheetId,
} from "./auth";
import { google } from "googleapis";
import { GMAIL_SEARCH_QUERIES } from "./constants";

export class GmailAgent {
  private client = createAuthenticatedGoogleOAuthClient();

  constructor(private config: FinanceAgentConfig) {}

  initialise(): void {
    console.log("Finance Agent: Gmail initialised.");
    console.log("Authenticated Gmail client created.");

    void this.listRecentEmails();
  }

  private async listRecentEmails(): Promise<void> {
    console.log("Listing recent emails...");

    const gmail = google.gmail({
      version: "v1",
      auth: this.client,
    });

    console.log("Connected to Gmail API.");

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 5,
      q: GMAIL_SEARCH_QUERIES.REMITTANCES,
    });

    const firstMessage = response.data.messages?.[0];

    if (!firstMessage) {
      console.log("No emails found.");
      return;
    }

    console.log("First message ID:", firstMessage.id);

    const email = await gmail.users.messages.get({
      userId: "me",
      id: firstMessage.id!,
    });

    const headers = email.data.payload?.headers ?? [];

const subject =
  headers.find((header) => header.name === "Subject")?.value ??
  "(No Subject)";

const from =
  headers.find((header) => header.name === "From")?.value ??
  "(Unknown Sender)";

const date =
  headers.find((header) => header.name === "Date")?.value ??
  "(Unknown Date)";

    console.log("From:", from);
    console.log("Subject:", subject);
    console.log("Date:", date);
  }
}