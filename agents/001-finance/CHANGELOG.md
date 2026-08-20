# Changelog

All notable changes to Agent 001 – Cairns Taxis Finance and the related Shift Mate finance integration are documented here.

---

# Unreleased

## Summary

The current development cycle completes the core Settlement and Account Booking reconciliation workflow.

Agent 001 can now:

- Read the complete July–June financial-year ledger.
- Route financial records to the correct monthly worksheet.
- Reconcile validated CTL Remittances.
- Accept an explicit one-cent rounding tolerance.
- Reconcile Account Booking payments separately.
- Require all relevant income components to be confirmed before automatic verification.
- Support protected manual verification for real-world exceptions.
- Preserve manual explanations in ledger Notes.
- Maintain `AUTOMATIC` and `MANUAL` verification audit records.
- Safely backfill missing historical manual audit records.
- Re-run reconciliation without duplicating completed work.

Current automated test baseline:

```text
Test Files  10 passed (10)
Tests       97 passed (97)
```

---

## Added

### Financial-Year Reconciliation Routing

- Added July–June financial-year worksheet ordering.
- Added helpers to resolve a payment reference to the correct monthly worksheet.
- Added validation of the year component contained in financial references.
- July–December references route to the financial-year start year.
- January–June references route to the following calendar year.
- Added full-financial-year ledger reading through `SheetsAgent`.
- Reconciliation now loads all 12 monthly worksheets rather than targeting a single development month.
- References outside the selected financial year are rejected instead of being forced into a worksheet.

### Gmail Financial-Year Processing

- Added Gmail pagination for Finance Agent searches.
- Removed reliance on the original limited recent-message result set.
- Added current-financial-year filtering using Gmail search criteria.
- Applied financial-year filtering to Remittance processing.
- Applied financial-year filtering to Account Booking processing.
- Confirmed July and August 2026 records can be processed in the same Finance Agent run.

### Account Booking Reconciliation

- Added a dedicated Account Booking matcher.
- Added financial-year-wide Account Booking matching.
- Shift Mate report date is treated as the authoritative work date.
- Invoice date and payment date are treated as supporting payment-processing evidence.
- Account Booking payments are matched against the ledger `Account Payment` value.
- Seven-digit Account Booking references are preserved as supporting evidence.
- Confirmed Account Booking details are appended to ledger Notes.
- Matching searches only unresolved `Pending` rows.
- Ambiguous candidates are rejected rather than selected arbitrarily.
- Finance Agent re-reads the financial-year ledgers after Account Booking evidence is added.
- Account Booking evidence alone does not verify a row that still has unresolved Settlement income.
- Confirmed live Account Booking reconciliation for:
  - Ref `8091343` — July 2026.
  - Ref `8176745` — August 2026.
- Repeat Account Booking processing is idempotent.

### All-Components Verification Rule

- Added explicit verification logic for ledger rows containing multiple income components.
- Rows without Account Payment may verify when CTL Settlement is confirmed.
- Rows containing Account Payment require:
  - Confirmed Account Booking evidence.
  - Confirmed CTL Settlement evidence.
- A confirmed Account Booking payment cannot independently verify the entire shift.
- Rows remain `Pending` whenever required evidence remains unresolved.

### One-Cent Remittance Rounding Tolerance

- Added integer-cent Settlement comparison.
- Added explicit Remittance matching results:
  - `EXACT`
  - `ROUNDING_TOLERANCE`
  - `NO_MATCH`
- A difference of exactly one cent may be automatically verified.
- Differences greater than one cent remain unresolved for investigation.
- Ledger financial figures are never altered to absorb the rounding difference.
- Automatic audit records include `(ROUNDING_TOLERANCE)` when the tolerance is used.
- Live one-cent cases confirmed:
  - 31/07.
  - 02/08.

### Protected Manual Verification Workflow

