export const EMAIL_SENDERS = {
  XERO: "messaging-service@post.xero.com",
};

export const GMAIL_SEARCH_QUERIES = {
  REMITTANCES: `from:${EMAIL_SENDERS.XERO} subject:"Payment has been made by Cairns Taxis Limited"`,
  ACCOUNT_BOOKINGS: `from:${EMAIL_SENDERS.XERO} subject:"Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood"`,
  INVOICES: `from:${EMAIL_SENDERS.XERO} subject:"Invoice" subject:"from Cairns Taxis Limited for Grimwood Stephan140967985 Leased Driver"`,
};

export const EMAIL_SUBJECT_PREFIXES = {
  REMITTANCE:
    "Payment has been made by Cairns Taxis Limited",
  ACCOUNT_BOOKING:
    "Payment has been made by Cairns Taxis Limited for 4120 Stephan Grimwood",
  INVOICE:
    "Invoice ",
};