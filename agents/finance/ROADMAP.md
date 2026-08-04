# Finance Agent Roadmap

**Current Version:** 0.0.3 (Development)

**Current Phase:** Phase 5 – Driver Companion Integration

**Current Step:** Add persistent backup and sync status

---

## Phase 1 – Authentication ✅ Complete

- [x] Create Finance Agent structure.
- [x] Configure Google Cloud project.
- [x] Enable Gmail API.
- [x] Enable Google Sheets API.
- [x] Create OAuth credentials.
- [x] Load OAuth credentials.
- [x] Create Google OAuth client.
- [x] Generate Google authorisation URL.
- [x] Complete first Google sign-in.
- [x] Exchange authorisation code for OAuth tokens.
- [x] Store refresh token securely.
- [x] Load stored refresh token.
- [x] Authenticate using stored refresh token.
- [x] Load Google Sheets configuration.
- [x] Create authenticated Google Sheets client.

---

## Phase 2 – Gmail Connectivity ✅ Complete

- [x] Connect to Gmail.
- [x] Read inbox.
- [x] List recent emails.
- [x] Retrieve email by message ID.
- [x] Extract email headers.
- [x] Search Gmail using configurable search queries.
- [x] Locate first Cairns Taxis remittance email.
- [x] Confirm Cairns Taxis remittance notifications are delivered through Xero.

---

## Phase 3 – Google Sheets Integration ✅ Complete

- [x] Connect to the Taxi Business Records workbook.
- [x] Read workbook properties.
- [x] Confirm workbook title.
- [x] Write a test value to Google Sheets.
- [x] Create Google Sheets configuration loader.
- [x] Create `SheetsAgent`.
- [x] Add row-based worksheet updates.
- [x] Preserve monthly sheet formulas and totals.
- [x] Confirm Summary sheet updates automatically.

---

## Phase 4 – Email Classification

- [ ] Classify remittance emails.
- [ ] Classify account booking emails.
- [ ] Classify invoice emails.
- [ ] Record document metadata.
- [ ] Capture sender information.
- [ ] Capture payment amount from the email subject.
- [ ] Identify the shift or shifts covered by each payment.

---

## Phase 5 – Driver Companion Integration 🚧 Current

### Export ✅ Complete

- [x] Create Driver Companion export API endpoint.
- [x] Send complete Driver Companion reports to the API.
- [x] Create report mapper.
- [x] Create worksheet resolver.
- [x] Determine the correct monthly worksheet.
- [x] Determine the correct daily row.
- [x] Export Driver Companion reports to Google Sheets.
- [x] Preserve the original Driver Companion values.
- [x] Convert CTL payments into positive Settlement income values.
- [x] Prevent duplicate rows by updating the fixed date row.
- [x] Add `CTL Export` to Notes.
- [x] Set exported rows to `Pending`.
- [x] Add exporting, success and failure button states.
- [x] Add persistent Google Sheets sync state.
- [x] Add mapper and worksheet resolver unit tests.

### Automatic Backup ✅ Complete

- [x] Create the hidden `Driver Companion Backup` worksheet.
- [x] Store Report ID.
- [x] Store Shift Date.
- [x] Store backup timestamp.
- [x] Store application version.
- [x] Store the complete report JSON.
- [x] Create a dedicated backup API endpoint.
- [x] Automatically back up reports when Save Report is pressed.
- [x] Update an existing backup using Report ID.
- [x] Separate backup from monthly ledger export.
- [x] Preserve local storage as the working copy.
- [x] Preserve Google Sheets as the independent backup.

### Current Work

- [ ] Store backup success or failure on the local report.
- [ ] Display separate Backup and Sync statuses.
- [ ] Keep backup status after closing and reopening the app.
- [ ] Clearly warn when a report is saved locally but cloud backup fails.

---

## Phase 6 – Backup Recovery

- [ ] Create an API endpoint to read Driver Companion backups.
- [ ] Read all backed-up report JSON from Google Sheets.
- [ ] Validate restored report data.
- [ ] Restore reports into local storage.
- [ ] Prevent duplicate reports during restoration.
- [ ] Add a Restore Reports control.
- [ ] Show the number of reports available for restoration.
- [ ] Confirm recovery after local storage is cleared.
- [ ] Add backup and restore tests.

---

## Phase 7 – Document Processing

- [ ] Download PDF attachments.
- [ ] Extract text from PDF documents.
- [ ] Parse financial information.
- [ ] Capture remittance reference numbers.
- [ ] Capture account payment reference numbers.
- [ ] Validate extracted values.
- [ ] Preserve the original email and document metadata.

---

## Phase 8 – Reconciliation

- [ ] Read `Pending` rows from Taxi Business Records.
- [ ] Compare Driver Companion Settlement with the official CTL remittance.
- [ ] Compare account payments separately.
- [ ] Match payments using date, amount and reference information.
- [ ] Change Status to `Paid` when values match.
- [ ] Change Status to `Review` when values differ.
- [ ] Preserve the original Driver Companion financial values.
- [ ] Add the official remittance amount to Notes when required.
- [ ] Add the difference between amounts to Notes.
- [ ] Add the remittance reference number to Notes.
- [ ] Identify repeated discrepancies for investigation.
- [ ] Produce reconciliation reports.

---

## Phase 9 – Finance Agent Logging

- [ ] Define the Finance Agent Log worksheet structure.
- [ ] Record backup actions.
- [ ] Record export actions.
- [ ] Record reconciliation actions.
- [ ] Record errors and review outcomes.
- [ ] Include timestamps and report references.
- [ ] Keep the Finance Agent Log hidden during normal use.

---

## Phase 10 – Future Enhancements

- [ ] Export all unsynced historical reports.
- [ ] Automatic reconciliation scheduling.
- [ ] Monthly financial summaries.
- [ ] Dashboard.
- [ ] Invoice management.
- [ ] Expense workflow for amounts payable to Cairns Taxis.
- [ ] New financial-year workbook creation.
- [ ] Google Drive archive.
- [ ] Multi-driver support.
- [ ] Guided onboarding wizard.
- [ ] App update and migration support.
- [ ] Hosted Finance Agent service.

---

## Phase — Authentication and Access Control

- [ ] Add Google account sign-in.
- [ ] Restrict access to the authorised user.
- [ ] Add secure server-side sessions.
- [ ] Protect finance API routes.
- [ ] Add passkey registration.
- [ ] Support fingerprint, face or device PIN through WebAuthn.
- [ ] Add sign-out.
- [ ] Add account recovery.
- [ ] Test installed-PWA authentication.

---

## Current Milestone

### Milestone 007 — Automatic Report Backup ✅ Complete

Driver Companion now automatically stores every saved report in two independent locations:

- Local browser storage.
- The hidden `Driver Companion Backup` worksheet.

The backup preserves the complete report JSON and is independent of the monthly business-record export.

---

## Next Milestone

### Milestone 008 — Backup and Sync Status

Driver Companion will show separate, persistent states for:

- Local report saved.
- Cloud backup successful or failed.
- Monthly ledger synced or not synced.

After this milestone, development will move to restoring reports from the backup worksheet.