- Extended protected manual verification into a complete ledger workflow.
- Manual verification:
  - Reads the current ledger Status first.
  - Requires the row to be `Pending`.
  - Appends the supplied explanation to ledger Notes.
  - Changes `Pending → Verified`.
  - Writes a `MANUAL` Finance Agent Log record.
  - Preserves the supplied evidence/source description.
- Already-Verified rows are left completely unchanged.
- Added dedicated mocked Google Sheets tests for the manual verification workflow.

### Historical Manual Audit Backfill

- Added `backfillManualVerificationRecord()`.
- Historical backfill is audit-only.
- Backfill requires the target row to already be `Verified`.
- Backfill does not modify:
  - Ledger Notes.
  - Ledger Status.
  - Cash.
  - Settlement.
  - Account Payment.
  - Total Income.
- Existing Finance Agent Log records are checked before writing.
- Duplicate `MANUAL` backfill records are prevented.
- Historical manual audit entries were successfully added for:
  - 06/07.
  - 13/07.
  - 14/08.
  - 15/08.
- Final live Finance Agent Log review confirmed each historical manual entry exists exactly once.

### Ledger Note Preservation

- Added safe Note-appending support.
- Existing ledger Notes are preserved.
- New evidence is appended rather than replacing existing content.
- Duplicate Note text is not added again.

### Same-Day Shift Aggregation

- Shift Mate now supports multiple separate reports on the same calendar date.
- Each Shift Mate report remains independent and retains its own Report ID.
- Taxi Business Records continues to use one row per calendar date.
- Same-day report values are aggregated before export.
- Re-export rewrites the existing daily row rather than creating duplicate dates.
- Underlying Shift Mate report detail remains preserved independently.

### Monthly Ledger Methodology

- Formalised the daily ledger methodology:
  - `Cash = Cash Taken - Area Charge`
  - `Total Income = Cash + Settlement + Account Payment`
- Cash may legitimately differ from physical cash handled.
- Cash may be negative when Area Charges exceed Cash Taken.
- Original Cash Taken and Area Charge values remain preserved in Shift Mate.
- Added documentation work to place a permanent visible methodology note on monthly worksheets for accountant/ATO review.

### Cloud Backup Deletion

- Report deletion now removes the matching Google Sheets cloud backup.
- Prevents intentionally deleted reports from being offered later as missing reports during restore.
- Local report deletion and cloud-backup deletion behaviour were tested together.

---

## Changed

### CTL Remittance Reconciliation

- Automatic CTL verification is no longer limited to exact matches only.
- Exact matches and defined one-cent tolerance matches can both verify automatically.
- Larger differences remain unresolved.
- Reconciliation now operates across the complete selected financial year.
- CTL Remittance processing remains restricted to internally `VALID` documents.
- Malformed or inconsistent Remittances remain excluded from automatic verification.
- Repeat reconciliation remains idempotent.

### Verification Audit Trail

- Verification now clearly distinguishes:
  - `AUTOMATIC`
  - `MANUAL`
- Automatic records preserve the source Gmail message ID.
- Rounding-tolerance records preserve the Gmail message ID plus `(ROUNDING_TOLERANCE)`.
- Manual records preserve the supplied investigation/evidence description.
- Historical manually verified rows can now receive missing audit entries without rewriting the ledger.

### Manual Exception Policy

- Rare operational anomalies are no longer candidates for increasingly complex automatic matching rules.
- Routine, repeatable differences may be automated.
- Exceptional differences remain human-reviewed.
- Supporting physical or operational evidence may be used for manual verification.
- Examples include:
  - EFTPOS terminal failures.
  - TSS/EFTPOS errors.
  - Split shifts.
  - Mixed vehicles.
  - Mixed operators.
  - Separate owner payments.

Working policy:

> Routine differences are automated. Exceptional differences are surfaced for human investigation.

### Finance Agent Runtime

