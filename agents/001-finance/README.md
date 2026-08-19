# Agent 001 – Cairns Taxis Finance

## Purpose

Agent 001 reconciles Shift Mate financial records with official Cairns Taxis financial documents.

It compares financial information recorded through Shift Mate against official records received by email and helps ensure the Taxi Business Records workbook remains accurate.

Agent 001 follows a verification-first approach:

- Never guess.
- Always verify.
- Exact matches may be verified automatically.
- Uncertain or conflicting records require review.
- Manual verification remains available when automatic verification is not appropriate.

---

# Version

**Current Version:** 0.0.3 (Development)

**Status:** Remittance Reconciliation and Verification in Development

---

# Responsibilities

- Authenticate with Google Gmail.
- Search for Cairns Taxis financial emails.
- Identify:
  - Remittances
  - Account Bookings
  - Invoices
- Download and read PDF attachments.
- Extract financial information.
- Validate document totals and references.
- Connect to Taxi Business Records in Google Sheets.
- Read monthly ledger records.
- Compare validated financial records against ledger entries.
- Automatically verify exact CTL remittance matches.
- Leave uncertain or conflicting records unchanged.
- Support protected manual verification.
- Maintain a verification audit trail.

---

# Design Philosophy

- Keep the workbook simple.
- The agent performs the analysis.
- Never guess.
- Always verify.
- If uncertain, flag for review.
- Do not silently change financial records.
- Preserve an audit trail for verification actions.
- Every feature is tested before implementation continues.

---

# Development Principles

- One feature at a time.
- One test at a time.
- One result before continuing.
- Documentation kept up to date.
- Small, maintainable modules.
- No unnecessary complexity.
- Existing working behaviour is preserved unless intentionally changed.

---

# Current Progress

## Phase 1 – Authentication ✅ Complete

- [x] Google Cloud project configured.
- [x] Gmail API enabled.
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

---

## Phase 2 – Gmail Connectivity ✅ Complete

- [x] Connect to the Gmail API.
- [x] List recent emails.
- [x] Retrieve an email by message ID.
- [x] Extract email headers.
- [x] Search Gmail using configurable search queries.
- [x] Locate Cairns Taxis financial emails.
- [x] Extract sender information.
- [x] Record attachment metadata.

---

## Phase 3 – Email Classification ✅ Complete

- [x] Classify remittance emails.
- [x] Classify account booking emails.
- [x] Classify invoice emails.
- [x] Reject matching subjects from unrecognised senders.
- [x] Capture payment amounts from email subjects.
- [x] Capture customer and payment references.
- [x] Identify financial records associated with payments.

---

## Phase 4 – Document Processing ✅ Complete

- [x] Download PDF attachments.
- [x] Store downloaded documents locally.
- [x] Prevent identical PDF filenames from overwriting each other.
- [x] Exclude downloaded financial documents from Git.
- [x] Extract text from PDF attachments.
- [x] Parse remittance payment lines.
- [x] Extract remittance payment dates.
- [x] Extract remittance PDF totals.
- [x] Validate remittance invoice dates against reference numbers.
- [x] Extract account booking references.
- [x] Extract account booking payment dates and totals.
- [x] Extract invoice numbers.
- [x] Extract invoice dates.
- [x] Extract invoice due dates.
- [x] Extract invoice references.
- [x] Extract invoice amounts due.
- [x] Extract invoice totals.
- [x] Validate document totals.
- [x] Mark valid documents as `VALID`.
- [x] Mark incomplete or inconsistent documents as `REVIEW_REQUIRED`.

---

## Phase 5 – Google Sheets Integration ✅ Complete

- [x] Connect to Google Sheets.
- [x] Confirm access to Taxi Business Records.
- [x] Read monthly ledger records.
- [x] Read existing ledger verification status.
- [x] Update ledger status without modifying unrelated cells.
- [x] Read the Finance Agent Log.
- [x] Write verification audit records.
- [x] Record verification method as `AUTOMATIC` or `MANUAL`.

---

## Phase 6 – Remittance Reconciliation 🚧 Current Milestone

