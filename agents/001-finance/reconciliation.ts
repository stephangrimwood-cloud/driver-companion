export interface ReconciliationValues {
  cashTaken: number;
  accountBookings: number;
  payable: number;
  areaCharge: number;
}

export function calculateReconciliationTotal(
  values: ReconciliationValues,
): number {
  return (
    values.cashTaken +
    values.accountBookings -
    values.payable -
    values.areaCharge
  );
}

export type ReconciliationOutcome =
  | "MATCH"
  | "MISMATCH";

export function getReconciliationOutcome(
  reconciliationTotal: number,
  driverShare: number,
): ReconciliationOutcome {
  const reconciliationCents =
    Math.round(reconciliationTotal * 100);

  const driverShareCents =
    Math.round(driverShare * 100);

  return reconciliationCents === driverShareCents
    ? "MATCH"
    : "MISMATCH";
}