- Finance Agent now:
  1. Reads all financial-year ledgers.
  2. Processes Account Booking evidence.
  3. Re-reads the ledgers.
  4. Processes CTL Remittance reconciliation.
- Account Booking and CTL Settlement remain independent evidence streams.
- Gmail processing now supports pagination and financial-year filtering.
- The previous August-only reconciliation path has been replaced by financial-year routing.

### Shift Mate Export

- Multiple reports with the same shift date are aggregated into a single daily ledger row.
- The monthly ledger remains an accounting summary rather than a duplicate of each operational report.
- Shift Mate preserves individual report values and IDs.

### Documentation

Rewritten and updated:

- `ROADMAP.md`
- `README.md`
- `PRINCIPLES.md`
- `CHANGELOG.md`

Documentation now reflects:

- Full financial-year routing.
- CTL Remittance reconciliation.
- One-cent rounding tolerance.
- Account Booking reconciliation.
- All-components verification.
- Manual verification.
- Historical audit backfill.
- Exceptional operational difference policy.
- Same-day shift aggregation.
- Current 97-test baseline.
- Invoice and Expense reconciliation as the next development area.

---

## Validation

### Automatic CTL Remittance Verification

Live exact-match verification confirmed for:

- 09/07.
- 10/07.
- 11/07.
- 12/07.
- 24/07.
- 25/07.
- 26/07.
- 27/07.
- 01/08.
- 03/08.
- 16/08.
- 17/08.

Live one-cent rounding-tolerance verification confirmed for:

- 31/07.
- 02/08.

Each accepted tolerance case preserved the original ledger figure and recorded `(ROUNDING_TOLERANCE)` in the automatic audit source.

### Account Booking Verification

Live Account Booking evidence confirmed for:

- 27/07 — ref `8091343`, payment confirmed 28 Jul 2026.
- 15/08 — ref `8176745`, payment confirmed 17 Aug 2026.

Account Booking evidence was preserved in ledger Notes.

### Historical Manual Cases

The following exceptional cases were investigated and manually verified:

#### 06/07

- EFTPOS terminal failure.
- Driver report and CTL Remittance did not reconcile.
- Ledger explanation preserved.
- `MANUAL` audit record backfilled.

#### 13/07

- TSS/EFTPOS error during shift.
- Cairns Taxis invoice `INV-14272` for AUD 3.50.
- Invoice subsequently paid.
- Ledger explanation preserved.
- `MANUAL` audit record backfilled.

#### 14/08

- Split shift across CTL and Taxi 99.
- Taxi 99 owner shift report reviewed.
- Separate owner payment reviewed.
- CTL portion settled separately.
- `MANUAL` audit record backfilled.

#### 15/08

- Split shift across CTL and Taxi 99.
- Taxi 99 owner shift report reviewed.
- Separate owner payment reviewed.
- CTL portion settled separately.
- Account Booking ref `8176745` confirmed paid.
- `MANUAL` audit record backfilled.

### Audit Review

Final live `Finance Agent Log` review confirmed:

- Automatic verification records remain intact.
- Rounding-tolerance records remain identifiable.
- Four historical `MANUAL` records are present.
- No duplicate historical `MANUAL` entries were created.

### Duplicate Account Booking Correction

A historical duplicate Account Payment entry was identified during bulk report review:

- Correct Account Booking payment:
  - 27/07 — AUD 19.70.
- Incorrect duplicate:
  - 31/07 — AUD 19.70.

The underlying Shift Mate record was corrected and re-exported.

July now correctly contains a single AUD 19.70 Account Payment.

---

## Engineering

- Added financial-year worksheet helpers.
- Added full-financial-year ledger reading.
- Added Account Booking financial-year matcher.
- Added integer-cent Remittance comparison.
- Added one-cent rounding-tolerance test coverage.
- Added complete manual-verification workflow tests.
- Added historical manual-audit backfill tests.
- Added duplicate historical audit protection.
- Added mocked Google Sheets read/update/append coverage.
- Confirmed full test suite:

