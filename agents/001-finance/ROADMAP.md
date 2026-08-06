# Finance Agent Roadmap

**Current Version:** 0.0.3 (Development)

**Current Phase:** Phase 8 – Reconciliation

**Current Step:** Connect verified financial records with pending Taxi Business Records rows

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
- [x] Read the inbox.
- [x] List recent emails.
- [x] Retrieve an email by message ID.
- [x] Extract email headers.
- [x] Search Gmail using configurable search queries.
- [x] Locate Cairns Taxis financial emails.
- [x] Confirm Cairns Taxis financial notifications are delivered through Xero.
- [x] Retrieve attachment metadata.
- [x] Download Gmail attachments.

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
- [x] Confirm the Summary sheet updates automatically.

---

## Phase 4 – Email Classification ✅ Complete

- [x] Classify remittance emails.
- [x] Classify account booking emails.
- [x] Classify invoice emails.
- [x] Reject matching subjects from unrecognised senders.
- [x] Record document metadata.
- [x] Capture sender information.
- [x] Capture payment amounts from email subjects.
- [x] Capture customer payment references.
- [x] Identify the shift or booking covered by each payment.

---

## Phase 5 – Driver Companion Integration ✅ Complete

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

### Backup and Sync Status ✅ Complete

- [x] Store backup success or failure on the local report.
- [x] Store the successful backup timestamp.
- [x] Store the backup error when cloud backup fails.
- [x] Display separate Backup and Sync statuses.
- [x] Keep backup status after closing and reopening the app.
- [x] Clearly warn when a report is saved locally but cloud backup fails.
- [x] Display whether the report is backed up to Google Sheets.
- [x] Display whether the report has been synced to the monthly ledger.

---

## Phase 6 – Backup Recovery ✅ Complete

### Cloud Recovery Foundation ✅ Complete

- [x] Create an API endpoint to read Driver Companion backups.
- [x] Read all backed-up report JSON from Google Sheets.
- [x] Parse backup JSON into Driver Companion report objects.
- [x] Validate restored report data before recovery.
- [x] Safely skip malformed or incomplete backup records.
- [x] Compare cloud backups with local reports using Report ID.
- [x] Show the number of cloud backups found.
- [x] Show how many reports are stored on the device.
- [x] Show how many cloud reports are missing locally.
- [x] Display Cloud Backup Status on the Reports page.
- [x] Add parser unit tests.
- [x] Add comparer unit tests.

### Safe Restore Workflow ✅ Complete

- [x] Restore only reports missing from the device.
- [x] Preserve all existing local reports.
- [x] Prevent restored reports from overwriting local reports.
- [x] Prevent duplicate Report IDs already stored locally.
- [x] Prevent duplicate Report IDs within cloud backup data.
- [x] Sort merged reports newest first.
- [x] Add a Restore Reports control.
- [x] Show restore progress.
- [x] Show a restore completion summary.
- [x] Refresh the Reports page automatically after restoration.
- [x] Confirm successful recovery after local storage was cleared.
- [x] Add unit tests for the restore merge process.
- [x] Connect the tested merge function to the live restore workflow.

### Production Recovery Verification ✅ Complete

- [x] Configure protected Google credentials through Vercel environment variables.
- [x] Keep local JSON credential files available for development only.
- [x] Confirm the production build completes successfully.
- [x] Confirm the automated test suite passes.
- [x] Deploy recovery support to the production Vercel application.
- [x] Confirm production can read Google Sheets backups.
- [x] Restore four missing reports through the stable production domain.
- [x] Confirm restored reports persist after a browser refresh.
- [x] Confirm production restoration on a desktop browser.
- [x] Confirm production restoration on a mobile device.
- [x] Reinstall Driver Companion as a production PWA.
- [x] Confirm restored reports persist inside the installed PWA.
- [x] Confirm report backup works over the mobile network.
- [x] Confirm monthly ledger export works over the mobile network.

---

## Future Recovery Enhancements 📋 Planned

- [ ] Add an advanced option to replace all local reports.
- [ ] Require an explicit warning and confirmation before replacement.
- [ ] Create an automatic local backup before replacing reports.
- [ ] Add automated browser-level end-to-end backup and restore tests.
- [ ] Add coordinated deletion options for local reports, cloud backups and ledger entries.

---

## Phase 7 – Document Processing ✅ Complete

### PDF Processing ✅ Complete

- [x] Download PDF attachments.
- [x] Store downloaded PDFs locally.
- [x] Exclude downloaded financial documents from Git.
- [x] Extract text from PDF documents.
- [x] Preserve original email and attachment metadata.

### Remittance Processing ✅ Complete

- [x] Extract remittance payment dates.
- [x] Extract individual remittance payment lines.
- [x] Extract invoice dates from payment lines.
- [x] Extract shift reference numbers.
- [x] Extract invoice totals.
- [x] Extract amounts paid.
- [x] Extract amounts still owing.
- [x] Extract the PDF total paid.
- [x] Compare the email subject total with payment-line totals.
- [x] Compare the PDF total with payment-line totals.
- [x] Mark consistent remittances as `VALID`.
- [x] Mark incomplete or inconsistent remittances as `REVIEW_REQUIRED`.

### Account Booking Processing ✅ Complete

- [x] Extract Account Booking payment dates.
- [x] Extract Account Booking PDF totals.
- [x] Extract seven-digit booking references.
- [x] Compare email subject totals with PDF totals.
- [x] Mark consistent Account Booking payments as `VALID`.
- [x] Mark incomplete or inconsistent Account Booking payments as `REVIEW_REQUIRED`.

