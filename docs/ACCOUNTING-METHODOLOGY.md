# Shift Mate — Accounting Methodology

**Project:** Shift Mate  
**Component:** Google Sheets Ledger / Finance Records  
**Document Type:** Accounting & Reconciliation Methodology  
**Status:** ✅ Current  
**Last Updated:** 18 August 2026  

---

## Purpose

This document explains how Shift Mate converts individual taxi shift reports into the monthly Google Sheets business ledger.

It is intended to provide a clear record of:

- how shift income is calculated;
- how cash, settlement and account payments are represented;
- how airport Area Charges are handled;
- how multiple shifts on the same day are recorded;
- how cloud backup and monthly ledger sync differ;
- how historical records are reconstructed from source documents.

This document describes the **Shift Mate record-keeping and reconciliation method**.

It is **not intended to represent an ATO rule or accounting standard**.

---

## Core Principles

- Individual taxi shifts remain separate Shift Mate reports.
- Each shift retains its original operational figures for reconciliation and audit purposes.
- Google Sheets stores one consolidated business-income row per calendar date.
- Multiple shifts on the same date are combined when exported to the monthly ledger.
- Re-syncing a date recalculates the full daily total rather than adding to an existing total.
- Cloud backup and monthly ledger sync are separate processes.
- Raw operational values are retained in Shift Mate even when the Google Sheets ledger uses adjusted figures.

---

# 1. Shift Mate Report Data

Each individual Shift Mate report may contain:

- Shift Date
- Shift Start
- Shift End
- Cash Taken
- Account Bookings
- EFTPOS Printout Total
- Meter Total
- Area Charge
- Quotes
- Evasions / Meter Errors
- Owner Dockets
- Fuel Cash
- Shift Total
- Owner 50%
- Shift Levy
- Owner Amount
- Settlement
- Driver Share
- Owner Share
- Notes
- Cloud Backup Status
- Monthly Ledger Sync Status

Each saved report receives its own unique report ID.

This means that two or more shifts can be recorded on the same calendar date without replacing each other.

---

# 2. Shift Calculation

The current Shift Mate calculation is:

```text
Shift Total
= Meter Total
- Area Charge
+ Quotes
- Evasions / Meter Errors
```

The shift is then split between driver and owner/operator.

```text
Owner 50%
= Shift Total ÷ 2
```

The shift levy is applied to the owner side.

```text
Driver Share
= Owner 50% - Shift Levy

Owner Share
= Owner 50% + Shift Levy
```

The settlement figure is then calculated from the owner amount and shift deductions/payments.

---

# 3. Reconciliation Check

Shift Mate uses the following reconciliation check:

```text
Cash Taken
+ Account Bookings
+ Settlement Paid to Driver
- Area Charge
= Driver Share
```

This reconciliation is used to confirm that the operational figures for the shift resolve back to the driver's share.

---

# 4. Google Sheets Monthly Ledger

The monthly ledger currently uses the following columns:

| Column | Description |
|---|---|
| Date | Calendar date of the shift |
| Cash | Net cash contribution after Area Charge adjustment |
| Settlement | Amount paid by Cairns Taxis to the driver, or paid by the driver to Cairns Taxis |
| Account Payment | Account booking income |
| Total Income | Total driver business income for the date |
| Notes | Export / aggregation information |
| Status | Ledger review/status field |

---

# 5. Cash Column Methodology

The Google Sheets **Cash** column does not represent the full physical cash handled during the shift.

It is calculated as:

```text
Cash
= Cash Taken
- Area Charge
```

### Example

If the driver physically takes:

```text
Cash Taken:   $96.10
Area Charge:  $12.00
```

the Google Sheets Cash value is:

```text
$96.10 - $12.00 = $84.10
```

Therefore, the monthly ledger may show:

```text
Cash: $84.10
```

even though the original Shift Mate report records:

```text
Cash Taken: $96.10
```

### Negative Cash Values

A negative Cash value can occur when the Area Charge is greater than the physical cash taken.

Example:

```text
Cash Taken:   $0.00
Area Charge:  $5.00

Ledger Cash: -$5.00
```

This does **not** mean that negative physical cash was collected.

