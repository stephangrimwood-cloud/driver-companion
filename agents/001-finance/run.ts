import { FinanceService } from "./service";

const finance = new FinanceService();

const [
  ,
  ,
  command,
  sheetName,
  rowNumberText,
  ledgerDate,
  ...sourceParts
] = process.argv;

if (command === "verify-manual") {
  const rowNumber = Number(rowNumberText);
  const source = sourceParts.join(" ");

  if (
    !sheetName ||
    !Number.isInteger(rowNumber) ||
    !ledgerDate ||
    !source
  ) {
    console.error(`
Manual verification requires:

verify-manual <sheet> <row> <ledger-date> <source>
`);
    process.exitCode = 1;
  } else {
    void finance.verifyManually(
      sheetName,
      rowNumber,
      ledgerDate,
      source,
    );
  }
} else {
  void finance.initialise();
}