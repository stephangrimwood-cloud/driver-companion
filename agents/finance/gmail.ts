import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { google } from "googleapis";

import type { FinanceAgentConfig } from "./types";
import { createAuthenticatedGoogleOAuthClient } from "./auth";
import {
  EMAIL_SENDERS,
  EMAIL_SUBJECT_PREFIXES,
  GMAIL_SEARCH_QUERIES,
} from "./constants";
import type {
  EmailAttachmentMetadata,
  EmailClassification,
  RemittanceEmailRecord,
  RemittancePaymentLine,
} from "./types";

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
    const snippet =
      email.data.snippet ?? "(No email preview)";
    const emailParts = email.data.payload?.parts ?? [];

    const attachments =
      GmailAgent.extractAttachmentMetadata(emailParts);

    let attachmentByteLength: number | null = null;
    let remittancePaymentLines: RemittancePaymentLine[] = [];
    let remittancePaymentDate: string | null = null;
    let remittancePdfTotal: number | null = null;

    const firstAttachment = attachments[0];

    if (firstAttachment) {
      const attachmentResponse =
        await gmail.users.messages.attachments.get({
          userId: "me",
          messageId: firstMessage.id!,
          id: firstAttachment.attachmentId,
        });

      const encodedData = attachmentResponse.data.data;

      if (encodedData) {
        const attachmentBuffer = Buffer.from(
          encodedData
            .replace(/-/g, "+")
            .replace(/_/g, "/"),
          "base64",
        );

        attachmentByteLength = attachmentBuffer.length;

        const safeFilename = path.basename(
          firstAttachment.filename,
        );

        const downloadPath = path.join(
          process.cwd(),
          "agents",
          "finance",
          "downloads",
          safeFilename,
        );

        await writeFile(downloadPath, attachmentBuffer);

        console.log(
          "Attachment saved to:",
          downloadPath,
        );

        const pdfParser = new PDFParse({
          data: attachmentBuffer,
        });

        try {
          const pdfTextResult =
            await pdfParser.getText();

          console.log("PDF text:", pdfTextResult.text);

          remittancePaymentLines =
            GmailAgent.extractRemittancePaymentLines(
              pdfTextResult.text,
            );

            remittancePaymentDate =
            GmailAgent.extractRemittancePaymentDate(
              pdfTextResult.text,
            );

            remittancePdfTotal =
            GmailAgent.extractRemittancePdfTotal(
              pdfTextResult.text,
            );

          console.log(
            "Remittance payment lines:",
            remittancePaymentLines,
          );

          const remittancePaymentTotal =
            GmailAgent.calculateRemittancePaymentTotal(
              remittancePaymentLines,
            );

          console.log(
            "Remittance payment total:",
            remittancePaymentTotal,
          );

        } finally {
          await pdfParser.destroy();
        }
      }
    }

    const subject =
      headers.find(
        (header) => header.name === "Subject",
      )?.value ?? "(No Subject)";

    const from =
      headers.find(
        (header) => header.name === "From",
      )?.value ?? "(Unknown Sender)";

    const date =
      headers.find(
        (header) => header.name === "Date",
      )?.value ?? "(Unknown Date)";

    const classification = GmailAgent.classifyEmail(
      from,
      subject,
    );

    const paymentAmount =
      GmailAgent.extractPaymentAmount(subject);

    const paymentReference =
      GmailAgent.extractPaymentReference(subject);

    const senderEmail =
      GmailAgent.extractSenderEmail(from);

    const senderName =
      GmailAgent.extractSenderName(from);

    const remittanceTotalMatches =
      GmailAgent.doesRemittanceTotalMatch(
        paymentAmount,
        remittancePaymentLines,
      );  

    const remittanceRecord =
      GmailAgent.createRemittanceRecord(
        firstMessage.id!,
        from,
        subject,
        date,
        attachments,
        remittancePaymentLines,
        remittancePaymentDate,
        remittancePdfTotal,
      );

    console.log("From:", from);
    console.log("Subject:", subject);
    console.log("Date:", date);
    console.log("Classification:", classification);
    console.log("Payment amount:", paymentAmount);
    console.log(
      "Payment reference:",
      paymentReference,
    );
    console.log("Sender email:", senderEmail);
    console.log("Sender name:", senderName);
    console.log(
      "Remittance total matches:",
      remittanceTotalMatches,
    );
    console.log(
      "Remittance record:",
      remittanceRecord,
    );
    console.log("Email preview:", snippet);

    console.log(
      "Email parts:",
      emailParts.map((part) => ({
        mimeType: part.mimeType,
        filename: part.filename,
        attachmentId:
          part.body?.attachmentId ?? null,
      })),
    );

    console.log("Attachments:", attachments);

    console.log(
      "Downloaded attachment size:",
      attachmentByteLength,
      "bytes",
    );
  }

  static classifyEmail(
    from: string,
    subject: string,
  ): EmailClassification {
    const isXeroSender = from.includes(
      EMAIL_SENDERS.XERO,
    );

    if (
      isXeroSender &&
      subject.startsWith(
        EMAIL_SUBJECT_PREFIXES.REMITTANCE,
      )
    ) {
      return "REMITTANCE";
    }

    return "UNKNOWN";
  }

  static extractPaymentAmount(
    subject: string,
  ): number | null {
    const match = subject.match(
      /for AUD ([\d,]+\.\d{2})$/,
    );

    if (!match) {
      return null;
    }

    return Number(match[1].replace(",", ""));
  }

  static extractPaymentReference(
    subject: string,
  ): string | null {
    const match = subject.match(
      /Stephan(\d+)\s+Leased Driver/,
    );

    return match?.[1] ?? null;
  }

  static extractSenderEmail(
    from: string,
  ): string | null {
    const bracketedEmail = from.match(/<([^>]+)>/);

    if (bracketedEmail) {
      return bracketedEmail[1];
    }

    const plainEmail = from.match(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    );

    return plainEmail?.[0] ?? null;
  }

  static extractSenderName(
    from: string,
  ): string | null {
    const match = from.match(/^(.+?)\s*<[^>]+>$/);

    return match?.[1].trim() ?? null;
  }

  static createRemittanceRecord(
      messageId: string,
      from: string,
      subject: string,
      receivedDate: string,
      attachments: EmailAttachmentMetadata[],
      paymentLines: RemittancePaymentLine[],
      paymentDate: string | null = null,
      pdfTotal: number | null = null,
    ): RemittanceEmailRecord | null {
    const classification = GmailAgent.classifyEmail(
      from,
      subject,
    );

    if (classification !== "REMITTANCE") {
      return null;
    }

    return {
      messageId,
      classification,
      subject,
      receivedDate,
      paymentDate,
      senderName:
        GmailAgent.extractSenderName(from),
      senderEmail:
        GmailAgent.extractSenderEmail(from),
      paymentAmount:
        GmailAgent.extractPaymentAmount(subject),
      pdfTotal,
      paymentReference:
        GmailAgent.extractPaymentReference(subject),
      attachments,
      paymentLines,
      totalMatches: GmailAgent.doesRemittanceTotalMatch(
        GmailAgent.extractPaymentAmount(subject),
        paymentLines,
      ),
      pdfTotalMatches:
        GmailAgent.doesRemittancePdfTotalMatch(
          pdfTotal,
          paymentLines,
        ),
      subjectTotalMatchesPdfTotal:
        GmailAgent.doesSubjectTotalMatchPdfTotal(
          GmailAgent.extractPaymentAmount(subject),
          pdfTotal,
        ),
      allTotalsConsistent:
        GmailAgent.areRemittanceTotalsConsistent(
          GmailAgent.extractPaymentAmount(subject),
          pdfTotal,
          paymentLines,
        ),
      validationStatus:
        GmailAgent.areRemittanceTotalsConsistent(
          GmailAgent.extractPaymentAmount(subject),
          pdfTotal,
          paymentLines,
        )
          ? "VALID"
          : "REVIEW_REQUIRED",
    };
  }

  static extractAttachmentMetadata(
    parts: Array<{
      mimeType?: string | null;
      filename?: string | null;
      body?: {
        attachmentId?: string | null;
      } | null;
    }>,
  ): EmailAttachmentMetadata[] {
    return parts
      .filter(
        (part) =>
          part.filename &&
          part.mimeType &&
          part.body?.attachmentId,
      )
      .map((part) => ({
        filename: part.filename!,
        mimeType: part.mimeType!,
        attachmentId:
          part.body!.attachmentId!,
      }));
  }

  static extractRemittancePaymentLines(
    pdfText: string,
  ): RemittancePaymentLine[] {
    const linePattern =
      /^(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(\d{8})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$/gm;

    return Array.from(pdfText.matchAll(linePattern)).map(
      (match) => ({
        invoiceDate: match[1],
        reference: match[2],
        invoiceTotal: Number(
          match[3].replace(/,/g, ""),
        ),
        amountPaid: Number(
          match[4].replace(/,/g, ""),
        ),
        stillOwing: Number(
          match[5].replace(/,/g, ""),
        ),
      }),
    );
  }

  static extractRemittancePaymentDate(
    pdfText: string,
  ): string | null {
    const match = pdfText.match(
      /Payment Date\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/,
    );

    return match?.[1] ?? null;
  }

  static extractRemittancePdfTotal(
    pdfText: string,
  ): number | null {
    const match = pdfText.match(
      /Total AUD paid\s+([\d,]+\.\d{2})/,
    );

    if (!match) {
      return null;
    }

    return Number(match[1].replace(/,/g, ""));
  }

  static calculateRemittancePaymentTotal(
    paymentLines: RemittancePaymentLine[],
  ): number {
    const total = paymentLines.reduce(
      (sum, paymentLine) =>
        sum + paymentLine.amountPaid,
      0,
    );

    return Math.round(total * 100) / 100;
  }

  static doesRemittanceTotalMatch(
    expectedTotal: number | null,
    paymentLines: RemittancePaymentLine[],
  ): boolean {
    if (expectedTotal === null) {
      return false;
    }

    const paymentLineTotal =
      GmailAgent.calculateRemittancePaymentTotal(
        paymentLines,
      );

    return paymentLineTotal === expectedTotal;
  }

  static doesRemittancePdfTotalMatch(
    pdfTotal: number | null,
    paymentLines: RemittancePaymentLine[],
  ): boolean {
    if (pdfTotal === null) {
      return false;
    }

    const paymentLineTotal =
      GmailAgent.calculateRemittancePaymentTotal(
        paymentLines,
      );

    return paymentLineTotal === pdfTotal;
  }

  static doesSubjectTotalMatchPdfTotal(
    paymentAmount: number | null,
    pdfTotal: number | null,
  ): boolean {
    if (
      paymentAmount === null ||
      pdfTotal === null
    ) {
      return false;
    }

    return paymentAmount === pdfTotal;
  }

  static areRemittanceTotalsConsistent(
    paymentAmount: number | null,
    pdfTotal: number | null,
    paymentLines: RemittancePaymentLine[],
  ): boolean {
    return (
      GmailAgent.doesRemittanceTotalMatch(
        paymentAmount,
        paymentLines,
      ) &&
      GmailAgent.doesRemittancePdfTotalMatch(
        pdfTotal,
        paymentLines,
      ) &&
      GmailAgent.doesSubjectTotalMatchPdfTotal(
        paymentAmount,
        pdfTotal,
      )
    );
  }

  
}