It represents the effect of the Area Charge within the Shift Mate reconciliation method.

The original Cash Taken and Area Charge values remain available in the underlying Shift Mate report.

---

# 6. Area Charges

Area Charges are required for the shift calculation and reconciliation.

They remain recorded in the individual Shift Mate report.

They are **not recorded as a separate expense line in the monthly business ledger**.

Instead, the Area Charge adjustment is reflected through the ledger Cash calculation:

```text
Cash
= Cash Taken
- Area Charge
```

This avoids recording the Area Charge as a separate business expense while still preserving the correct reconciled income figure.

---

# 7. Settlement

Settlement may be either positive or negative.

## Cairns Taxis Pays the Driver

When the settlement is payable to the driver:

```text
Shift Mate Payable: -$118.00
Ledger Settlement: +$118.00
```

## Driver Pays Cairns Taxis

When money is payable into the envelope:

```text
Shift Mate Payable: +$25.00
Ledger Settlement: -$25.00
```

Therefore:

```text
Ledger Settlement
= - Shift Mate Payable
```

This allows both settlement directions to be represented in the same ledger column.

---

# 8. Account Bookings

Account bookings are recorded separately from Cash and Settlement.

```text
Ledger Account Payment
= Shift Mate Account Bookings
```

If no account bookings occurred:

```text
Account Payment = $0.00
```

---

# 9. Total Income

The Google Sheets daily income figure is calculated as:

```text
Total Income
= Cash
+ Settlement
+ Account Payment
```

Because the Cash column already includes the Area Charge adjustment, the resulting Total Income should resolve to the driver's reconciled business income for the shift/day.

---

# 10. Multiple Shifts on the Same Day

Shift Mate supports multiple individual reports with the same Shift Date.

This is required where, for example:

- the driver operates more than one vehicle on the same day;
- separate shift envelopes are required;
- separate operational records are needed.

## Shift Mate

Each shift remains a separate report.

Example:

```text
15/08/2026 — Shift 1
15/08/2026 — Shift 2
```

Both retain their own:

- shift times;
- meter totals;
- cash;
- EFTPOS;
- Area Charges;
- settlements;
- reconciliation figures;
- cloud backups.

## Google Sheets

The monthly ledger remains intentionally tidy with **one row per calendar date**.

When multiple Shift Mate reports share the same Shift Date, Shift Mate combines them before writing the ledger row.

Example:

```text
Shift 1 Cash:        $90.00
Shift 2 Cash:        $45.00
Daily Cash:         $135.00

Shift 1 Settlement: -$25.00
Shift 2 Settlement: +$40.00
Daily Settlement:   +$15.00

Shift 1 Account:     $20.00
Shift 2 Account:      $0.00
Daily Account:       $20.00

Daily Total Income: $170.00
```

The Notes column identifies the aggregation:

```text
CTL Export • 2 shifts
```

---

# 11. Re-Sync Behaviour

Monthly ledger export is designed to rewrite the complete row for the selected date.

It does **not** blindly add a second export to the existing ledger value.

This prevents duplicate income when the same shift/day is synced more than once.

For multiple shifts:

```text
All Shift Mate reports for the date
→ Recalculate combined daily totals
→ Rewrite the existing daily ledger row
```

This allows a corrected shift to be re-synced without double-counting the other shifts on that date.

---

# 12. Cloud Backup

Cloud backup is separate from monthly ledger sync.

## Save Report

When a Shift Mate report is saved:

```text
Save Report
→ Save locally
→ Send complete report to Google cloud backup
```

A successful backup is shown as:

```text
Cloud Backup — Backed Up
```

## Monthly Ledger

Monthly ledger export remains a separate action:

```text
Export to Google Sheets
```

A successfully exported report is shown as:

```text
Monthly Ledger — Synced
```

A report may therefore be:

```text
Cloud Backup — Backed Up
Monthly Ledger — Pending Sync
```

without indicating an error.

---

# 13. Restore Reports

Restore compares locally stored Shift Mate reports with the cloud backup.

If a cloud report is genuinely missing from the device, it can be restored.

## Deliberate Deletion

Deleting a report now removes:

1. the cloud backup; then
2. the local report.

Cloud deletion occurs first.

