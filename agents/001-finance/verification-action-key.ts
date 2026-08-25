export function getAutomaticVerificationActionKey(
  ledgerDate: string,
  messageId: string,
): string {
  return `VERIFY|AUTOMATIC|${ledgerDate}|${messageId}`;
}

export function getManualVerificationActionKey(
  ledgerDate: string,
): string {
  return `VERIFY|MANUAL|${ledgerDate}`;
}

export function getAccountBookingEmailActionKey(
  messageId: string,
): string {
  return `EMAIL|ACCOUNT_BOOKING|${messageId}`;
}