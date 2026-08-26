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

export function getRemittanceEmailActionKey(
  messageId: string,
): string {
  return `EMAIL|REMITTANCE|${messageId}`;
}

export function getBackupActionKey(
  reportId: string,
  backedUpAt: string,
): string {
  return `BACKUP|${reportId}|${backedUpAt}`;
}

export function getGoogleSheetsExportActionKey(
  shiftDate: string,
  exportedAt: string,
): string {
  return `EXPORT|GOOGLE_SHEETS|${shiftDate}|${exportedAt}`;
}

export function getReconciliationActionKey(
  reportId: string,
): string {
  return `RECONCILIATION|${reportId}`;
}