# Finance Agent Roadmap**

****Current Version:**** 0.0.3 (Development)

****Current Phase:**** Phase 8 – Reconciliation

****Current Step:**** Complete real manual verification cases, then continue with Account Booking reconciliation

---

## Phase 1 – Authentication ✅ Complete**

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

## Phase 2 – Gmail Connectivity ✅ Complete**

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

- [x] Prevent identical attachment filenames from overwriting each other.

---

## Phase 3 – Google Sheets Integration ✅ Complete**

- [x] Connect to the Taxi Business Records workbook.

- [x] Read workbook properties.

- [x] Confirm workbook title.

- [x] Create Google Sheets configuration loader.

- [x] Create `SheetsAgent`.

- [x] Add row-based worksheet updates.

- [x] Preserve monthly sheet formulas and totals.

- [x] Confirm the Summary sheet updates automatically.

- [x] Read monthly ledger rows.

- [x] Read current ledger verification status.

- [x] Update only the ledger Status cell when verification succeeds.

- [x] Read the `Finance Agent Log`.

- [x] Append verification audit records.

---

## Phase 4 – Email Classification ✅ Complete**

- [x] Classify remittance emails.

- [x] Classify account booking emails.

- [x] Classify invoice emails.

- [x] Reject matching subjects from unrecognised senders.

- [x] Record document metadata.

- [x] Capture sender information.

- [x] Capture payment amounts from email subjects.

- [x] Capture customer payment references.

- [x] Identify the financial record associated with each payment.

---

## Phase 5 – Shift Mate Integration ✅ Complete**

### Export ✅ Complete**

- [x] Create Shift Mate export API endpoint.

- [x] Send complete Shift Mate reports to the API.

- [x] Create report mapper.

- [x] Create worksheet resolver.

- [x] Determine the correct monthly worksheet.

- [x] Determine the correct daily row.

- [x] Export Shift Mate reports to Google Sheets.

- [x] Preserve the original Shift Mate values.

- [x] Convert CTL payments into positive Settlement income values.

- [x] Prevent duplicate rows by updating the fixed date row.

- [x] Add `CTL Export` to Notes.

- [x] Set exported rows to `Pending`.

- [x] Add exporting, success and failure button states.

- [x] Add persistent Google Sheets sync state.

- [x] Add mapper and worksheet resolver unit tests.

### Automatic Backup ✅ Complete**

- [x] Create the hidden `Shift Mate Backup` worksheet.

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

### Backup and Sync Status ✅ Complete**

- [x] Store backup success or failure on the local report.

- [x] Store the successful backup timestamp.

- [x] Store the backup error when cloud backup fails.

- [x] Display separate Backup and Sync statuses.

- [x] Keep backup status after closing and reopening the app.

- [x] Clearly warn when a report is saved locally but cloud backup fails.

- [x] Display whether the report is backed up to Google Sheets.

- [x] Display whether the report has been synced to the monthly ledger.

---

## Phase 6 – Backup Recovery ✅ Complete**

### Cloud Recovery Foundation ✅ Complete**

- [x] Create an API endpoint to read Shift Mate backups.

- [x] Read all backed-up report JSON from Google Sheets.

- [x] Parse backup JSON into Shift Mate report objects.

- [x] Validate restored report data before recovery.

- [x] Safely skip malformed or incomplete backup records.

- [x] Compare cloud backups with local reports using Report ID.

- [x] Show the number of cloud backups found.

- [x] Show how many reports are stored on the device.

- [x] Show how many cloud reports are missing locally.

- [x] Display Cloud Backup Status on the Reports page.

- [x] Add parser unit tests.

- [x] Add comparer unit tests.

### Safe Restore Workflow ✅ Complete**

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

### Production Recovery Verification ✅ Complete**

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

- [x] Reinstall Shift Mate as a production PWA.

- [x] Confirm restored reports persist inside the installed PWA.

- [x] Confirm report backup works over the mobile network.

- [x] Confirm monthly ledger export works over the mobile network.

---

## Future Recovery Enhancements 📋 Planned**

- [ ] Add an advanced option to replace all local reports.

- [ ] Require an explicit warning and confirmation before replacement.

- [ ] Create an automatic local backup before replacing reports.

- [ ] Add automated browser-level end-to-end backup and restore tests.

- [ ] Add coordinated deletion options for local reports, cloud backups and ledger entries.

---

## Phase 7 – Document Processing ✅ Complete**

### PDF Processing ✅ Complete**

- [x] Download PDF attachments.

- [x] Store downloaded PDFs locally.

