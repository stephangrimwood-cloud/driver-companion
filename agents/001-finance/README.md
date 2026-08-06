# Agent 001 – Cairns Taxis Finance

## Purpose

Agent 001 reconciles Driver Companion with official Cairns Taxis financial records.

It compares data recorded by the driver against official financial documents received by email and helps ensure the Taxi Business Records workbook remains accurate.

---

# Version

**Current Version:** 0.0.3 (Development)

**Status:** Email Classification and Document Processing Complete

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
- Validate document totals.
- Read Driver Companion data.
- Compare against Taxi Business Records.
- Flag discrepancies for review.
- Update records where appropriate.

---

# Design Philosophy

- Keep the workbook simple.
- The agent performs the analysis.
- Never guess.
- Always verify.
- If uncertain, flag for review.
- Every feature is tested before implementation continues.

---

# Development Principles

- One feature at a time.
- One test per feature.
- Documentation kept up to date.
- Small, maintainable modules.
- No unnecessary complexity.

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
- [x] Identify the shift or booking covered by each payment.

---

## Phase 4 – Document Processing ✅ Complete

- [x] Download PDF attachments.
- [x] Store downloaded documents locally.
- [x] Exclude downloaded financial documents from Git.
- [x] Extract text from PDF attachments.
- [x] Parse remittance payment lines.
- [x] Extract remittance payment dates.
- [x] Extract remittance PDF totals.
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

## Phase 5 – Driver Companion Integration 🚧 Current Milestone

- [x] Connect to Google Sheets.
- [x] Confirm access to Taxi Business Records.
- [ ] Read Driver Companion reports.
- [ ] Match Finance Agent records with Driver Companion reports.
- [ ] Export verified Driver Companion reports to Google Sheets.
- [ ] Record remittance reference numbers.
- [ ] Record account booking reference numbers.
- [ ] Record invoice information.
- [ ] Prevent duplicate exports.

---

## Phase 6 – Reconciliation

- [ ] Compare Gmail data with Driver Companion.
- [ ] Compare Gmail data with Taxi Business Records.
- [ ] Match transactions using dates and reference numbers.
- [ ] Flag missing transactions.
- [ ] Flag conflicting totals.
- [ ] Flag duplicate transactions.
- [ ] Produce reconciliation reports.
- [ ] Allow reviewed discrepancies to be resolved.

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

---

# Validation

Financial records receive one of two validation states:

## `VALID`

The required information was found and all relevant totals agree.

## `REVIEW_REQUIRED`

Information is missing, incomplete or inconsistent.

The Finance Agent never invents missing information or silently accepts conflicting values.

---

# Current Test Status

```text
Test Files  7 passed
Tests       74 passed