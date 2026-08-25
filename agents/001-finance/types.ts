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

export type AccountBookingValidationStatus =
  | "VALID"
  | "REVIEW_REQUIRED";

export type InvoiceValidationStatus =
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

export interface AccountBookingEmailRecord {
  messageId: string;
  classification: "ACCOUNT_BOOKING";
  subject: string;
  receivedDate: string;
  paymentDate: string | null;
  invoiceDate: string | null;
  pdfTotal: number | null;
  bookingReference: string | null;
  subjectTotalMatchesPdfTotal: boolean;
  validationStatus: AccountBookingValidationStatus;
  senderName: string | null;
  senderEmail: string | null;
  paymentAmount: number | null;
  attachments: EmailAttachmentMetadata[];
}

export interface InvoiceEmailRecord {
  messageId: string;
  from: string;
  subject: string;
  emailDate: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  invoiceReference: string | null;
  amountDue: number | null;
  invoiceTotal: number | null;
  amountDueMatchesInvoiceTotal: boolean;
  validationStatus: InvoiceValidationStatus;
  attachments: EmailAttachmentMetadata[];
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

export type VerificationMethod =
  | "AUTOMATIC"
  | "MANUAL";

  export interface VerificationRecord {
    ledgerDate: string;
    method: VerificationMethod;
    verifiedAt: string;
    source: string;
    actionKey: string;
  }