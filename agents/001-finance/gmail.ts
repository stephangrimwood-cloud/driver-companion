import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { google } from "googleapis";

import { createAuthenticatedGoogleOAuthClient } from "./auth";
import {
  EMAIL_SENDERS,
  EMAIL_SUBJECT_PREFIXES,
  GMAIL_SEARCH_QUERIES,
} from "./constants";

import type {
  AccountBookingEmailRecord,
  EmailAttachmentMetadata,
  EmailClassification,
  FinanceAgentConfig,
  InvoiceEmailRecord,
  RemittanceEmailRecord,
  RemittancePaymentLine,
} from "./types";

export class GmailAgent {
  private client = createAuthenticatedGoogleOAuthClient();

  constructor(private config: FinanceAgentConfig) {}

  initialise(): Promise<RemittanceEmailRecord[]> {
    console.log("Finance Agent: Gmail initialised.");
    console.log("Authenticated Gmail client created.");

    return this.listRecentEmails();
  }

  private async listRecentEmails(): Promise<RemittanceEmailRecord[]> {
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

    const remittanceCandidateIds: string[] = [];

    for (const message of response.data.messages ?? []) {
      if (!message.id) {
        continue;
      }

      const candidate = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: [
          "From",
          "Subject",
        ],
      });

      const candidateHeaders =
        candidate.data.payload?.headers ?? [];

      const candidateFrom =
        candidateHeaders.find(
          (header) => header.name === "From",
        )?.value ?? "(Unknown Sender)";

      const candidateSubject =
        candidateHeaders.find(
          (header) => header.name === "Subject",
        )?.value ?? "(No Subject)";

      const candidateClassification =
        GmailAgent.classifyEmail(
          candidateFrom,
          candidateSubject,
        );

      console.log(
        "PAYMENT CANDIDATE:",
        message.id,
        candidateClassification,
        candidateSubject,
      );