### Invoice Processing ✅ Complete

- [x] Extract invoice numbers.
- [x] Extract invoice dates.
- [x] Extract invoice due dates.
- [x] Extract invoice references.
- [x] Extract amounts due.
- [x] Extract invoice totals.
- [x] Keep customer identifiers separate from invoice references.
- [x] Compare amounts due with invoice totals.
- [x] Mark consistent invoices as `VALID`.
- [x] Mark incomplete or inconsistent invoices as `REVIEW_REQUIRED`.

### Verification ✅ Complete

- [x] Test Remittance processing against real Cairns Taxis documents.
- [x] Test Account Booking processing against real Cairns Taxis documents.
- [x] Test Invoice processing against a real Cairns Taxis document.
- [x] Confirm all 74 automated tests pass.

---

## Phase 8 – Reconciliation 🚧 Current

### Reconciliation Foundation

- [ ] Define the complete reconciliation record structure.
- [ ] Read `Pending` rows from Taxi Business Records.
- [ ] Read verified Remittance records.
- [ ] Read verified Account Booking records.
- [ ] Read verified Invoice records.
- [ ] Match official records with Driver Companion reports.
- [ ] Match official records with monthly ledger rows.
- [ ] Match records using dates, amounts and reference numbers.
- [ ] Prevent the same official document from being reconciled more than once.

### Standard Remittances

- [ ] Compare Driver Companion Settlement with the official CTL remittance.
- [ ] Compare official payment totals with the monthly ledger.
- [ ] Record the official remittance reference.
- [ ] Change Status to `Paid` when values match.
- [ ] Change Status to `Review` when values differ.
- [ ] Preserve the original Driver Companion financial values.
- [ ] Add official values and differences to Notes when required.

### Account Bookings

- [ ] Match Account Booking payments separately from standard settlements.
- [ ] Compare Account Booking income with the official payment.
- [ ] Record the booking reference.
- [ ] Change Status to `Paid` when values match.
- [ ] Change Status to `Review` when values differ.

### Invoices

- [ ] Record invoices payable to Cairns Taxis.
- [ ] Preserve invoice number, date, due date and reference.
- [ ] Record the amount due.
- [ ] Track whether an invoice has been paid.
- [ ] Prevent duplicate invoice records.
- [ ] Flag overdue or conflicting invoices for review.

### Review and Reporting

- [ ] Flag missing transactions.
- [ ] Flag conflicting totals.
- [ ] Flag duplicate transactions.
- [ ] Identify repeated discrepancies for investigation.
- [ ] Produce reconciliation summaries.
- [ ] Allow reviewed discrepancies to be resolved.

---

## Phase 9 – Finance Agent Logging 📋 Planned

- [ ] Define the Finance Agent Log worksheet structure.
- [ ] Record email-processing actions.
- [ ] Record backup actions.
- [ ] Record export actions.
- [ ] Record reconciliation actions.
- [ ] Record errors and review outcomes.
- [ ] Include timestamps and report references.
- [ ] Keep the Finance Agent Log hidden during normal use.

---

## Phase 10 – Future Enhancements 📋 Planned

- [ ] Export all unsynced historical reports.
- [ ] Add automatic reconciliation scheduling.
- [ ] Add monthly financial summaries.
- [ ] Add a Finance Agent dashboard.
- [ ] Add full invoice management.
- [ ] Add an expense workflow for amounts payable to Cairns Taxis.
- [ ] Add new financial-year workbook creation.
- [ ] Add a Google Drive archive.
- [ ] Add multi-driver support.
- [ ] Add a guided onboarding wizard.
- [ ] Add app update and data migration support.
- [ ] Create a hosted Finance Agent service.

---

## Phase 11 – Authentication and Access Control 📋 Planned

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

# Completed Milestones

## Milestone 007 – Automatic Report Backup ✅ Complete

Driver Companion automatically stores every saved report in two independent locations:

- Local browser storage.
- The hidden `Driver Companion Backup` worksheet.

The backup preserves the complete report JSON and is independent of the monthly business-record export.

---

## Milestone 008 – Backup and Sync Status ✅ Complete

Driver Companion displays separate persistent states for:

- Local report saved.
- Cloud backup successful or failed.
- Monthly ledger synced or not synced.

---

## Milestone 009 – Backup Recovery ✅ Complete

Driver Companion can compare cloud backups with local reports and safely restore only reports missing from the device.

Recovery has been verified in:

- Desktop browsers.
- Mobile browsers.
- The installed production PWA.
- Mobile-network operation.

---

## Milestone 010 – Email Classification and Document Processing ✅ Complete

Finance Agent can now:

- Classify Remittances, Account Bookings and Invoices.
- Download and read financial PDF attachments.
- Extract document-specific financial information.
- Compare related totals.
- Produce structured records.
- Mark records as `VALID` or `REVIEW_REQUIRED`.

All 74 automated tests pass.

---

# Current Milestone

## Milestone 011 – Financial Reconciliation Foundation 🚧 Current

Finance Agent will connect verified Gmail financial records with:

- Driver Companion reports.
- Pending Taxi Business Records rows.
- Official payment references.
- Account Booking references.
- Cairns Taxis invoices.

The first objective is to establish reliable matching using dates, amounts and reference numbers without altering original Driver Companion values.

---

# Next Milestone

## Milestone 012 – Automated Reconciliation

Finance Agent will:

- Mark matching transactions as `Paid`.
- Mark conflicting or incomplete transactions as `Review`.
- Record official references and differences.
- Prevent duplicate reconciliation.
- Produce clear reconciliation summaries.