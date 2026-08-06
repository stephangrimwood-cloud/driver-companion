# Agent 001 – Cairns Taxis Finance

## Purpose

Agent 001 reconciles Driver Companion with official Cairns Taxis financial records.

It compares data recorded by the driver against official financial documents received by email and helps ensure the Taxi Business Records workbook remains accurate.

---

# Version

**Current Version:** 0.0.2 (Development)

**Status:** Gmail Connectivity Complete

---

# Responsibilities

- Authenticate with Google Gmail.
- Search for Cairns Taxis financial emails.
- Identify:
  - Remittances
  - Account Bookings
  - Invoices
- Extract financial information.
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
- [x] Locate the first Cairns Taxis remittance email.

---

## Phase 3 – Email Classification 🚧 Current Milestone

- [ ] Classify remittance emails.
- [ ] Classify account booking emails.
- [ ] Classify invoice emails.
- [ ] Record document metadata.

---

## Phase 4 – Document Processing

- [ ] Download PDF attachments.
- [ ] Extract text from attachments.
- [ ] Parse financial information.
- [ ] Capture remittance reference numbers.

---

## Phase 5 – Driver Companion Integration

- [ ] Read Driver Companion reports.
- [ ] Export Driver Companion reports to Google Sheets.
- [ ] Record remittance reference numbers.
- [ ] Prevent duplicate exports.

---

## Phase 6 – Reconciliation

- [ ] Compare Gmail data with Driver Companion.
- [ ] Compare Gmail data with Taxi Business Records.
- [ ] Match transactions using reference numbers.
- [ ] Flag discrepancies for review.
- [ ] Produce reconciliation reports.

---

# Recent Discoveries

- Cairns Taxis remittance notifications are delivered via Xero.
- Remittance emails contain useful metadata within the subject line.
- Xero remittance PDFs include a unique payment reference suitable for reconciliation.
- The payment reference should be stored within Taxi Business Records for audit purposes.

---

# Project Status

Authentication and Gmail connectivity are complete.

The Finance Agent can:

- Authenticate automatically using a stored refresh token.
- Connect to Gmail.
- Search for Cairns Taxis emails.
- Read individual emails.
- Extract key email metadata.

The next milestone is to classify financial emails before progressing to document extraction and Driver Companion integration.

---

# Engineering Philosophy

Driver Companion records reality.

Finance Agent verifies reality.

Taxi Business Records preserve reality.

Present facts.

Never guess.

Always verify.

If uncertain, flag for review.