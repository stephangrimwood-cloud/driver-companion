# Finance Agent Roadmap

**Current Version:** 0.0.3 (Development)  
**Current Phase:** Phase 8 – Reconciliation ✅ Complete  
**Current Step:** Document completed reconciliation work, then begin Invoice and Expense reconciliation  
**Automated Test Baseline:** 97 tests across 10 test files

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
- [x] Confirm local OAuth re-authorisation and refresh-token recovery.
- [x] Confirm production credentials work through Vercel environment variables.

---

## Phase 2 – Gmail Connectivity ✅ Complete

- [x] Connect to Gmail.
- [x] Read the inbox.
- [x] Retrieve an email by message ID.
- [x] Extract email headers.
- [x] Search Gmail using configurable queries.
- [x] Locate Cairns Taxis financial emails.
- [x] Confirm Cairns Taxis financial notifications are delivered through Xero.
- [x] Retrieve attachment metadata.
- [x] Download Gmail attachments.
- [x] Prevent identical attachment filenames from overwriting each other.
- [x] Add Gmail pagination.
- [x] Remove reliance on the original recent-message limit.
- [x] Filter financial-email searches to the active financial year.
- [x] Apply financial-year filtering to remittances.
- [x] Apply financial-year filtering to Account Booking payments.

---

## Phase 3 – Google Sheets Integration ✅ Complete

- [x] Connect to the Taxi Business Records workbook.
- [x] Read workbook properties.
- [x] Confirm workbook title.
- [x] Create Google Sheets configuration loader.
- [x] Create `SheetsAgent`.
- [x] Add row-based worksheet updates.
- [x] Preserve monthly sheet formulas and totals.
- [x] Confirm the Summary sheet updates automatically.
- [x] Read monthly ledger rows.
- [x] Read all July–June financial-year ledger worksheets.
- [x] Read current ledger verification status.
- [x] Update only the required ledger cells.
- [x] Read the `Finance Agent Log`.
- [x] Append verification audit records.
- [x] Support ledger Note updates without overwriting existing Notes.
- [x] Prevent the same ledger Note text from being added twice.

---

## Phase 4 – Email Classification ✅ Complete

- [x] Classify remittance emails.
- [x] Classify Account Booking emails.
- [x] Classify invoice emails.
- [x] Reject matching subjects from unrecognised senders.
- [x] Record document metadata.
- [x] Capture sender information.
- [x] Capture payment amounts from email subjects.
- [x] Capture customer payment references.
- [x] Identify the financial record associated with each payment.
- [x] Mark valid records as `VALID`.
- [x] Mark incomplete or inconsistent records as `REVIEW_REQUIRED`.
- [x] Exclude uncertain or malformed documents from automatic reconciliation.

---

## Phase 5 – Shift Mate Integration ✅ Complete

### Export ✅ Complete

- [x] Create Shift Mate export API endpoint.
- [x] Send complete Shift Mate reports to the API.
- [x] Create report mapper.
- [x] Create worksheet resolver.
- [x] Determine the correct monthly worksheet.
- [x] Determine the correct daily row.
- [x] Export Shift Mate reports to Google Sheets.
- [x] Preserve the original Shift Mate values.
- [x] Convert CTL payments into positive Settlement income values.
- [x] Prevent duplicate date rows by updating the fixed date row.
- [x] Add `CTL Export` to Notes.
- [x] Set exported rows to `Pending`.
- [x] Add exporting, success and failure button states.
- [x] Add persistent Google Sheets sync state.
- [x] Add mapper and worksheet resolver unit tests.
- [x] Support multiple separate Shift Mate reports on the same calendar date.
- [x] Aggregate same-day reports into one monthly-ledger row.
- [x] Rewrite the existing daily ledger row rather than append duplicate dates.
- [x] Preserve each underlying Shift Mate report independently by Report ID.

### Monthly Ledger Methodology ✅ Defined

