# Agent 001 – Cairns Taxis Finance

## Purpose

Agent 001 reconciles Shift Mate financial records with official Cairns Taxis financial documents.

It compares financial information recorded through Shift Mate against official records received by email and helps keep the Taxi Business Records workbook accurate, traceable and reviewable.

Agent 001 follows a verification-first approach:

- Never guess.
- Always verify.
- Exact matches may be verified automatically.
- A one-cent settlement difference may be accepted as a defined rounding tolerance.
- Uncertain or conflicting records remain unresolved for review.
- Manual verification is used for legitimate real-world exceptions that cannot be safely automated.
- Financial figures are never changed merely to force reconciliation.
- Verification actions are preserved in an audit trail.

---

# Version

**Current Version:** 0.0.3 (Development)  
**Status:** Core Settlement and Account Booking Reconciliation Complete  
**Current Test Baseline:** 97 tests across 10 test files  
**Next Development Area:** Invoice and Expense Reconciliation

---

# Responsibilities

Agent 001 currently:

- Authenticates with Gmail and Google Sheets.
- Searches for Cairns Taxis financial emails.
- Identifies:
  - Remittances
  - Account Bookings
  - Invoices
- Downloads and reads PDF attachments.
- Extracts structured financial information.
- Validates document totals, dates and references.
- Reads the Taxi Business Records workbook.
- Reads all monthly worksheets across the July–June financial year.
- Compares validated financial records against ledger entries.
- Automatically verifies eligible CTL remittance matches.
- Automatically accepts defined one-cent settlement rounding differences.
- Reconciles Account Booking payments separately from CTL settlements.
- Requires all relevant components to be confirmed before a row can be automatically verified.
- Leaves uncertain or conflicting records unchanged.
- Supports protected manual verification.
- Supports safe historical manual-audit backfill.
- Maintains a verification audit trail in the `Finance Agent Log`.

---

# Design Philosophy

- Keep the workbook simple.
- Let the agent perform the analysis.
- Never guess.
- Always verify.
- If uncertain, leave the record unresolved for review.
- Do not silently change financial records.
- Preserve an audit trail for verification actions.
- Automate routine, repeatable differences.
- Surface exceptional operational differences for human investigation.
- Preserve supporting records when manual judgement is required.
- Keep Shift Mate as the operational source for individual shift reports.
- Keep the monthly ledger as the accounting summary.
- Keep the Finance Agent Log as the verification audit trail.

---

# Development Principles

- One feature at a time.
- One test at a time.
- One result before continuing.
- Documentation kept up to date.
- Small, maintainable modules.
- No unnecessary complexity.
- Existing working behaviour is preserved unless intentionally changed.
- New behaviour is tested before it is used against live financial records.
- Prefer explicit evidence over inferred behaviour.

---

# System Relationship

Agent 001 is one part of the broader Shift Mate system.

## Shift Mate

Shift Mate records the operational details of each taxi shift and preserves the original report data.

Each report has its own Report ID and audit history.

Multiple separate reports may exist for the same calendar date.

## Taxi Business Records

The Google Sheets workbook provides the accounting summary.

Each monthly worksheet contains one row per calendar date.

When multiple Shift Mate reports share the same date, their ledger values are aggregated into the single daily row.

Current ledger structure:

`Date | Cash | Settlement | Account Payment | Total Income | Notes | Status`

### Cash

`Cash = Cash Taken - Area Charge`

This means Cash may differ from the physical cash handled during the shift and may occasionally be negative when Area Charges exceed Cash Taken.

The original Cash Taken and Area Charge values remain preserved in the underlying Shift Mate report.

### Total Income

`Total Income = Cash + Settlement + Account Payment`

## Finance Agent Log

The `Finance Agent Log` records how ledger rows reached `Verified` status.

Current columns:

`Ledger Date | Method | Verified At | Source`

Verification methods:

- `AUTOMATIC`
- `MANUAL`

---

# Current Progress

## Phase 1 – Authentication ✅ Complete