      if (candidateClassification === "REMITTANCE") {
        remittanceCandidateIds.push(message.id);
      }
    }

    const extractedRemittanceRecords:
      RemittanceEmailRecord[] = [];

    for (const messageId of remittanceCandidateIds) {
      const remittanceRecord =
        await this.processRemittanceMessage(
          messageId,
        );

      if (remittanceRecord) {
        extractedRemittanceRecords.push(
          remittanceRecord,
        );
      }
    }

    console.log(
      "EXTRACTED REMITTANCE RECORD COUNT:",
      extractedRemittanceRecords.length,
    );

    return extractedRemittanceRecords;
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
        EMAIL_SUBJECT_PREFIXES.ACCOUNT_BOOKING,
      )
    ) {
      return "ACCOUNT_BOOKING";
    }

    if (
      isXeroSender &&
      subject.startsWith(
        EMAIL_SUBJECT_PREFIXES.INVOICE,
      ) &&
      subject.includes(
        "from Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver",
      )
    ) {
      return "INVOICE";
    }

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
        ) &&
        paymentLines.every((paymentLine) =>
          GmailAgent.doesRemittanceReferenceMatchInvoiceDate(
            paymentLine,
          ),
        )
          ? "VALID"
          : "REVIEW_REQUIRED",
          };
        }

  static createAccountBookingRecord(
    messageId: string,
    from: string,
    subject: string,
    receivedDate: string,
    attachments: EmailAttachmentMetadata[],
    paymentDate: string | null = null,
    pdfTotal: number | null = null,
    bookingReference: string | null = null,
  ): AccountBookingEmailRecord | null {
    const classification = GmailAgent.classifyEmail(
      from,
      subject,
    );

    if (classification !== "ACCOUNT_BOOKING") {
      return null;
    }

    return {
      messageId,
      classification,
      subject,
      receivedDate,
      paymentDate,
      pdfTotal,
      bookingReference,
      subjectTotalMatchesPdfTotal:
        GmailAgent.doesSubjectTotalMatchPdfTotal(
          GmailAgent.extractPaymentAmount(subject),
          pdfTotal,
        ),
      validationStatus:
        GmailAgent.doesSubjectTotalMatchPdfTotal(
          GmailAgent.extractPaymentAmount(subject),
          pdfTotal,
        )
          ? "VALID"
          : "REVIEW_REQUIRED",
      senderName:
        GmailAgent.extractSenderName(from),
      senderEmail:
        GmailAgent.extractSenderEmail(from),
      paymentAmount:
        GmailAgent.extractPaymentAmount(subject),
      attachments,
    };
  }

  static extractAccountBookingReference(
    pdfText: string,
  ): string | null {
    const match = pdfText.match(
      /^[ \t]*\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+(\d{7})\s+[\d,]+\.\d{2}\s+[\d,]+\.\d{2}\s+[\d,]+\.\d{2}[ \t]*$/m,
    );

    return match?.[1] ?? null;
  }

  static extractInvoiceNumber(
    pdfText: string,
  ): string | null {
    const match = pdfText.match(
      /Invoice Number\s+(INV-\d+)/,
    );

    return match?.[1] ?? null;
  }

  static extractInvoiceDate(
    pdfText: string,
  ): string | null {
    const match = pdfText.match(
      /Invoice Date\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/,
    );

    return match?.[1] ?? null;
  }

  static extractInvoiceDueDate(
    pdfText: string,
  ): string | null {
    const match = pdfText.match(
      /Due Date:?\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/,
    );

    return match?.[1] ?? null;
  }

  static extractInvoiceReference(
    pdfText: string,
  ): string | null {
    const match = pdfText.match(
      /Reference\s+(\d{8})/,
    );

    return match?.[1] ?? null;
  }

  static extractInvoiceTotal(
    pdfText: string,
  ): number | null {
    const match = pdfText.match(
      /TOTAL AUD\s+([\d,]+\.\d{2})/,
    );

    if (!match) {
      return null;
    }

    return Number.parseFloat(
      match[1].replace(/,/g, ""),
    );
  }

  static extractInvoiceAmountDue(
    pdfText: string,
  ): number | null {
    const match = pdfText.match(
      /Amount Due\s+([\d,]+\.\d{2})/,
    );

    if (!match) {
      return null;
    }

    return Number.parseFloat(
      match[1].replace(/,/g, ""),
    );
  }

  static createInvoiceRecord(
    messageId: string,
    from: string,
    subject: string,
    emailDate: string,
    pdfText: string,
    attachments: EmailAttachmentMetadata[],
  ): InvoiceEmailRecord {
    const invoiceNumber =
      this.extractInvoiceNumber(pdfText);
    const invoiceDate =
      this.extractInvoiceDate(pdfText);
    const dueDate =
      this.extractInvoiceDueDate(pdfText);
    const invoiceReference =
      this.extractInvoiceReference(pdfText);
    const amountDue =
      this.extractInvoiceAmountDue(pdfText);
    const invoiceTotal =
      this.extractInvoiceTotal(pdfText);

    const amountDueMatchesInvoiceTotal =
      amountDue !== null &&
      invoiceTotal !== null &&
      Math.abs(amountDue - invoiceTotal) < 0.001;

    const hasRequiredFields =
      invoiceNumber !== null &&
      invoiceDate !== null &&
      dueDate !== null &&
      invoiceReference !== null &&
      amountDue !== null &&
      invoiceTotal !== null;

    return {
      messageId,
      from,
      subject,
      emailDate,
      invoiceNumber,
      invoiceDate,
      dueDate,
      invoiceReference,
      amountDue,
      invoiceTotal,
      amountDueMatchesInvoiceTotal,
      validationStatus:
        hasRequiredFields &&
        amountDueMatchesInvoiceTotal
          ? "VALID"
          : "REVIEW_REQUIRED",
      attachments,
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

  static doesRemittanceReferenceMatchInvoiceDate(
    paymentLine: RemittancePaymentLine,
  ): boolean {
    const match = paymentLine.invoiceDate.match(
      /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/,
    );

    if (!match) {
      return false;
    }

    const months: Record<string, string> = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const month = months[match[2]];

    if (!month) {
      return false;
    }

    const day = match[1].padStart(2, "0");

    const expectedReference =
      `${day}${month}${match[3]}`;

    return paymentLine.reference === expectedReference;
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

  private async processRemittanceMessage(
    messageId: string,
  ): Promise<RemittanceEmailRecord | null> {
    const gmail = google.gmail({
      version: "v1",
      auth: this.client,
    });

    console.log(
      "Processing remittance message:",
      messageId,
    );

    const email = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });

    const headers = email.data.payload?.headers ?? [];

    const emailParts =
      email.data.payload?.parts ?? [];

    const attachments =
      GmailAgent.extractAttachmentMetadata(
        emailParts,
      );

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

      let remittancePaymentLines: RemittancePaymentLine[] = [];
      let remittancePaymentDate: string | null = null;
      let remittancePdfTotal: number | null = null;

      const firstAttachment = attachments[0];

      if (firstAttachment) {
        const attachmentResponse =
          await gmail.users.messages.attachments.get({
            userId: "me",
            messageId,
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

          const safeFilename =
            `${messageId}-${path.basename(
              firstAttachment.filename,
            )}`;

          const downloadPath = path.join(
            process.cwd(),
            "agents",
            "001-finance",
            "downloads",
            safeFilename,
          );

          await writeFile(
            downloadPath,
            attachmentBuffer,
          );

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
              "Fetched PDF text for:",
              messageId,
            );
          } finally {
            await pdfParser.destroy();
          }
        }
      }

    console.log(
      "Fetched remittance message:",
      email.data.id,
    );

    return GmailAgent.createRemittanceRecord(
      messageId,
      from,
      subject,
      date,
      attachments,
      remittancePaymentLines,
      remittancePaymentDate,
      remittancePdfTotal,
    );
  }
}