- [x] Keep one row per calendar date in each monthly worksheet.
- [x] Record Cash as `Cash Taken - Area Charge`.
- [x] Allow Cash to be negative when Area Charges exceed physical cash taken.
- [x] Preserve original Cash Taken and Area Charge values in Shift Mate.
- [x] Record Settlement separately.
- [x] Record Account Booking income separately in `Account Payment`.
- [x] Calculate `Total Income = Cash + Settlement + Account Payment`.
- [x] Preserve Notes and verification Status alongside the financial values.
- [ ] Add a permanent visible methodology note to each monthly worksheet for accountant/ATO review.

### Automatic Backup ✅ Complete

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
- [x] Delete the matching cloud backup when a report is intentionally deleted.

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
- [x] Reinstall Shift Mate as a production PWA.
- [x] Confirm restored reports persist inside the installed PWA.
- [x] Confirm report backup works over the mobile network.
- [x] Confirm monthly ledger export works over the mobile network.

### Future Recovery Enhancements 📋 Planned

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
- [x] Prevent duplicate filenames from overwriting downloaded documents.
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
- [x] Validate remittance invoice dates against reference numbers.
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
- [x] Confirm malformed or inconsistent remittances are excluded from automatic reconciliation.
- [x] Confirm the current automated test suite passes: 97 tests across 10 test files.

---

## Phase 8 – Reconciliation ✅ Complete

### Reconciliation Foundation ✅ Complete

- [x] Read monthly Taxi Business Records ledger rows.
- [x] Read all July–June financial-year ledger worksheets.
- [x] Read each ledger row's current Status.
- [x] Process validated remittance records only.
- [x] Route remittance references to the correct financial-year worksheet.
- [x] Compare remittance payment lines with ledger rows.
- [x] Match using ledger date and remittance reference information.
- [x] Preserve the matched Google Sheets row number.
- [x] Compare official remittance amount with ledger Settlement.
- [x] Detect exact matches.
- [x] Detect one-cent rounding differences.
- [x] Detect non-matches without changing the ledger.
- [x] Prevent an already `Verified` row from being verified again.
- [x] Confirm repeat Finance Agent runs are idempotent.
- [x] Reject references outside the selected financial year.

### Financial-Year Routing ✅ Complete

- [x] Define July–June worksheet order.
- [x] Resolve remittance references to the correct monthly worksheet.
- [x] Validate the year component of each reference.
- [x] Route July–December to the financial-year start year.
- [x] Route January–June to the following calendar year.
- [x] Read all 12 monthly ledgers before reconciliation.
- [x] Confirm valid July and August references route correctly.
- [x] Confirm out-of-financial-year references are rejected.
- [ ] Remove the hard-coded financial-year start year `2026`.
- [ ] Derive the active financial year from configuration or workbook context.

### Standard CTL Remittances ✅ Complete

- [x] Restrict automatic settlement verification to validated CTL remittances.
- [x] Compare ledger Settlement with the official CTL remittance payment line.
- [x] Require the remittance reference to agree with the relevant date.
- [x] Automatically verify exact Settlement matches.
- [x] Require the current ledger Status to be `Pending`.
- [x] Change `Pending` to `Verified` when automatic verification rules pass.
- [x] Leave already `Verified` rows unchanged.
- [x] Record successful automatic verification in the Finance Agent Log.
- [x] Confirm live automatic verification against real CTL remittances.
- [x] Confirm live repeat processing causes no duplicate ledger change.

### One-Cent Rounding Tolerance ✅ Complete

- [x] Compare Settlement and CTL remittance values using integer cents.
- [x] Treat a difference of `0.00` as `EXACT`.
- [x] Treat a difference of `0.01` as `ROUNDING_TOLERANCE`.
- [x] Automatically verify a one-cent difference.
- [x] Leave differences greater than one cent unresolved for investigation.
- [x] Preserve the original ledger financial figures.
- [x] Record `(ROUNDING_TOLERANCE)` in the automatic audit source.
- [x] Confirm live one-cent verification for 31/07.
- [x] Confirm live one-cent verification for 02/08.
- [x] Add unit-test coverage for the tolerance rule.

### Account Booking Reconciliation ✅ Complete

