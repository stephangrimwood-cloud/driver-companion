# Agent 001 – Cairns Taxis Finance

## Purpose

Agent 001 reconciles Driver Companion with official Cairns Taxis financial records.

It compares data recorded by the driver against settlement information received by email and helps ensure the Taxi Business Records workbook remains accurate.

---

# Version

**Current Version:** 0.0.2 (Development)

**Status:** Authentication Complete

---

# Responsibilities

* Authenticate with Google Gmail.
* Read Cairns Taxis settlement emails.
* Identify:

  * Remittances
  * Account Bookings
  * Invoices
* Extract financial information.
* Read Driver Companion data.
* Compare against Taxi Business Records.
* Flag discrepancies for review.
* Update records where appropriate.

---

# Design Philosophy

* Keep the workbook simple.
* The agent performs the analysis.
* Never guess.
* If uncertain, flag for review.
* Every feature is tested before implementation continues.

---

# Development Principles

* One feature at a time.
* One test per feature.
* Documentation kept up to date.
* Small, maintainable modules.
* No unnecessary complexity.

---

# Current Progress

## Phase 1 – Authentication ✅ Complete

* [x] Google Cloud project configured.
* [x] Gmail API enabled.
* [x] OAuth credentials created.
* [x] Load OAuth credentials.
* [x] Create OAuth client.
* [x] Generate authorisation URL.
* [x] Complete first Google sign-in.
* [x] Capture authorisation code.
* [x] Exchange authorisation code for OAuth tokens.
* [x] Store refresh token securely.
* [x] Load stored refresh token.

---

## Phase 2 – Gmail Connectivity 🚧 Current Milestone

* [ ] Authenticate using the stored refresh token.
* [ ] Connect to the Gmail API.
* [ ] Read the inbox.
* [ ] List recent email subjects.

---

## Phase 3 – Email Classification

* [ ] Identify settlement emails.
* [ ] Identify account booking emails.
* [ ] Identify invoice emails.

---

## Phase 4 – Document Processing

* [ ] Download PDF attachments.
* [ ] Extract text from attachments.
* [ ] Parse financial information.

---

## Phase 5 – Reconciliation

* [ ] Compare Gmail data with Driver Companion.
* [ ] Compare Gmail data with Taxi Business Records.
* [ ] Flag discrepancies for review.
* [ ] Produce reconciliation reports.

---

# Project Status

The authentication framework is complete.

The next development milestone is to prove Gmail connectivity by authenticating with the stored refresh token and successfully connecting to the Gmail API.

Once this has been verified, development will move on to locating and processing Cairns Taxis financial emails.

---

# Engineering Philosophy

The Driver Companion records reality.

The Finance Agent performs verification.

The Taxi Business Records workbook remains simple.

Never guess.

Always verify.

If uncertain, flag for review.