```text
Test Files  10 passed (10)
Tests       97 passed (97)
```

Recent reconciliation commits include:

- Financial-year reconciliation routing.
- Remittance rounding tolerance.
- Manual verification audit workflow.
- Manual verification audit backfill.

---

## Current Development Limitations

The core Settlement and Account Booking reconciliation workflow is complete.

Remaining development limitations include:

- Invoice reconciliation is not yet implemented.
- Expense reconciliation is not yet implemented.
- The active financial-year start year is still fixed to `2026` in the current service implementation.
- Financial-year rollover is not yet dynamic.
- The final user-facing manual-review interface has not yet been built; the protected development CLI remains available.
- Ledger verification and audit logging use separate Google Sheets writes and should receive additional recovery/atomicity hardening.
- Report editing is not yet a supported end-user workflow.
- A permanent visible monthly-ledger methodology note still needs to be added to the workbook.
- Remaining compatibility-safe legacy `Driver Companion` / `DC` naming should continue to migrate to `Shift Mate`.

---

## Next Milestone

### Milestone 014 — Invoice and Expense Reconciliation 📋

Planned work:

- Reconcile validated Cairns Taxis Invoices.
- Preserve Invoice number, date, due date and reference.
- Preserve amounts payable.
- Track whether Invoices have subsequently been paid.
- Preserve payment evidence.
- Prevent duplicate Invoice records.
- Flag overdue or conflicting Invoices for review.
- Define the business Expense workflow.
- Preserve supplier, receipt and supporting-document references.
- Preserve GST-relevant information where available.
- Keep uncertain or exceptional Expense records reviewable rather than guessed.

---

# Version 0.0.6

## Added

### Email Classification

- Classification of Cairns Taxis Remittance emails.
- Classification of Account Booking payment emails.
- Classification of Cairns Taxis Invoice emails.
- Sender verification using the recognised Xero messaging address.
- Protection against matching subjects received from unrecognised senders.
- Configurable Gmail search queries for each supported financial document type.
- Sender name and sender email extraction.
- Attachment metadata extraction.
- Payment amount extraction from Remittance and Account Booking email subjects.
- Customer payment reference extraction.

### PDF Document Processing

- Automatic download of Gmail PDF attachments.
- Local storage of downloaded financial documents.
- PDF text extraction using `pdf-parse`.
- Git exclusion for downloaded financial documents.

### Remittance Processing

- Remittance payment-line extraction.
- Payment date extraction.
- Shift reference extraction.
- Invoice-date extraction from payment lines.
- Invoice-total extraction.
- Amount-paid extraction.
- Remaining-balance extraction.
- PDF total-paid extraction.
- Comparison of:
  - Email subject total.
  - PDF total.
  - Payment-line total.
- Structured `RemittanceEmailRecord` creation.
- `VALID` and `REVIEW_REQUIRED` validation states.

### Account Booking Processing

- Account Booking payment-date extraction.
- Account Booking PDF-total extraction.
- Seven-digit booking-reference extraction.
- Comparison of email subject totals with PDF totals.
- Structured `AccountBookingEmailRecord` creation.
- `VALID` and `REVIEW_REQUIRED` validation states.

### Invoice Processing

- Invoice-number extraction.
- Invoice-date extraction.
- Invoice due-date extraction.
- Invoice-reference extraction.
- Amount-due extraction.
- Invoice-total extraction.
- Comparison of amount due with Invoice total.
- Structured `InvoiceEmailRecord` creation.
- `VALID` and `REVIEW_REQUIRED` validation states.

---

## Changed

### Finance Agent Structure

Renamed the Finance Agent directory:

```text
agents/finance
↓
agents/001-finance
```

Updated:

- Finance Agent package scripts.
- Application API imports.
- Report restoration imports.
- PDF download path.
- `.gitignore` for the renamed downloads directory.

