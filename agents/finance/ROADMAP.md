# Finance Agent Roadmap

**Current Version:** 0.0.2 (Development)

**Current Phase:** Phase 3 – Email Classification

**Current Step:** Classify Cairns Taxis financial emails

---

## Phase 1 – Authentication ✅ Complete

- [x] Create Finance Agent structure.
- [x] Configure Google Cloud project.
- [x] Enable Gmail API.
- [x] Create OAuth credentials.
- [x] Load OAuth credentials.
- [x] Create Google OAuth client.
- [x] Generate Google authorisation URL.
- [x] Complete first Google sign-in.
- [x] Exchange authorisation code for OAuth tokens.
- [x] Store refresh token securely.
- [x] Load stored refresh token.
- [x] Authenticate using stored refresh token.

---

## Phase 2 – Gmail Connectivity ✅ Complete

- [x] Connect to Gmail.
- [x] Read inbox.
- [x] List recent emails.
- [x] Retrieve email by message ID.
- [x] Extract email headers.
- [x] Search Gmail using configurable search queries.
- [x] Locate first Cairns Taxis remittance email.

---

## Phase 3 – Email Classification 🚧 Current

- [ ] Classify remittance emails.
- [ ] Classify account booking emails.
- [ ] Classify invoice emails.
- [ ] Record document metadata.
- [ ] Capture sender information.

---

## Phase 4 – Document Processing

- [ ] Download PDF attachments.
- [ ] Extract text from PDF documents.
- [ ] Parse financial information.
- [ ] Capture remittance reference numbers.
- [ ] Validate extracted values.

---

## Phase 5 – Driver Companion Integration

- [ ] Read Driver Companion reports.
- [ ] Export Driver Companion reports to Google Sheets.
- [ ] Store Google Sheets row reference.
- [ ] Store remittance reference number.
- [ ] Prevent duplicate exports.

---

## Phase 6 – Reconciliation

- [ ] Compare Driver Companion with Gmail.
- [ ] Compare Driver Companion with Taxi Business Records.
- [ ] Match using remittance reference numbers.
- [ ] Flag discrepancies.
- [ ] Produce reconciliation reports.

---

## Phase 7 – Future Enhancements

- [ ] Dashboard.
- [ ] Summary reports.
- [ ] Automatic reconciliation.
- [ ] Monthly financial summaries.
- [ ] Invoice management.
- [ ] Multi-driver support.
- [ ] Guided onboarding wizard.