- [x] Google Cloud project configured.
- [x] Gmail API enabled.
- [x] Google Sheets API enabled.
- [x] OAuth credentials created.
- [x] Load OAuth credentials.
- [x] Create OAuth client.
- [x] Generate authorisation URL.
- [x] Complete first Google sign-in.
- [x] Capture authorisation code.
- [x] Exchange authorisation code for OAuth tokens.
- [x] Store refresh token securely.
- [x] Load stored refresh token.
- [x] Authenticate using the stored refresh token.
- [x] Load Google Sheets configuration.
- [x] Confirm local re-authorisation and refresh-token recovery.
- [x] Confirm protected production credentials through Vercel environment variables.

---

## Phase 2 – Gmail Connectivity ✅ Complete

- [x] Connect to the Gmail API.
- [x] Retrieve emails by message ID.
- [x] Extract email headers.
- [x] Search Gmail using configurable queries.
- [x] Locate Cairns Taxis financial emails.
- [x] Extract sender information.
- [x] Record attachment metadata.
- [x] Download attachments.
- [x] Prevent identical attachment filenames from overwriting each other.
- [x] Add Gmail pagination.
- [x] Filter current Finance Agent searches to the active financial year.
- [x] Apply financial-year filtering to Remittance and Account Booking searches.

---

## Phase 3 – Email Classification ✅ Complete

- [x] Classify Remittance emails.
- [x] Classify Account Booking emails.
- [x] Classify Invoice emails.
- [x] Reject matching subjects from unrecognised senders.
- [x] Capture payment amounts from email subjects.
- [x] Capture customer and payment references.
- [x] Identify financial records associated with payments.
- [x] Exclude malformed or inconsistent documents from automatic reconciliation.

---

## Phase 4 – Document Processing ✅ Complete

- [x] Download PDF attachments.
- [x] Store downloaded documents locally.
- [x] Prevent identical PDF filenames from overwriting each other.
- [x] Exclude downloaded financial documents from Git.
- [x] Extract text from PDF attachments.
- [x] Parse Remittance payment lines.
- [x] Extract Remittance payment dates.
- [x] Extract Remittance PDF totals.
- [x] Validate Remittance invoice dates against reference numbers.
- [x] Extract Account Booking references.
- [x] Extract Account Booking payment dates and totals.
- [x] Extract Invoice numbers.
- [x] Extract Invoice dates.
- [x] Extract Invoice due dates.
- [x] Extract Invoice references.
- [x] Extract Invoice amounts due.
- [x] Extract Invoice totals.
- [x] Validate document totals.
- [x] Mark valid documents as `VALID`.
- [x] Mark incomplete or inconsistent documents as `REVIEW_REQUIRED`.

---

## Phase 5 – Google Sheets Integration ✅ Complete

- [x] Connect to Google Sheets.
- [x] Confirm access to Taxi Business Records.
- [x] Read monthly ledger records.
- [x] Read the complete July–June financial-year ledger.
- [x] Read existing ledger verification status.
- [x] Update only required ledger cells.
- [x] Append ledger Notes without overwriting existing Notes.
- [x] Prevent duplicate Note text.
- [x] Read the Finance Agent Log.
- [x] Write verification audit records.
- [x] Record verification method as `AUTOMATIC` or `MANUAL`.

---

## Phase 6 – Reconciliation ✅ Complete

### CTL Remittance Reconciliation

- [x] Compare validated Remittance payment lines with ledger records.
- [x] Match records using ledger date and Remittance reference information.
- [x] Route Remittance references to the correct financial-year worksheet.
- [x] Compare official Remittance amounts against ledger Settlement.
- [x] Detect exact settlement matches.
- [x] Detect one-cent rounding differences.
- [x] Leave larger non-matching differences unchanged.
- [x] Automatically change `Pending` to `Verified` for eligible matches.
- [x] Prevent already-Verified rows from being automatically verified again.
- [x] Record automatic verification in the Finance Agent Log.
- [x] Confirm repeat processing is idempotent.

### Account Booking Reconciliation

