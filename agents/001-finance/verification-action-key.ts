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