The TypeScript server was restarted after the folder rename to clear stale module references.

### Repository

Repository naming was updated during the Shift Mate rename work.

The configured Git remote remained:

```text
https://github.com/stephangrimwood-cloud/driver-companion.git
```

### Runtime

- Finance Agent creates document-specific runtime records.
- Non-matching document types return `null` rather than creating incorrect records.
- Downloaded attachments are stored under:

```text
agents/001-finance/downloads/
```

---

## Validation

### Real Cairns Taxis Documents

Finance Agent was verified against real examples of:

- A standard Cairns Taxis Remittance.
- An Account Booking payment.
- A Cairns Taxis Invoice.

The real Invoice test successfully extracted:

```text
Invoice Number: INV-14272
Invoice Date: 13 Jul 2026
Due Date: 22 Jul 2026
Invoice Reference: 13072026
Amount Due: 3.50
Invoice Total: 3.50
Validation Status: VALID
```

The Invoice customer identifier was kept separate from the Invoice reference.

---

## Engineering

- Added document-specific record types.
- Added document-specific validation-status types.
- Added extraction methods for all currently supported financial fields.
- Added validation for missing required fields.
- Added validation for conflicting totals.
- Added runtime verification using Gmail and real PDF attachments.
- Increased automated test coverage to:

```text
Test Files  7 passed
Tests       74 passed
```

- Confirmed the complete test suite still passed after renaming the Finance Agent directory.
- Confirmed `npm run finance` operated successfully from the renamed directory.
- Confirmed the Git working tree was clean after committing and pushing all changes.

---

## Discoveries

- Standard Remittances, Account Booking payments and Invoices use different PDF structures.
- Account Booking PDFs contain a seven-digit booking reference.
- Invoice PDFs contain both an Invoice number and a separate Invoice reference.
- The customer identifier contained in an Invoice email subject is not the Invoice reference.
- Financial documents with missing or conflicting information must be marked for review rather than accepted automatically.
- Downloaded financial documents must remain local and must not be committed to Git.

---

## Milestone

### Milestone 010 — Email Classification and Document Processing ✅

Finance Agent can:

- Search Gmail for supported Cairns Taxis financial emails.
- Classify Remittances, Account Bookings and Invoices.
- Verify recognised senders.
- Download PDF attachments.
- Extract PDF text.
- Parse document-specific financial information.
- Compare related totals.
- Produce structured financial records.
- Mark records as `VALID` or `REVIEW_REQUIRED`.

The completed processing pipeline:

```text
Gmail
  │
  ▼
Search Query
  │
  ▼
Email Classification
  │
  ▼
Sender Verification
  │
  ▼
Attachment Metadata
  │
  ▼
PDF Download
  │
  ▼
PDF Text Extraction
  │
  ▼
Document-Specific Parser
  │
  ▼
Structured Financial Record
  │
  ▼
Validation
  │
  ├── VALID
  │
  └── REVIEW_REQUIRED
```

This milestone established the financial-document foundation required for reconciliation with Shift Mate and Taxi Business Records.

---

# Version 0.0.5

## Added

### Safe Cloud Restoration

- One-click restoration of reports missing from the current device.
- Restore progress state on the Reports page.
- Restore completion message showing the number of reports recovered.
- Tested report merge helper.
- Duplicate protection for reports already stored locally.
- Duplicate protection for repeated Report IDs within cloud backup data.
- Automatic newest-first ordering after restoration.
- Unit tests for the report merge process.

---

## Changed

### Reports

- The Cloud Backup Status panel displays a Restore Reports button when cloud reports are missing locally.
- Restored reports appear immediately without requiring a manual page reload.
- Cloud, Device and Missing counts update automatically after successful restoration.
- The restore button is hidden when no reports require recovery.

### Recovery Workflow