- [x] Prevent duplicate filenames from overwriting downloaded documents.

- [x] Exclude downloaded financial documents from Git.

- [x] Extract text from PDF documents.

- [x] Preserve original email and attachment metadata.

### Remittance Processing ✅ Complete**

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

- [x] Validate remittance invoice dates against reference numbers.

- [x] Mark consistent remittances as `VALID`.

- [x] Mark incomplete or inconsistent remittances as `REVIEW_REQUIRED`.

### Account Booking Processing ✅ Complete**

- [x] Extract Account Booking payment dates.

- [x] Extract Account Booking PDF totals.

- [x] Extract seven-digit booking references.

- [x] Compare email subject totals with PDF totals.

- [x] Mark consistent Account Booking payments as `VALID`.

- [x] Mark incomplete or inconsistent Account Booking payments as `REVIEW_REQUIRED`.

### Invoice Processing ✅ Complete**

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

### Verification ✅ Complete**

- [x] Test Remittance processing against real Cairns Taxis documents.

- [x] Test Account Booking processing against real Cairns Taxis documents.

- [x] Test Invoice processing against a real Cairns Taxis document.

- [x] Confirm malformed or inconsistent remittances are excluded from automatic reconciliation.

- [x] Confirm the current automated test suite passes: 79 tests across 8 test files.

---

## Phase 8 – Reconciliation 🚧 Current**

### Reconciliation Foundation ✅ Complete**

- [x] Read monthly Taxi Business Records ledger rows.

- [x] Read each ledger row's current Status.

- [x] Process validated remittance records only.

- [x] Compare remittance payment lines with ledger rows.

- [x] Match using ledger date and remittance reference information.

- [x] Preserve the matched Google Sheets row number.

- [x] Compare official remittance amount with ledger Settlement.

- [x] Detect exact matches.

- [x] Detect non-matches without changing the ledger.

- [x] Prevent an already `Verified` row from being verified again.

- [x] Confirm repeat Finance Agent runs are idempotent for already verified rows.

### Standard CTL Remittances ✅ Automatic Verification Working**

- [x] Restrict automatic settlement verification to validated CTL remittances.

- [x] Compare ledger Settlement with the official CTL remittance payment line.

- [x] Require the remittance reference to agree with the relevant date.

- [x] Require an exact Settlement amount match.

- [x] Require the current ledger Status to be `Pending`.

- [x] Change `Pending` to `Verified` when all automatic verification rules pass.

- [x] Leave `Pending` unchanged when the amount does not match.

- [x] Leave already `Verified` rows unchanged.

- [x] Record successful automatic verification in the Finance Agent Log.

- [x] Confirm live automatic verification against real CTL remittances.

- [x] Confirm live repeat processing causes no duplicate ledger change.

### Manual Verification 🚧 Current**

- [x] Define `AUTOMATIC` and `MANUAL` verification methods.

- [x] Create a protected manual verification method.

- [x] Require an explicit manual command.

- [x] Read the current ledger Status before manual verification.

- [x] Permit manual verification only when the target row is `Pending`.

- [x] Reject blank, non-Pending or already `Verified` rows.

- [x] Change an approved manual verification from `Pending` to `Verified`.

- [x] Record a `MANUAL` verification audit entry.

- [x] Preserve a supplied verification source.

- [x] Test the command with missing arguments.

- [x] Test rejection of a non-Pending row.

- [x] Test rejection of an already `Verified` row.

- [ ] Complete manual verification of the real mixed CTL/operator payment cases.

- [ ] Define the final user-facing manual verification workflow beyond the development CLI.

### Account Bookings 📋 Next**

- [ ] Match validated Account Booking payments separately from standard settlements.

- [ ] Compare Account Payment ledger income with the official payment.

- [ ] Use the Account Booking reference as supporting evidence.

- [ ] Prevent the same Account Booking payment from being reconciled twice.

- [ ] Change `Pending` to `Verified` only when the required Account Booking checks pass.

- [ ] Leave uncertain Account Booking records unchanged or flag them for review.

- [ ] Record verification method and source in the Finance Agent Log.

### Invoices 📋 Planned**

- [ ] Record invoices payable to Cairns Taxis.

- [ ] Preserve invoice number, date, due date and reference.

- [ ] Record the amount due.

- [ ] Track whether an invoice has been paid.

- [ ] Prevent duplicate invoice records.

- [ ] Flag overdue or conflicting invoices for review.

### Review and Reporting 📋 Planned**

- [ ] Flag missing transactions.