- [x] Process validated Account Booking payment records separately from standard settlements.
- [x] Search the complete July–June financial year.
- [x] Treat the Shift Mate report date as the authoritative work date.
- [x] Treat invoice and payment dates as payment-processing evidence.
- [x] Compare the official payment with the `Account Payment` ledger value.
- [x] Match exact Account Payment amounts.
- [x] Use the seven-digit Account Booking reference as supporting evidence.
- [x] Add confirmed Account Booking payment details to ledger Notes.
- [x] Search only `Pending` rows for automatic Account Booking candidates.
- [x] Reject ambiguous matches instead of guessing.
- [x] Re-read financial-year ledgers after adding Account Booking evidence.
- [x] Require settlement evidence as well when a row also contains Settlement income.
- [x] Confirm July Account Booking ref `8091343`.
- [x] Confirm August Account Booking ref `8176745`.
- [x] Confirm repeat processing is idempotent.

### All-Components Verification Rule ✅ Complete

- [x] Allow a row with no Account Payment to verify when CTL Settlement is confirmed.
- [x] Require Account Booking evidence when Account Payment is present.
- [x] Require CTL Settlement to be confirmed independently.
- [x] Do not allow an Account Booking payment by itself to verify the whole shift.
- [x] Preserve `Pending` whenever required evidence remains unresolved.

### Manual Verification ✅ Complete

- [x] Define `AUTOMATIC` and `MANUAL` verification methods.
- [x] Create a protected manual verification command.
- [x] Read the current ledger Status before manual verification.
- [x] Permit normal manual verification only when the target row is `Pending`.
- [x] Reject blank, non-Pending or already `Verified` rows.
- [x] Append the supplied explanation to ledger Notes.
- [x] Change an approved manual verification from `Pending` to `Verified`.
- [x] Record a `MANUAL` verification audit entry.
- [x] Preserve the supplied verification source.
- [x] Test the complete Note → Status → Audit workflow.
- [x] Confirm an already-Verified row is left completely unchanged.
- [x] Add dedicated `SheetsAgent` tests using mocked Google Sheets calls.

### Historical Manual Audit Backfill ✅ Complete

- [x] Add a safe audit-only backfill method.
- [x] Require the historical ledger row to already be `Verified`.
- [x] Do not alter ledger Notes.
- [x] Do not alter ledger Status.
- [x] Do not alter any financial figures.
- [x] Check the Finance Agent Log before writing.
- [x] Prevent duplicate `MANUAL` audit records.
- [x] Backfill 06/07 manual verification.
- [x] Backfill 13/07 manual verification.
- [x] Backfill 14/08 manual verification.
- [x] Backfill 15/08 manual verification.
- [x] Confirm all four historical entries exist exactly once in the Finance Agent Log.

### Exceptional Operational Differences ✅ Policy Defined

- [x] Keep automatic rules focused on routine, repeatable differences.
- [x] Do not invent special automation for rare operational anomalies.
- [x] Leave larger unexplained settlement differences for human investigation.
- [x] Preserve explanatory Notes for manually resolved exceptions.
- [x] Allow supporting physical records, invoices, owner reports and driver diary notes to explain exceptional cases.
- [x] Use manual verification when the evidence is sufficient but unsuitable for a general automatic rule.

### Real Manual Cases ✅ Resolved

- [x] 06/07 — EFTPOS terminal failure caused the driver report and CTL remittance not to reconcile.
- [x] 13/07 — TSS/EFTPOS error resulted in CTL invoice `INV-14272` for AUD 3.50, subsequently paid.
- [x] 14/08 — Split shift across CTL and Taxi 99; Taxi 99 owner report and separate remittance reviewed.
- [x] 15/08 — Split shift across CTL and Taxi 99; separate remittance reviewed; Account Booking ref `8176745` confirmed paid.
- [x] Preserve the supporting Taxi 99 owner paperwork with business records.

---

## Phase 9 – Finance Agent Logging 🚧 In Progress

### Verification Audit Trail ✅ Complete

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
- [x] Record `(ROUNDING_TOLERANCE)` when a one-cent match is accepted.
- [x] Preserve a supplied source for manual verification.
- [x] Add historical MANUAL audit backfill.
- [x] Prevent duplicate MANUAL backfill records.
- [x] Confirm historical manual audit coverage for 06/07, 13/07, 14/08 and 15/08.

### Logging Hardening 🚧 In Progress

