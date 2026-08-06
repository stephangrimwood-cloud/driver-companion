export interface FinanceAgentConfig {
  enabled: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheet_id: string;
  template_sheet: string;
}

export type EmailClassification =
  | "REMITTANCE"
  | "ACCOUNT_BOOKING"
  | "INVOICE"
  | "UNKNOWN";

export type RemittanceValidationStatus =
  | "VALID"
  | "REVIEW_REQUIRED";

export interface RemittanceEmailRecord {
  messageId: string;
  classification: "REMITTANCE";
  subject: string;
  receivedDate: string;
  paymentDate: string | null;
  senderName: string | null;
  senderEmail: string | null;
  paymentAmount: number | null;
  pdfTotal: number | null;
  paymentReference: string | null;
  attachments: EmailAttachmentMetadata[];
  paymentLines: RemittancePaymentLine[];
  totalMatches: boolean;
  pdfTotalMatches: boolean;
  subjectTotalMatchesPdfTotal: boolean;
  allTotalsConsistent: boolean;
  validationStatus: RemittanceValidationStatus;
}

export interface EmailAttachmentMetadata {
  filename: string;
  mimeType: string;
  attachmentId: string;
}

export interface RemittancePaymentLine {
  invoiceDate: string;
  reference: string;
  invoiceTotal: number;
  amountPaid: number;
  stillOwing: number;
}