- [x] Process validated Account Booking payments separately.
- [x] Search the complete July–June financial year.
- [x] Treat the Shift Mate report date as the authoritative work date.
- [x] Treat invoice and payment dates as payment-processing evidence.
- [x] Compare the official payment with the ledger `Account Payment`.
- [x] Use the seven-digit booking reference as supporting evidence.
- [x] Add confirmed Account Booking details to ledger Notes.
- [x] Reject ambiguous matches instead of guessing.
- [x] Prevent already-resolved rows from being reused.
- [x] Require CTL Settlement evidence as well when the same row contains Settlement income.
- [x] Confirm live reconciliation of July and August Account Booking payments.
- [x] Confirm repeat processing is idempotent.

### Manual Verification

- [x] Provide a protected manual verification path.
- [x] Require an explicit manual action.
- [x] Check the current ledger Status before manual verification.
- [x] Permit normal manual verification only when the row is `Pending`.
- [x] Append the supplied explanation to ledger Notes.
- [x] Change `Pending` to `Verified`.
- [x] Record a `MANUAL` verification audit entry.
- [x] Preserve the supplied verification source.
- [x] Leave already-Verified rows completely unchanged.
- [x] Add mocked Google Sheets tests for the complete manual workflow.

### Historical Manual Audit Backfill

- [x] Add a safe audit-only backfill method.
- [x] Require the historical ledger row to already be `Verified`.
- [x] Leave Notes unchanged.
- [x] Leave Status unchanged.
- [x] Leave financial figures unchanged.
- [x] Check the Finance Agent Log before writing.
- [x] Prevent duplicate MANUAL audit records.
- [x] Backfill 06/07.
- [x] Backfill 13/07.
- [x] Backfill 14/08.
- [x] Backfill 15/08.
- [x] Confirm all four entries exist exactly once.

---

# Remittance Verification

Automatic Remittance verification is restricted to validated CTL Remittance records.

A Remittance must first pass its own internal validation before it can be compared with the ledger.

For a Remittance to be considered valid:

- The email subject amount must agree with the PDF total.
- The individual payment-line totals must agree with the Remittance total.
- Required payment information must be present.
- The Remittance reference must agree with the invoice date.

A valid payment line is then routed to the appropriate July–June financial-year worksheet and compared with the daily ledger row.

---

# Settlement Matching Rules

Settlement values are compared in integer cents.

## Exact Match

If:

`Difference = 0.00`

the result is:

`EXACT`

and the row may be automatically verified if all other verification conditions pass.

## One-Cent Rounding Tolerance

If:

`Difference = 0.01`

the result is:

`ROUNDING_TOLERANCE`

and the row may also be automatically verified.

The ledger financial figures are not changed.

The audit source records:

`(ROUNDING_TOLERANCE)`

This rule has been live-confirmed for:

- 31/07
- 02/08

## Larger Difference

If:

`Difference > 0.01`

the result remains unresolved.

Agent 001 leaves the row unchanged for investigation.

---

# Automatic Verification Rules

A ledger row with no Account Payment may be automatically verified when:

1. A corresponding CTL Remittance line is found.
2. The Remittance reference agrees with the ledger date.
3. Settlement is either:
   - an exact match, or
   - within the accepted one-cent rounding tolerance.
4. The current ledger Status is `Pending`.

When all conditions pass:

`Pending → Verified`

A corresponding `AUTOMATIC` record is written to the Finance Agent Log.

---

# Account Booking Verification

Account Booking payments are processed independently from CTL Settlement.

The Shift Mate report date is treated as the authoritative work date.

The Account Booking invoice date and payment date are treated as payment-processing evidence and may occur after the actual shift.

Agent 001:

- Searches the complete financial year.
- Matches the official payment amount against ledger `Account Payment`.
- Uses the seven-digit booking reference as supporting evidence.
- Adds the confirmed booking reference and payment date to ledger Notes.
- Rejects ambiguous matches rather than selecting one arbitrarily.

Example confirmed records include:

- Ref `8091343` for the July Account Booking payment.
- Ref `8176745` for the August Account Booking payment.

---

# All-Components Verification Rule

A confirmed Account Booking payment does not automatically verify the whole shift.

## No Account Payment

If the row contains no Account Payment:

- Confirmed CTL Settlement may verify the row.

## Account Payment Present

If the row contains Account Payment:

- Account Booking payment must be confirmed.
- CTL Settlement must also be confirmed.