- [x] Improve atomicity between ledger Status updates and audit-log writes.
- [x] Add recovery handling if a Status update succeeds but audit logging fails.
- [ ] Add recovery handling if an audit write succeeds but a related future operation fails.
- [x] Define duplicate-protection strategy for broader Finance Agent log actions.

### Future Logging 🚧 In Progress

- [x] Record broader email-processing actions.
- [ ] Record backup actions.
- [ ] Record export actions.
- [ ] Record reconciliation review outcomes.
- [ ] Record processing errors.
- [ ] Include relevant report or document references where appropriate.
- [ ] Decide whether the Finance Agent Log should remain visible or hidden during normal use.

---

## Phase 10 – Invoice and Expense Reconciliation 📋 Next

### CTL Invoice Reconciliation

- [ ] Process validated Cairns Taxis invoice records.
- [ ] Preserve invoice number.
- [ ] Preserve invoice date.
- [ ] Preserve due date.
- [ ] Preserve invoice reference.
- [ ] Preserve amount due.
- [ ] Keep invoice customer identifiers separate from shift references.
- [ ] Identify the related shift or operational event where possible.
- [ ] Track whether the invoice has subsequently been paid.
- [ ] Preserve payment evidence.
- [ ] Prevent duplicate invoice records.
- [ ] Flag conflicting invoice data for review.
- [ ] Flag overdue unpaid invoices for review.

### Expense Workflow

- [ ] Define where business expenses will be recorded.
- [ ] Distinguish income reconciliation from amounts payable.
- [ ] Define how expenses payable to Cairns Taxis are represented.
- [ ] Preserve supplier/payee information.
- [ ] Preserve invoice, receipt and document references.
- [ ] Preserve GST-relevant information where available.
- [ ] Attach or reference supporting Gmail/document evidence.
- [ ] Prevent duplicate expense records.
- [ ] Define manual review and approval rules.
- [ ] Define how paid expenses are marked and audited.

### Review and Reporting

- [ ] Flag missing transactions.
- [ ] Flag conflicting totals.
- [ ] Flag duplicate transactions.
- [ ] Identify repeated discrepancies for investigation.
- [ ] Produce reconciliation summaries.
- [ ] Allow reviewed discrepancies to be resolved explicitly and traceably.

---

## Phase 11 – Shift Mate Usability and Financial-Year Automation 📋 Planned

### Financial-Year Rollover

- [ ] Remove the hard-coded FY start year `2026`.
- [ ] Detect or configure the active financial year.
- [ ] Create the next financial-year workbook when required.
- [ ] Apply correct monthly worksheet names automatically.
- [ ] Preserve the July–June financial-year structure.
- [ ] Ensure Shift Mate automatically targets the correct workbook.
- [ ] Ensure Agent 001 automatically targets the correct workbook.
- [ ] Handle year transition without requiring code changes.

### User-Facing Finance Controls

- [ ] Define the final user-facing manual verification workflow beyond the development CLI.
- [ ] Provide a simple review queue for unresolved Finance Agent items.
- [ ] Allow a user to add a manual verification explanation.
- [ ] Show automatic versus manual verification clearly.
- [ ] Surface `Review Required` records without exposing technical implementation details.
- [ ] Add a Finance Agent dashboard.

### Report Editing

- [ ] Add a supported way to edit an existing Shift Mate report.
- [ ] Preserve Report ID when editing.
- [ ] Recalculate the monthly ledger correctly after edits.
- [ ] Update cloud backup after edits.
- [ ] Preserve audit history.
- [ ] Prevent accidental duplicate reports when correcting historical data.

---

## Phase 12 – Authentication and Access Control 📋 Planned

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

## Phase 13 – Future Enhancements 📋 Planned

- [ ] Export all unsynced historical reports.
- [ ] Add automatic reconciliation scheduling.
- [ ] Add monthly financial summaries.
- [ ] Add full invoice-management UI.
- [ ] Add a Google Drive archive.
- [ ] Add multi-driver support.
- [ ] Add a guided onboarding wizard.
- [ ] Add app update and data migration support.
- [ ] Create a hosted Finance Agent service.
- [ ] Continue replacing remaining legacy `Driver Companion` / `DC` naming with `Shift Mate` where safe.
- [ ] Review internal storage keys and legacy backup sheet names separately before any compatibility-sensitive rename.