- The Reports page retrieves only reports missing from the current device.
- Missing cloud reports are safely merged with existing local reports.
- Existing local reports are preserved and never overwritten by the standard restore process.
- The live restore workflow uses the tested `mergeMissingReports()` helper.
- Restored reports are marked as successfully backed up to Google Sheets.

---

## Engineering

- Added `mergeMissingReports()` to isolate report merging from the user interface.
- Added immutable merge behaviour that does not modify the original report arrays.
- Added Report ID tracking during merging to prevent duplicate cloud records.
- Added full validation of required financial and report fields before restoration.
- Connected validated cloud data to the device `localStorage` recovery workflow.
- Increased automated test coverage to 6 test files and 22 passing tests.

---

## Milestone

### Milestone 009 — Safe Cloud Report Restoration ✅

Shift Mate can recover missing reports from its Google Sheets backup and safely return them to the current device.

The completed restoration pipeline:

```text
Reports Page
      │
      ▼
Cloud Backup Status
      │
      ▼
Restore Control
      │
      ▼
Restore Service
      │
      ▼
Backup API
      │
      ▼
SheetsAgent
      │
      ▼
Google Sheets
      │
      ▼
Parser
      │
      ▼
Full Validation
      │
      ▼
Comparer
      │
      ▼
Tested Merge Helper
      │
      ▼
Device Local Storage
      │
      ▼
Updated Reports Page
```

The workflow restores only reports that are missing from the device. Existing local reports are preserved, duplicate Report IDs are rejected, and the merged report collection is sorted newest first.

A complete recovery was successfully confirmed on a real mobile device after local report storage had been cleared:

```text
Cloud: 4
Device before restore: 0
Missing: 4
Reports restored: 4
Device after restore: 4
Missing after restore: 0
```

This milestone established a working disaster-recovery process while protecting existing local data.

---

# Version 0.0.4

## Added

### Cloud Recovery

- Backup recovery API endpoint.
- Backup JSON parser.
- Backup validation.
- Cloud backup comparison engine.
- Restore helper service.
- Cloud Backup Status panel on the Reports page.
- Automatic cloud synchronisation check when Reports opens.
- Missing report detection.
- Safe comparison using Report ID.
- Parser unit tests.
- Comparer unit tests.

---

## Changed

### Reports

- Reports page checks cloud backup health automatically.
- Added persistent Cloud Backup Status panel.
- Reports display whether the device is fully synchronised with cloud backups.
- Missing cloud reports are detected without modifying local storage.

### Recovery Workflow

Restore architecture separates:

- Reading cloud backups.
- Parsing report data.
- Validation.
- Comparison.
- Restoration.

---

## Engineering

- Introduced `parser.ts` to safely convert backup JSON into Shift Mate report objects.
- Introduced `comparer.ts` to compare local reports against cloud backups.
- Introduced `restore.ts` to isolate recovery logic from the Reports page.
- Reduced coupling between the user interface and Finance Agent.
- Improved type safety by comparing reports using Report ID references.
- Established the foundation for full disaster recovery.

---

## Milestone

### Milestone 008 — Cloud Recovery Foundation ✅

Shift Mate can safely inspect cloud backups without modifying local data.

Recovery follows a dedicated pipeline:

```text
Reports Page
      │
      ▼
Restore Service
      │
      ▼
Backup API
      │
      ▼
SheetsAgent
      │
      ▼
Google Sheets
      │
      ▼
Parser
      │
      ▼
Validation
      │
      ▼
Comparer
      │
      ▼
Cloud Status
```

This milestone established the recovery foundation required for one-click report restoration while preserving existing local data.

---

# Version 0.0.3

## Added

### Google Sheets Integration

- Google Sheets authentication.
- Google Sheets configuration loader.
- Authenticated Google Sheets client.
- `SheetsAgent`.
- Workbook title verification.
- Row-based worksheet writing.
- Shift Mate export API endpoint.
- Shift Mate report mapper.
- Worksheet resolver.
- Monthly worksheet row writer.
- Automatic worksheet selection.
- Initial worksheet status support (`Pending`).