Only when the required components are satisfactorily verified can the row change to `Verified`.

Otherwise it remains `Pending`.

---

# Manual Verification

Some legitimate real-world transactions cannot be safely verified by a general automatic rule.

Examples include:

- EFTPOS terminal failures.
- TSS/EFTPOS operational errors.
- Mixed shifts involving more than one vehicle or operator.
- Split Remittances.
- Transactions requiring supporting owner reports, invoices or driver confirmation.

These records remain unresolved until investigated.

The normal manual verification path:

- Requires an explicit manual action.
- Checks the current ledger Status first.
- Only permits verification when the row is `Pending`.
- Appends the supplied explanation to ledger Notes.
- Changes the ledger Status to `Verified`.
- Records the verification method as `MANUAL`.
- Records the verification source in the Finance Agent Log.

Agent 001 does not infer manual evidence.

---

# Exceptional Operational Differences

Routine differences should be automated only when the rule is repeatable and evidence-based.

Rare operational anomalies should not generate increasingly complicated automatic rules.

The working principle is:

> Routine differences are automated. Exceptional differences are surfaced for human investigation.

Supporting evidence may include:

- Official Cairns Taxis documents.
- Invoices.
- EFTPOS records.
- Owner shift reports.
- Payment records.
- Driver diary notes.
- Other contemporaneous operational records.

Once the evidence is sufficient, the record may be manually verified and explained.

---

# Resolved Historical Manual Cases

The following historical exceptions were investigated, explained and manually verified:

## 06/07

EFTPOS terminal failure caused the driver report and CTL Remittance not to reconcile.

A historical `MANUAL` audit record has been added.

## 13/07

A TSS/EFTPOS error resulted in Cairns Taxis invoice `INV-14272` for AUD 3.50.

The invoice was subsequently paid.

A historical `MANUAL` audit record has been added.

## 14/08

The shift was split across CTL and Taxi 99.

The Taxi 99 owner shift report and separate payment were reviewed, while the CTL portion was settled separately.

A historical `MANUAL` audit record has been added.

## 15/08

The shift was split across CTL and Taxi 99.

The Taxi 99 owner shift report and separate payment were reviewed, while the CTL portion was settled separately.

Account Booking ref `8176745` was also confirmed paid on 17 Aug 2026.

A historical `MANUAL` audit record has been added.

---

# Historical Manual Audit Backfill

Some rows were manually marked `Verified` directly in Google Sheets before the protected manual-verification workflow existed.

Agent 001 therefore includes a safe historical backfill method.

The backfill:

- Requires the row to already be `Verified`.
- Does not modify Notes.
- Does not modify Status.
- Does not modify any financial figures.
- Checks the Finance Agent Log before writing.
- Does not create a duplicate `MANUAL` record.

This mechanism was used to complete the audit trail for 06/07, 13/07, 14/08 and 15/08.

---

# Finance Agent Log

Verification activity is recorded in the `Finance Agent Log` worksheet.

Current columns:

`Ledger Date | Method | Verified At | Source`

Verification methods:

- `AUTOMATIC`
- `MANUAL`

Automatic source records normally preserve the Gmail message ID.

One-cent settlement matches also include:

`(ROUNDING_TOLERANCE)`

Manual records preserve the supplied investigation or verification source.

The audit log provides a traceable record of how a ledger entry reached `Verified` status.

---

# Supported Financial Documents

## Remittances

Agent 001 can currently extract:

- Sender details.
- Email date.
- Payment amount from the email subject.
- Customer payment reference.
- PDF payment date.
- Individual payment lines.
- Invoice dates.
- Shift references.
- Invoice totals.
- Amounts paid.
- Remaining amounts.
- PDF total paid.

The subject total, PDF total and payment-line total are compared before the record is marked as valid.

The invoice date and payment reference are also checked for consistency.

Validated CTL Remittances are currently eligible for automatic ledger reconciliation.

---

## Account Bookings

Agent 001 can currently extract:

- Sender details.
- Email date.
- Payment amount from the email subject.
- PDF payment date.
- PDF total.
- Seven-digit Account Booking reference.