---

# Completed Milestones

## Milestone 007 – Automatic Report Backup ✅ Complete

Shift Mate automatically stores every saved report in two independent locations:

- Local browser storage.
- The hidden `Shift Mate Backup` worksheet.

The backup preserves the complete report JSON and is independent of the monthly business-record export.

---

## Milestone 008 – Backup and Sync Status ✅ Complete

Shift Mate displays separate persistent states for:

- Local report saved.
- Cloud backup successful or failed.
- Monthly ledger synced or not synced.

---

## Milestone 009 – Backup Recovery ✅ Complete

Shift Mate can compare cloud backups with local reports and safely restore only reports missing from the device.

Recovery has been verified in:

- Desktop browsers.
- Mobile browsers.
- The installed production PWA.
- Mobile-network operation.

---

## Milestone 010 – Email Classification and Document Processing ✅ Complete

Finance Agent can:

- Classify Remittances, Account Bookings and Invoices.
- Download and read financial PDF attachments.
- Extract document-specific financial information.
- Compare related totals.
- Validate remittance invoice dates against payment references.
- Produce structured records.
- Mark records as `VALID` or `REVIEW_REQUIRED`.

Current automated test baseline: **97 tests across 10 test files**.

---

## Milestone 011 – CTL Remittance Reconciliation Foundation ✅ Complete

Finance Agent can:

- Read monthly and full financial-year Taxi Business Records ledgers.
- Compare validated CTL remittance payment lines with ledger Settlement values.
- Match remittance references with ledger dates.
- Route references to the correct July–June worksheet.
- Detect exact and non-matching settlements.
- Preserve the target Google Sheets row number.
- Leave uncertain matches unchanged.
- Prevent repeat verification of already `Verified` rows.

Live reconciliation has been tested against real CTL remittance records.

---

## Milestone 012 – Verification and Audit Trail ✅ Complete

Finance Agent supports:

- Automatic verification of exact CTL remittance matches.
- One-cent automatic rounding tolerance.
- `Pending → Verified` status updates.
- Idempotent repeat processing.
- A dedicated Finance Agent verification log.
- `AUTOMATIC` and `MANUAL` verification methods.
- Verification timestamps and source records.
- Protected manual verification.
- Ledger Note preservation for manual explanations.
- Safe rejection of non-Pending rows.
- Historical MANUAL audit backfill.
- Duplicate protection for historical MANUAL audit entries.

---

## Milestone 013 – Account Booking Reconciliation ✅ Complete

Finance Agent can:

- Match validated Account Booking payments across the complete financial year.
- Treat the Shift Mate report date as the authoritative work date.
- Compare official payments with the `Account Payment` ledger value.
- Preserve Account Booking references in Notes.
- Reject ambiguous matches instead of guessing.
- Require both Account Booking and CTL settlement evidence when both components are present.
- Prevent already-resolved rows from being reused.
- Re-run idempotently.

Live current-financial-year Account Booking reconciliation has been confirmed for July and August 2026.

---

# Current Milestone

## Milestone 014 – Invoice and Expense Reconciliation 📋 Next

Finance Agent will:

- Reconcile validated Cairns Taxis invoices.
- Preserve invoice number, date, due date and reference.
- Preserve amounts payable.
- Track whether invoices have been paid.
- Prevent duplicate invoice records.
- Flag overdue or conflicting invoices.
- Define and implement an expense workflow.
- Preserve supporting Gmail and document evidence.
- Keep uncertain or exceptional cases reviewable rather than guessed.

---

# Development Principles Applied to the Roadmap

- **Never guess. Always verify.**
- Automatic verification is reserved for evidence that is sufficiently clear and repeatable.
- Uncertain or exceptional cases remain reviewable.
- Routine differences are automated.
- Exceptional differences are surfaced for human investigation.
- Shift Mate remains the operational source for individual shift reports.
- The monthly ledger remains the accounting summary.
- The Finance Agent Log remains the verification audit trail.
- Financial figures are not altered merely to force reconciliation.
- Supporting records are preserved whenever a manual decision is required.
