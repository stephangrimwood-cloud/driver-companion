import { describe, expect, it } from "vitest";
import { GmailAgent } from "./gmail";

describe("Gmail email classification", () => {
  it("classifies a standard Cairns Taxis Xero payment as a remittance", () => {
    const from =
      "Shirley Foley <messaging-service@post.xero.com>";
    const subject =
      "Payment has been made by Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver for AUD 423.54";

    const classification = GmailAgent.classifyEmail(
      from,
      subject,
    );

    expect(classification).toBe("REMITTANCE");
  });

  it("classifies an unrelated email as unknown", () => {
    const from = "example@example.com";
    const subject =
      "Your monthly account statement is ready";

    const classification = GmailAgent.classifyEmail(
      from,
      subject,
    );

    expect(classification).toBe("UNKNOWN");
  });

  it("does not classify the remittance subject from another sender", () => {
    const from = "example@example.com";
    const subject =
      "Payment has been made by Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver for AUD 423.54";

    const classification = GmailAgent.classifyEmail(
      from,
      subject,
    );

    expect(classification).toBe("UNKNOWN");
  });

  it("does not classify an unrelated Xero email as a remittance", () => {
    const from =
      "Shirley Foley <messaging-service@post.xero.com>";
    const subject = "Your Xero account statement is ready";

    const classification = GmailAgent.classifyEmail(
      from,
      subject,
    );

    expect(classification).toBe("UNKNOWN");
  });

  it("extracts the payment amount from a standard remittance subject", () => {
    const subject =
      "Payment has been made by Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver for AUD 423.54";

    const amount =
      GmailAgent.extractPaymentAmount(subject);

    expect(amount).toBe(423.54);
  });

  it("returns null when the subject contains no payment amount", () => {
    const subject =
      "Payment has been made by Cairns Taxis Limited";

    const amount =
      GmailAgent.extractPaymentAmount(subject);

    expect(amount).toBeNull();
  });

  it("extracts the remittance reference from a standard subject", () => {
    const subject =
      "Payment has been made by Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver for AUD 423.54";

    const reference =
      GmailAgent.extractPaymentReference(subject);

    expect(reference).toBe("140967985");
  });

  it("returns null when the subject contains no remittance reference", () => {
    const subject =
      "Payment has been made by Cairns Taxis Limited for AUD 423.54";

    const reference =
      GmailAgent.extractPaymentReference(subject);

    expect(reference).toBeNull();
  });

  it("extracts the email address from a named sender", () => {
    const from =
      "Shirley Foley <messaging-service@post.xero.com>";

    const senderEmail =
      GmailAgent.extractSenderEmail(from);

    expect(senderEmail).toBe(
      "messaging-service@post.xero.com",
    );
  });

  it("accepts a plain sender email address", () => {
    const from = "messaging-service@post.xero.com";

    const senderEmail =
      GmailAgent.extractSenderEmail(from);

    expect(senderEmail).toBe(
      "messaging-service@post.xero.com",
    );
  });

  it("returns null when no sender email address is present", () => {
    const from = "Unknown Sender";

    const senderEmail =
      GmailAgent.extractSenderEmail(from);

    expect(senderEmail).toBeNull();
  });

  it("extracts the sender name from a named sender", () => {
    const from =
      "Shirley Foley <messaging-service@post.xero.com>";

    const senderName =
      GmailAgent.extractSenderName(from);

    expect(senderName).toBe("Shirley Foley");
  });

  it("returns null when the sender has no display name", () => {
    const from = "messaging-service@post.xero.com";

    const senderName =
      GmailAgent.extractSenderName(from);

    expect(senderName).toBeNull();
  });

  it("creates a structured record from a standard remittance email", () => {
    const messageId = "19fc9d98e920f84c";
    const from =
      "Shirley Foley <messaging-service@post.xero.com>";
    const subject =
      "Payment has been made by Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver for AUD 423.54";
    const receivedDate =
      "Mon, 03 Aug 2026 22:58:25 +0000";
    const paymentDate = "4 Aug 2026";
    const pdfTotal = 423.54;
    const attachments = [
      {
        filename:
          "Remittance Advice from Cairns Taxis Limited 04Aug2026.pdf",
        mimeType: "application/pdf",
        attachmentId: "attachment-123",
      },
    ];
    const paymentLines = [
      {
        invoiceDate: "31 Jul 2026",
        reference: "31072026",
        invoiceTotal: 141.27,
        amountPaid: 141.27,
        stillOwing: 0,
      },
      {
        invoiceDate: "1 Aug 2026",
        reference: "01082026",
        invoiceTotal: 136.9,
        amountPaid: 136.9,
        stillOwing: 0,
      },
      {
        invoiceDate: "2 Aug 2026",
        reference: "02082026",
        invoiceTotal: 107.02,
        amountPaid: 107.02,
        stillOwing: 0,
      },
      {
        invoiceDate: "3 Aug 2026",
        reference: "03082026",
        invoiceTotal: 38.35,
        amountPaid: 38.35,
        stillOwing: 0,
      },
    ];

    const record =
      GmailAgent.createRemittanceRecord(
        messageId,
        from,
        subject,
        receivedDate,
        attachments,
        paymentLines,
        paymentDate,
        pdfTotal,
      );

    expect(record).toEqual({
      messageId: "19fc9d98e920f84c",
      classification: "REMITTANCE",
      subject,
      receivedDate,
      paymentDate: "4 Aug 2026",
      senderName: "Shirley Foley",
      senderEmail: "messaging-service@post.xero.com",
      paymentAmount: 423.54,
      pdfTotal: 423.54,
      paymentReference: "140967985",
      attachments,
      paymentLines,
      totalMatches: true,
      pdfTotalMatches: true,
      subjectTotalMatchesPdfTotal: true,
      allTotalsConsistent: true,
      validationStatus: "VALID",
    });
  });

  it("does not create a remittance record for an unrelated email", () => {
    const messageId = "unrelated-message";
    const from = "example@example.com";
    const subject =
      "Your monthly account statement is ready";
    const receivedDate =
      "Mon, 03 Aug 2026 22:58:25 +0000";

    const record =
      GmailAgent.createRemittanceRecord(
        messageId,
        from,
        subject,
        receivedDate,
        [],
        [],
    );

    expect(record).toBeNull();
  });

  it("extracts PDF attachment metadata from Gmail message parts", () => {
    const parts = [
      {
        mimeType: "multipart/alternative",
        filename: "",
        body: {
          attachmentId: null,
        },
      },
      {
        mimeType: "application/pdf",
        filename:
          "Remittance Advice from Cairns Taxis Limited 04Aug2026.pdf",
        body: {
          attachmentId: "attachment-123",
        },
      },
    ];

    const attachments =
      GmailAgent.extractAttachmentMetadata(parts);

    expect(attachments).toEqual([
      {
        filename:
          "Remittance Advice from Cairns Taxis Limited 04Aug2026.pdf",
        mimeType: "application/pdf",
        attachmentId: "attachment-123",
      },
    ]);
  });

  it("extracts payment lines from remittance PDF text", () => {
    const pdfText = `
Invoice Date Reference Invoice Total Amount Paid Still Owing
31 Jul 2026 31072026 141.27 141.27 0.00
1 Aug 2026 01082026 136.90 136.90 0.00
2 Aug 2026 02082026 107.02 107.02 0.00
3 Aug 2026 03082026 38.35 38.35 0.00
Total AUD 423.54 0.00
`;

    const paymentLines =
      GmailAgent.extractRemittancePaymentLines(
        pdfText,
      );

    expect(paymentLines).toEqual([
      {
        invoiceDate: "31 Jul 2026",
        reference: "31072026",
        invoiceTotal: 141.27,
        amountPaid: 141.27,
        stillOwing: 0,
      },
      {
        invoiceDate: "1 Aug 2026",
        reference: "01082026",
        invoiceTotal: 136.9,
        amountPaid: 136.9,
        stillOwing: 0,
      },
      {
        invoiceDate: "2 Aug 2026",
        reference: "02082026",
        invoiceTotal: 107.02,
        amountPaid: 107.02,
        stillOwing: 0,
      },
      {
        invoiceDate: "3 Aug 2026",
        reference: "03082026",
        invoiceTotal: 38.35,
        amountPaid: 38.35,
        stillOwing: 0,
      },
    ]);
  });

  it("calculates the total paid across remittance payment lines", () => {
    const paymentLines = [
      {
        invoiceDate: "31 Jul 2026",
        reference: "31072026",
        invoiceTotal: 141.27,
        amountPaid: 141.27,
        stillOwing: 0,
      },
      {
        invoiceDate: "1 Aug 2026",
        reference: "01082026",
        invoiceTotal: 136.9,
        amountPaid: 136.9,
        stillOwing: 0,
      },
      {
        invoiceDate: "2 Aug 2026",
        reference: "02082026",
        invoiceTotal: 107.02,
        amountPaid: 107.02,
        stillOwing: 0,
      },
      {
        invoiceDate: "3 Aug 2026",
        reference: "03082026",
        invoiceTotal: 38.35,
        amountPaid: 38.35,
        stillOwing: 0,
      },
    ];

    const total =
      GmailAgent.calculateRemittancePaymentTotal(
        paymentLines,
      );

    expect(total).toBe(423.54);
  });

  it("confirms when the remittance total matches the payment lines", () => {
    const paymentLines = [
      {
        invoiceDate: "31 Jul 2026",
        reference: "31072026",
        invoiceTotal: 141.27,
        amountPaid: 141.27,
        stillOwing: 0,
      },
      {
        invoiceDate: "1 Aug 2026",
        reference: "01082026",
        invoiceTotal: 136.9,
        amountPaid: 136.9,
        stillOwing: 0,
      },
      {
        invoiceDate: "2 Aug 2026",
        reference: "02082026",
        invoiceTotal: 107.02,
        amountPaid: 107.02,
        stillOwing: 0,
      },
      {
        invoiceDate: "3 Aug 2026",
        reference: "03082026",
        invoiceTotal: 38.35,
        amountPaid: 38.35,
        stillOwing: 0,
      },
    ];

    const matches = GmailAgent.doesRemittanceTotalMatch(
      423.54,
      paymentLines,
    );

    expect(matches).toBe(true);
  });

  it("detects when the remittance total does not match the payment lines", () => {
    const paymentLines = [
      {
        invoiceDate: "31 Jul 2026",
        reference: "31072026",
        invoiceTotal: 141.27,
        amountPaid: 141.27,
        stillOwing: 0,
      },
      {
        invoiceDate: "1 Aug 2026",
        reference: "01082026",
        invoiceTotal: 136.9,
        amountPaid: 136.9,
        stillOwing: 0,
      },
    ];

    const matches = GmailAgent.doesRemittanceTotalMatch(
      999.99,
      paymentLines,
    );

    expect(matches).toBe(false);
  });

  it("extracts the payment date from remittance PDF text", () => {
    const pdfText = `
REMITTANCE ADVICE
Payment Date
4 Aug 2026
Sent Date
4 Aug 2026
`;

    const paymentDate =
      GmailAgent.extractRemittancePaymentDate(pdfText);

    expect(paymentDate).toBe("4 Aug 2026");
  });

  it("extracts the total paid from remittance PDF text", () => {
    const pdfText = `
REMITTANCE ADVICE
Total AUD paid 423.54
`;

    const total =
      GmailAgent.extractRemittancePdfTotal(pdfText);

    expect(total).toBe(423.54);
  });

  it("confirms when the PDF total matches the payment lines", () => {
    const paymentLines = [
      {
        invoiceDate: "31 Jul 2026",
        reference: "31072026",
        invoiceTotal: 141.27,
        amountPaid: 141.27,
        stillOwing: 0,
      },
      {
        invoiceDate: "1 Aug 2026",
        reference: "01082026",
        invoiceTotal: 136.9,
        amountPaid: 136.9,
        stillOwing: 0,
      },
    ];

    const matches =
      GmailAgent.doesRemittancePdfTotalMatch(
        278.17,
        paymentLines,
      );

    expect(matches).toBe(true);
  });

  it("confirms when the email subject total matches the PDF total", () => {
    const matches =
        GmailAgent.doesSubjectTotalMatchPdfTotal(
        423.54,
        423.54,
        );

    expect(matches).toBe(true);
    });

  it("detects when the email subject total does not match the PDF total", () => {
    const matches =
        GmailAgent.doesSubjectTotalMatchPdfTotal(
        423.54,
        999.99,
        );

    expect(matches).toBe(false);
    });  

    it("confirms when all remittance totals are consistent", () => {
    const paymentLines = [
    {
      invoiceDate: "31 Jul 2026",
      reference: "31072026",
      invoiceTotal: 141.27,
      amountPaid: 141.27,
      stillOwing: 0,
    },
    {
      invoiceDate: "1 Aug 2026",
      reference: "01082026",
      invoiceTotal: 136.9,
      amountPaid: 136.9,
      stillOwing: 0,
    },
  ];

    const consistent =
        GmailAgent.areRemittanceTotalsConsistent(
        278.17,
        278.17,
        paymentLines,
        );

    expect(consistent).toBe(true);
    });

    it("detects when the remittance totals are not consistent", () => {
    const paymentLines = [
        {
        invoiceDate: "31 Jul 2026",
        reference: "31072026",
        invoiceTotal: 141.27,
        amountPaid: 141.27,
        stillOwing: 0,
        },
        {
        invoiceDate: "1 Aug 2026",
        reference: "01082026",
        invoiceTotal: 136.9,
        amountPaid: 136.9,
        stillOwing: 0,
        },
    ];

    const consistent =
        GmailAgent.areRemittanceTotalsConsistent(
        278.17,
        999.99,
        paymentLines,
        );

    expect(consistent).toBe(false);
    });

    it("marks a remittance for review when totals do not match", () => {
      const record =
        GmailAgent.createRemittanceRecord(
            "message-123",
            "Shirley Foley <messaging-service@post.xero.com>",
            "Payment has been made by Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver for AUD 423.54",
            "Mon, 03 Aug 2026 22:58:25 +0000",
            [],
            [
                {
                invoiceDate: "3 Aug 2026",
                reference: "03082026",
                invoiceTotal: 38.35,
                amountPaid: 38.35,
                stillOwing: 0,
                },
            ],
            "4 Aug 2026",
            999.99,
            );

        expect(record?.validationStatus).toBe(
            "REVIEW_REQUIRED",
        );
    });

    it("classifies a Cairns Taxis account booking payment", () => {
      const from =
        "Tammy Sabbadin <messaging-service@post.xero.com>";
      const subject =
        "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70";

      const classification = GmailAgent.classifyEmail(
        from,
        subject,
      );

      expect(classification).toBe("ACCOUNT_BOOKING");
    });

    it("does not classify an account booking subject from another sender", () => {
      const from = "example@example.com";
      const subject =
        "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70";

      const classification = GmailAgent.classifyEmail(
        from,
        subject,
      );

      expect(classification).toBe("UNKNOWN");
    });

    it("extracts the payment amount from an account booking subject", () => {
      const subject =
        "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70";

      const amount =
        GmailAgent.extractPaymentAmount(subject);

      expect(amount).toBe(19.70);
    });

    it("creates a structured record from an account booking email", () => {
      const messageId = "account-booking-message-123";
      const from =
        "Tammy Sabbadin <messaging-service@post.xero.com>";
      const subject =
        "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70";
      const receivedDate =
        "Mon, 03 Aug 2026 22:58:25 +0000";
      const paymentDate = "28 Jul 2026";
      const pdfTotal = 19.70;
      const bookingReference = "8091343";
      const attachments = [
        {
          filename: "account-booking-payment.pdf",
          mimeType: "application/pdf",
          attachmentId: "attachment-456",
        },
      ];

      const record =
        GmailAgent.createAccountBookingRecord(
          messageId,
          from,
          subject,
          receivedDate,
          attachments,
          paymentDate,
          pdfTotal,
          bookingReference,
        );

      expect(record).toEqual({
        messageId: "account-booking-message-123",
        classification: "ACCOUNT_BOOKING",
        subject,
        receivedDate,
        paymentDate: "28 Jul 2026",
        pdfTotal: 19.70,
        bookingReference: "8091343",
        subjectTotalMatchesPdfTotal: true,
        validationStatus: "VALID",
        senderName: "Tammy Sabbadin",
        senderEmail: "messaging-service@post.xero.com",
        paymentAmount: 19.70,
        attachments,
      });
    });

    it("does not create an account booking record for another sender", () => {
      const record =
        GmailAgent.createAccountBookingRecord(
          "message-456",
          "example@example.com",
          "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70",
          "Mon, 03 Aug 2026 22:58:25 +0000",
          [],
        );

      expect(record).toBeNull();
    });

    it("extracts the booking reference from an account booking PDF", () => {
      const pdfText = `
    Invoice Date Reference Invoice Total Amount Paid Still Owing
    27 Jul 2026 8091343 19.70 19.70 0.00
    Total AUD 19.70 0.00
    `;

      const reference =
        GmailAgent.extractAccountBookingReference(
          pdfText,
        );

      expect(reference).toBe("8091343");
    });

    it("extracts the payment date from an account booking PDF", () => {
      const pdfText = `
    REMITTANCE ADVICE
    Payment Date
    28 Jul 2026
    Sent Date
    28 Jul 2026
    `;

      const paymentDate =
        GmailAgent.extractRemittancePaymentDate(
          pdfText,
        );

      expect(paymentDate).toBe("28 Jul 2026");
    });

    it("extracts the PDF total from an account booking PDF", () => {
      const pdfText = `
    REMITTANCE ADVICE
    Total AUD paid 19.70
    `;

      const pdfTotal =
        GmailAgent.extractRemittancePdfTotal(pdfText);

      expect(pdfTotal).toBe(19.70);
    });

    it("marks an account booking for review when totals do not match", () => {
      const record =
        GmailAgent.createAccountBookingRecord(
          "account-booking-message-456",
          "Tammy Sabbadin <messaging-service@post.xero.com>",
          "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood for AUD 19.70",
          "Tue, 28 Jul 2026 02:23:34 +0000",
          [],
          "28 Jul 2026",
          99.99,
          "8091343",
        );

      expect(record?.subjectTotalMatchesPdfTotal).toBe(
        false,
      );
      expect(record?.validationStatus).toBe(
        "REVIEW_REQUIRED",
      );
    });

    it("classifies a Cairns Taxis invoice email", () => {
      const from =
        "Shirley Foley <messaging-service@post.xero.com>";
      const subject =
        "Invoice INV-14272 from Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver";

      const classification = GmailAgent.classifyEmail(
        from,
        subject,
      );

      expect(classification).toBe("INVOICE");
    });

    it("does not classify an invoice subject from another sender", () => {
      const from = "example@example.com";
      const subject =
        "Invoice INV-14272 from Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver";

      const classification = GmailAgent.classifyEmail(
        from,
        subject,
      );

      expect(classification).toBe("UNKNOWN");
    });

    it("extracts the invoice number from an invoice PDF", () => {
      const pdfText = `
    TAX INVOICE
    Invoice Number
    INV-14272
    Reference
    13072026
    `;

      const invoiceNumber =
        GmailAgent.extractInvoiceNumber(pdfText);

      expect(invoiceNumber).toBe("INV-14272");
    });

    it("extracts the invoice date from an invoice PDF", () => {
      const pdfText = `
    TAX INVOICE
    Invoice Date
    13 Jul 2026
    Invoice Number
    INV-14272
    `;

      const invoiceDate =
        GmailAgent.extractInvoiceDate(pdfText);

      expect(invoiceDate).toBe("13 Jul 2026");
    });

    it("extracts the due date from an invoice PDF", () => {
      const pdfText = `
    TAX INVOICE
    Due Date: 22 Jul 2026
    `;

      const dueDate =
        GmailAgent.extractInvoiceDueDate(pdfText);

      expect(dueDate).toBe("22 Jul 2026");
    });

    it("extracts the reference from an invoice PDF", () => {
      const pdfText = `
    TAX INVOICE
    Invoice Number
    INV-14272
    Reference
    13072026
    `;

      const reference =
        GmailAgent.extractInvoiceReference(pdfText);

      expect(reference).toBe("13072026");
    });

    it("extracts the total from an invoice PDF", () => {
      const pdfText = `
    Subtotal 3.19
    TOTAL GST 10% 0.31
    TOTAL AUD 3.50
    `;

      const total =
        GmailAgent.extractInvoiceTotal(pdfText);

      expect(total).toBe(3.5);
    });

    it("extracts the amount due from an invoice PDF", () => {
      const pdfText = `
    Invoice Number INV-14272
    Amount Due 3.50
    Due Date 22 Jul 2026
    `;

      const amountDue =
        GmailAgent.extractInvoiceAmountDue(pdfText);

      expect(amountDue).toBe(3.5);
    });

    it("creates a valid invoice record", () => {
      const record = GmailAgent.createInvoiceRecord(
        "message-123",
        "Shirley Foley <messaging-service@post.xero.com>",
        "Invoice INV-14272 from Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver",
        "Mon, 13 Jul 2026 10:00:00 +1000",
        `
    Invoice Number
    INV-14272
    Invoice Date
    13 Jul 2026
    Reference
    13072026
    Amount Due 3.50
    Due Date: 22 Jul 2026
    TOTAL AUD 3.50
    `,
        [],
      );

      expect(record.invoiceNumber).toBe("INV-14272");
      expect(record.invoiceDate).toBe("13 Jul 2026");
      expect(record.dueDate).toBe("22 Jul 2026");
      expect(record.invoiceReference).toBe("13072026");
      expect(record.amountDue).toBe(3.5);
      expect(record.invoiceTotal).toBe(3.5);
      expect(record.amountDueMatchesInvoiceTotal).toBe(true);
      expect(record.validationStatus).toBe("VALID");
    });

    it("marks an invoice for review when the totals do not match", () => {
      const record = GmailAgent.createInvoiceRecord(
        "message-123",
        "Shirley Foley <messaging-service@post.xero.com>",
        "Invoice INV-14272 from Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver",
        "Mon, 13 Jul 2026 10:00:00 +1000",
        `
    Invoice Number
    INV-14272
    Invoice Date
    13 Jul 2026
    Reference
    13072026
    Amount Due 3.50
    Due Date: 22 Jul 2026
    TOTAL AUD 4.50
    `,
        [],
      );

      expect(record.amountDueMatchesInvoiceTotal).toBe(false);
      expect(record.validationStatus).toBe(
        "REVIEW_REQUIRED",
      );
    });

    it("marks an invoice for review when a required field is missing", () => {
      const record = GmailAgent.createInvoiceRecord(
        "message-123",
        "Shirley Foley <messaging-service@post.xero.com>",
        "Invoice INV-14272 from Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver",
        "Mon, 13 Jul 2026 10:00:00 +1000",
        `
    Invoice Number
    INV-14272
    Invoice Date
    13 Jul 2026
    Amount Due 3.50
    Due Date: 22 Jul 2026
    TOTAL AUD 3.50
    `,
        [],
      );

      expect(record.invoiceReference).toBe(null);
      expect(record.validationStatus).toBe(
        "REVIEW_REQUIRED",
      );
    });

    it("marks a remittance for review when the reference date does not match the invoice date", () => {
      const record = GmailAgent.createRemittanceRecord(
        "message-123",
        "Shirley Foley <messaging-service@post.xero.com>",
        "Payment has been made by Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver for AUD 182.58",
        "Mon, 10 Aug 2026 00:05:21 +0000",
        [],
        [
          {
            invoiceDate: "7 Aug 2026",
            reference: "27082026",
            invoiceTotal: 182.58,
            amountPaid: 182.58,
            stillOwing: 0,
          },
        ],
        "10 Aug 2026",
        182.58,
      );

      expect(record).not.toBeNull();
      expect(record?.validationStatus).toBe(
        "REVIEW_REQUIRED",
      );
    });
});