The subject total and PDF total are compared before the record is marked as valid.

Account Booking extraction, validation and financial-year ledger reconciliation are implemented.

Confirmed Account Booking evidence is written to ledger Notes and contributes to the all-components verification rule.

---

## Invoices

Agent 001 can currently extract:

- Sender details.
- Email date.
- Invoice number.
- Invoice date.
- Due date.
- Invoice reference.
- Amount due.
- Invoice total.
- Attachment metadata.

The amount due and invoice total are compared before the record is marked as valid.

Invoice extraction and validation are implemented.

Invoice and Expense reconciliation are the next major development area.

---

# Validation States

Financial documents receive one of two validation states.

## `VALID`

The required information was found and all relevant document-validation checks passed.

A `VALID` document is eligible for further reconciliation.

`VALID` does not automatically mean that a ledger entry will be changed.

## `REVIEW_REQUIRED`

Information is missing, incomplete or inconsistent.

Records marked `REVIEW_REQUIRED` are excluded from automatic ledger verification.

Agent 001 never invents missing information or silently accepts conflicting values.

---

# Ledger Status

Monthly ledger records use:

- `Pending`
- `Verified`
- `Review Required`

`Verified` means the financial record has been satisfactorily verified.

The Finance Agent Log records whether that verification was:

- Automatic
- Manual

A row may be verified automatically only when all relevant required evidence has been confirmed.

---

# Financial-Year Routing

Agent 001 currently reads the full July–June financial year.

Remittance references are routed according to their date:

- July–December → financial-year start year
- January–June → following calendar year

References outside the selected financial year are rejected rather than forced into a worksheet.

The current development implementation still uses financial-year start year `2026` in the service layer.

Future work will make this dynamic so annual rollover does not require a code change.

---

# Current Development Limitations

Core CTL Settlement and Account Booking reconciliation are complete, but the project remains in development.

Current known limitations include:

- Invoice reconciliation is not yet implemented.
- The Expense workflow is not yet implemented.
- The active financial-year start year is currently fixed to `2026` in development code.
- The final user-facing manual-review interface has not yet been built; the protected development CLI remains available.
- Audit-log and ledger updates are separate writes and should later receive additional recovery/atomicity hardening.
- Full financial-year workbook rollover is not yet automatic.
- Report editing is not yet a supported end-user workflow.
- Remaining legacy `Driver Companion` / `DC` naming should continue to be replaced with `Shift Mate` where compatibility allows.

These are development limitations rather than intended final product behaviour.

---

# Next Development Area

## Invoice and Expense Reconciliation

The next milestone will focus on validated Cairns Taxis invoices and business expenses.

Planned work includes:

- Reconcile validated Invoice records.
- Preserve Invoice number, date, due date and reference.
- Preserve amount payable.
- Identify the related shift or operational event where possible.
- Track whether the Invoice was subsequently paid.
- Preserve payment evidence.
- Prevent duplicate Invoice records.
- Flag overdue or conflicting Invoices for review.
- Define the Expense ledger/workflow.
- Preserve supplier, receipt and supporting document references.
- Preserve GST-relevant information where available.
- Keep uncertain or exceptional expense records reviewable rather than guessed.

---

# Current Test Status

```text
Test Files  10 passed (10)
Tests       97 passed (97)
```

The test suite includes dedicated coverage for:

- Authentication.
- Gmail processing.
- PDF/document parsing.
- Report backup parsing and comparison.
- Worksheet routing.
- Remittance matching.
- One-cent rounding tolerance.
- Account Booking matching.
- Manual verification.
- Historical manual-audit backfill.
- Duplicate-protection and safety guards.

---

# Current Reconciliation State

The core reconciliation workflow is now operational:

```text
Shift Mate report
      ↓
Monthly Taxi Business Records ledger
      ↓
Gmail financial document
      ↓
Document validation
      ↓
Financial-year routing
      ↓
Settlement / Account Booking matching
      ↓
Automatic verification when evidence is sufficient
      OR
Human investigation when evidence is exceptional
      ↓
Verified ledger status
      ↓
Finance Agent Log audit record
```

The next major step is to extend the same verification-first architecture to Invoices and Expenses.