- [ ] Flag conflicting totals.

- [ ] Flag duplicate transactions.

- [ ] Identify repeated discrepancies for investigation.

- [ ] Produce reconciliation summaries.

- [ ] Allow reviewed discrepancies to be resolved explicitly and traceably.

---

## Phase 9 – Finance Agent Logging 🚧 In Progress**

### Verification Audit Trail ✅ Foundation Complete**

- [x] Define the `Finance Agent Log` worksheet structure.

- [x] Add `Ledger Date`.

- [x] Add `Method`.

- [x] Add `Verified At`.

- [x] Add `Source`.

- [x] Support `AUTOMATIC` verification records.

- [x] Support `MANUAL` verification records.

- [x] Append verification records through `SheetsAgent`.

- [x] Read existing Finance Agent Log rows.

- [x] Record source Gmail message IDs for automatic CTL verification.

- [x] Preserve a supplied source for manual verification.

### Future Logging**

- [ ] Record broader email-processing actions.

- [ ] Record backup actions.

- [ ] Record export actions.

- [ ] Record reconciliation review outcomes.

- [ ] Record processing errors.

- [ ] Include relevant report or document references where appropriate.

- [ ] Decide whether the Finance Agent Log should remain visible or hidden during normal use.

- [ ] Add duplicate protection or recovery handling for partially completed verification/log writes.

---

## Phase 10 – Future Enhancements 📋 Planned**

- [ ] Remove the development-only fixed Gmail recent-message limit.

- [ ] Derive the target monthly ledger automatically instead of hard-coding August.

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

## Phase 11 – Authentication and Access Control 📋 Planned**

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

# Completed Milestones**

## Milestone 007 – Automatic Report Backup ✅ Complete**

Shift Mate automatically stores every saved report in two independent locations:

- Local browser storage.

- The hidden `Shift Mate Backup` worksheet.

The backup preserves the complete report JSON and is independent of the monthly business-record export.

---

## Milestone 008 – Backup and Sync Status ✅ Complete**

Shift Mate displays separate persistent states for:

- Local report saved.

- Cloud backup successful or failed.

- Monthly ledger synced or not synced.

---

## Milestone 009 – Backup Recovery ✅ Complete**

Shift Mate can compare cloud backups with local reports and safely restore only reports missing from the device.

Recovery has been verified in:

- Desktop browsers.

- Mobile browsers.

- The installed production PWA.

- Mobile-network operation.

---

## Milestone 010 – Email Classification and Document Processing ✅ Complete**

Finance Agent can:

- Classify Remittances, Account Bookings and Invoices.

- Download and read financial PDF attachments.

- Extract document-specific financial information.

- Compare related totals.

- Validate remittance invoice dates against payment references.

- Produce structured records.

- Mark records as `VALID` or `REVIEW_REQUIRED`.

The current automated test suite passes 79 tests across 8 test files.

---

## Milestone 011 – CTL Remittance Reconciliation Foundation ✅ Complete**

Finance Agent can now:

- Read monthly Taxi Business Records ledger rows.

- Compare validated CTL remittance payment lines with ledger Settlement values.

- Match remittance references with ledger dates.

- Detect exact and non-matching settlements.

- Preserve the target Google Sheets row number.

- Leave uncertain matches unchanged.

- Prevent repeat verification of already `Verified` rows.

Live reconciliation has been tested against real CTL remittance records.

---

# Current Milestone**

## Milestone 012 – Verification and Audit Trail 🚧 Current**

Finance Agent now supports:

- Automatic verification of exact CTL remittance matches.

- `Pending → Verified` status updates.

- Idempotent repeat processing.

- A dedicated Finance Agent verification log.

- `AUTOMATIC` and `MANUAL` verification methods.

- Verification timestamps and source records.

- A protected manual verification command.

- Safety rejection of rows that are not `Pending`.

Remaining work for this milestone:

- Complete real manual verification of the mixed CTL/operator payment cases.

- Confirm the desired long-term user-facing manual verification workflow.

- Harden recovery behaviour if a ledger update and audit-log write do not both complete.

---

# Next Milestone**

## Milestone 013 – Account Booking Reconciliation**

Finance Agent will:

- Match validated Account Booking payments separately from CTL remittances.

- Compare official payments with the `Account Payment` ledger value.

- Preserve booking references.

- Prevent duplicate reconciliation.

- Change `Pending` to `Verified` only when the evidence is sufficient.

- Leave uncertain cases unchanged or flag them for review.

- Record the verification method and source in the Finance Agent Log.
