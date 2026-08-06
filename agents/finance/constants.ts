export const EMAIL_SENDERS = {
  XERO: "messaging-service@post.xero.com",
};

export const GMAIL_SEARCH_QUERIES = {
  REMITTANCES: `from:${EMAIL_SENDERS.XERO} subject:"Payment has been made by Cairns Taxis Limited"`,
  ACCOUNT_BOOKINGS: "",
  INVOICES: "",
};

export const EMAIL_SUBJECT_PREFIXES = {
  REMITTANCE: "Payment has been made by Cairns Taxis Limited",
};