### Shift Mate Backup

- Dedicated Shift Mate backup API endpoint.
- Hidden `Shift Mate Backup` worksheet.
- Automatic report backup when Save Report is pressed.
- Report ID tracking.
- Backup timestamp storage.
- Application version storage.
- Complete Shift Mate JSON backup.
- Update existing backups using Report ID.
- Independent cloud backup workflow.

### Testing

- Worksheet resolver unit tests.
- Report mapper unit tests.
- Authentication unit tests.
- Verified Google Sheets export workflow.
- Verified automatic backup workflow.

---

## Changed

### Export Workflow

- Replaced test-cell writing with row-based worksheet updates.
- Reports are written to the correct worksheet automatically.
- Reports are written to the correct day instead of being appended to the end of the worksheet.
- Workbook totals and Summary calculations update automatically following export.

### Architecture

- Backup is performed during Save Report rather than during export.
- Monthly ledger export and report backup are independent workflows.
- Local browser storage remains the working copy.
- Google Sheets provides an independent cloud backup.

---

## Engineering

- Introduced `mapper.ts` to isolate business rules.
- Introduced `worksheet.ts` to isolate workbook layout logic.
- Introduced dedicated Backup API endpoint.
- Separated responsibilities between:
  - Shift Mate.
  - Backup API.
  - Export API.
  - Mapper.
  - Worksheet resolver.
  - `SheetsAgent`.
- Eliminated duplicate backup logic from the export pipeline.
- Established clear separation between:
  - Business-record export.
  - Disaster-recovery backup.

---

## Milestone

### Milestone 006 — First End-to-End Export ✅

Shift Mate successfully exports completed shift reports directly into Taxi Business Records.

Workflow:

```text
Shift Mate
    │
    ▼
Export API
    │
    ▼
Mapper
    │
    ▼
Worksheet Resolver
    │
    ▼
SheetsAgent
    │
    ▼
Google Sheets
```

---

### Milestone 007 — Automatic Report Backup ✅

Shift Mate automatically protects every saved report.

Every report is stored in two independent locations:

- Local browser storage.
- Hidden `Shift Mate Backup` worksheet.

The complete report JSON is preserved, allowing future restoration without relying on browser storage.

Business-record exports are independent of backups, providing clear separation between accounting and disaster recovery.

---

# Version 0.0.2

## Added

- Refresh token storage.
- Refresh token loading.
- Authenticated Google OAuth client.
- Finance Agent runtime entry point.
- Gmail API client initialisation.
- Gmail inbox listing.
- Email retrieval by message ID.
- Email header extraction.
- Gmail search query support.
- Initial Remittance email discovery.
- Additional authentication unit tests.

## Changed

- Authentication workflow supports automatic re-authentication using the stored refresh token.
- Finance Agent searches Gmail using configurable search queries.
- Email output was simplified from raw API responses to key header information:
  - From.
  - Subject.
  - Date.

## Discovered

- Cairns Taxis Remittance notifications are delivered through Xero.
- Remittance emails include useful metadata in the subject line.
- Xero Remittance documents include a unique payment reference suitable for future reconciliation with Shift Mate and Taxi Business Records.

---

# Version 0.0.1

## Added

- Finance Agent project structure.
- Google Cloud project configuration.
- Gmail API integration.
- OAuth credential loading.
- Google OAuth client creation.
- Google authorisation URL generation.
- Unit tests for authentication.
- Local OAuth callback server.
- Automatic authorisation code capture.
- Browser-based Google authentication flow.
- OAuth authentication tests.

## Milestone

### Milestone 001 — Google Authentication ✅

Agent 001 successfully authenticated with Google services using OAuth and established the foundation for Gmail and Google Sheets integration.