If cloud deletion fails, the local report is retained.

This prevents deliberately deleted reports from immediately appearing again as Restore candidates.

---

# 14. Google Authentication

Shift Mate uses Google OAuth for Google Sheets and Finance Agent access.

Local development uses the saved refresh token located in:

```text
secrets/gmail-refresh-token.json
```

The production Vercel deployment uses its own environment variable:

```text
GOOGLE_OAUTH_REFRESH_TOKEN
```

These are separate.

## `invalid_grant`

If Google returns:

```text
invalid_grant
```

the saved OAuth refresh token is no longer valid.

The current recovery process is:

```text
1. Re-authorise Google locally.
2. Generate and save a new refresh token.
3. Update GOOGLE_OAUTH_REFRESH_TOKEN in Vercel.
4. Redeploy the Production deployment.
5. Verify /api/finance/backup returns success.
6. Test a phone Save Report and confirm Cloud Backup — Backed Up.
```

---

# 15. Historical Record Reconstruction

Historical Shift Mate reports may be rebuilt using available source records.

Current source types include:

## Tablet Earnings History

Useful tablet fields include:

- Cash
- ePayment
- Account
- Area Charge
- Daily Total
- Job Count
- Worked Hours

Where multiple tablet photographs overlap, duplicates should be removed.

When an earlier photograph contains a partial day and a later photograph contains the completed day, the later/final value takes precedence.

## EFTPOS / End-of-Shift Printouts

EFTPOS or end-of-shift printouts are used to provide or verify figures that may not be reliably represented by the tablet history.

These are particularly important for:

- EFTPOS Printout Total;
- settlement reconciliation;
- TSS/subsidy split-payment investigation;
- identifying differences between tablet and payment-terminal records.

## Data Entry Principle

Historical figures should not be guessed.

Where a value cannot be supported by the available tablet history, EFTPOS printout or another source document, it should be flagged for review.

---

# 16. Known Payment-System Behaviour

The tablet and EFTPOS terminal do not always represent payment information in the same way.

Known areas requiring care include:

- TSS/subsidy split payments;
- cash components processed during an EFTPOS/TSS transaction;
- EFTPOS totals that may include payment components not shown as tablet Cash;
- tablet Cash values that do not necessarily represent every physical cash movement.

For this reason:

```text
Tablet data
≠ automatically assumed to equal
EFTPOS printout data
```

The underlying source documents should be retained wherever possible.

---

# 17. Audit / Review Note

For accounting, tax or audit review:

- the monthly Google Sheets ledger is the summarised business record;
- individual Shift Mate reports retain the operational detail;
- cloud backups provide recovery copies of Shift Mate reports;
- tablet and EFTPOS source records support historical verification;
- the Cash column is an adjusted reconciliation value, not necessarily the physical cash handled;
- Area Charges remain visible in Shift Mate even though they are not shown as a separate monthly-ledger expense.

Any accountant or reviewer should refer to this document when interpreting the monthly ledger.

---

# 18. Current Implementation References

Relevant project files include:

```text
agents/001-finance/mapper.ts
agents/001-finance/mapper.test.ts
agents/001-finance/worksheet.ts
agents/001-finance/sheets.ts

app/api/finance/backup/route.ts
app/api/finance/export/google-sheets/route.ts

app/calculator/page.tsx
app/reports/page.tsx

lib/restore.ts
```

---

# Current Status

- [x] Individual Shift Mate reports supported
- [x] Multiple shifts per calendar date supported
- [x] Daily Google Sheets aggregation supported
- [x] Pay Into Envelope represented as negative Settlement
- [x] Cloud backup on Save Report
- [x] Restore Reports
- [x] Deliberate deletion removes cloud backup
- [x] Monthly ledger sync separated from cloud backup
- [x] Historical tablet records being reconstructed
- [ ] Add short Cash / Area Charge explanation to each monthly sheet
- [ ] Add concise methodology summary to the workbook Documentation sheet
- [ ] Complete historical EFTPOS / EOS reconciliation
- [ ] Review historical TSS split-payment records

---

## Related Documents

- Shift Mate project README
- Finance Agent roadmap
- Taxi Business Records 2026–2027
- Shift Mate historical reconstruction records

