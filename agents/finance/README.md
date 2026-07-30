# Agent 001 – Cairns Taxis Finance

## Purpose

Agent 001 reconciles Driver Companion with official Cairns Taxis financial records.

It compares data recorded by the driver against settlement information received by email and helps ensure the Taxi Business Records workbook remains accurate.

---

## Version

**Current Version:** 0.0.1 (Development)

**Status:** Active Development

---

## Responsibilities

- Authenticate with Google Gmail.
- Read Cairns Taxis settlement emails.
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

## Design Philosophy

- Keep the workbook simple.
- The agent performs the analysis.
- Never guess.
- If uncertain, flag for review.
- Every feature is tested before implementation continues.

---

## Development Principles

- One feature at a time.
- One test per feature.
- Documentation kept up to date.
- Small, maintainable modules.
- No unnecessary complexity.

---

## Current Progress

### Phase 1 – Authentication

- [x] Google Cloud project configured.
- [x] Gmail API enabled.
- [x] OAuth credentials created.
- [x] Load OAuth credentials.
- [x] Create OAuth client.
- [x] Generate authorisation URL.
- [ ] Complete first Google sign-in.
- [ ] Store refresh token.