- [x] Compare validated remittance payment lines with monthly ledger records.
- [x] Match records using ledger date and remittance reference information.
- [x] Compare remittance amount against ledger Settlement.
- [x] Detect exact settlement matches.
- [x] Leave non-matching ledger rows unchanged.
- [x] Automatically change `Pending` to `Verified` for exact matches.
- [x] Prevent already verified rows from being automatically verified again.
- [x] Record automatic verification in the Finance Agent Log.
- [x] Provide a protected manual verification path.
- [x] Prevent manual verification of rows that are not `Pending`.
- [ ] Complete manual verification of real mixed-payment cases.
- [ ] Reconcile account booking payments.
- [ ] Reconcile invoice records.
- [ ] Flag missing financial transactions.
- [ ] Flag duplicate financial transactions.
- [ ] Produce broader reconciliation reports.

---

# Remittance Verification

Automatic remittance verification is currently restricted to validated CTL remittance records.

A remittance must first pass its own internal validation before it can be compared with the ledger.

For a remittance to be considered valid:

- The email subject amount must agree with the PDF total.
- The individual payment-line totals must agree with the remittance total.
- Required payment information must be present.
- The remittance reference must agree with the invoice date.

A valid remittance payment line can then be compared with the monthly ledger.

An automatic verification occurs only when:

1. A corresponding ledger row is found.
2. The remittance reference agrees with the ledger date.
3. The remittance amount exactly matches the ledger Settlement value.
4. The current ledger status is `Pending`.

When all conditions are satisfied:

`Pending → Verified`

A verification record is also written to the Finance Agent Log.

If the amounts do not match, Agent 001 makes no change.

---

# Manual Verification

Some legitimate transactions cannot be verified automatically.

Examples include:

- Mixed CTL/operator payments.
- Payments involving information not available to Agent 001.
- Transactions requiring supporting documents or driver confirmation.

These records remain `Pending` until they have been manually investigated.

The manual verification path:

- Requires an explicit manual action.
- Checks the current ledger status first.
- Only permits verification when the row is `Pending`.
- Changes the ledger status to `Verified`.
- Records the verification method as `MANUAL`.
- Records the verification source in the Finance Agent Log.

Agent 001 does not infer manual evidence.

---

# Finance Agent Log

Verification activity is recorded in the `Finance Agent Log` worksheet.

Current columns:

`Ledger Date | Method | Verified At | Source`

Verification methods:

- `AUTOMATIC`
- `MANUAL`

The audit log provides a record of how a ledger entry reached `Verified` status.

---

# Supported Financial Documents

## Remittances

The Finance Agent can currently extract:

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

---

## Account Bookings

The Finance Agent can currently extract:

- Sender details.
- Email date.
- Payment amount from the email subject.
- PDF payment date.
- PDF total.
- Account Booking reference.

The subject total and PDF total are compared before the record is marked as valid.

Account Booking extraction and validation are implemented.

Automatic ledger reconciliation for Account Bookings has not yet been implemented.

---

## Invoices

The Finance Agent can currently extract:

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

Automatic invoice reconciliation has not yet been implemented.

---

# Validation States

Financial documents receive one of two validation states:

## `VALID`

The required information was found and all relevant validation checks passed.

A `VALID` document is eligible for further reconciliation.

`VALID` does not automatically mean that a ledger entry will be changed.

## `REVIEW_REQUIRED`

Information is missing, incomplete or inconsistent.

Records marked `REVIEW_REQUIRED` are excluded from automatic ledger verification.

The Finance Agent never invents missing information or silently accepts conflicting values.

---

# Ledger Status

Monthly ledger records currently use:

- `Pending`
- `Verified`
- `Review Required`

`Verified` means the financial record has been satisfactorily verified.

The Finance Agent Log records whether that verification was:

- Automatic
- Manual

---

# Current Development Limitations

- Automatic reconciliation currently applies to CTL remittances only.
- Account Booking reconciliation is not yet implemented.
- Invoice reconciliation is not yet implemented.
- The reconciliation service currently targets the August ledger during development.
- Gmail processing currently uses a limited recent-message search during development.
- Manual verification currently uses the Finance Agent command-line interface.

These are development limitations rather than intended final product behaviour.

---

# Current Test Status

```text
Test Files  8 passed
Tests       79 passed
```
