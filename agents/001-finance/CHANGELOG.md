# Changelog

All notable changes to Agent 001 are documented here.

---

# Version 0.0.6

## Added

### Email Classification

- Classification of Cairns Taxis remittance emails.
- Classification of Account Booking payment emails.
- Classification of Cairns Taxis invoice emails.
- Sender verification using the recognised Xero messaging address.
- Protection against matching subjects received from unrecognised senders.
- Configurable Gmail search queries for each supported financial document type.
- Sender name and sender email extraction.
- Attachment metadata extraction.
- Payment amount extraction from remittance and Account Booking email subjects.
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
- Comparison of amount due with invoice total.
- Structured `InvoiceEmailRecord` creation.
- `VALID` and `REVIEW_REQUIRED` validation states.

---

## Changed

### Finance Agent Structure

- Renamed the Finance Agent directory:

```text
agents/finance
↓
agents/001-finance
```

- Updated Finance Agent package scripts.
- Updated application API imports.
- Updated report restoration imports.
- Updated the PDF download path.
- Updated `.gitignore` for the renamed downloads directory.
- Restarted the TypeScript server after the folder rename to clear stale module references.

### Repository

- Renamed the GitHub repository:

```text
shift-income-report-calculator
↓
Shift Mate
```

- Updated the local Git remote to:

```text
https://github.com/stephangrimwood-cloud/driver-companion.git
```

### Runtime

- Finance Agent now creates document-specific runtime records.
- Non-matching document types return `null` rather than creating incorrect records.
- Downloaded attachments are stored under:

```text
agents/001-finance/downloads/
```

---

## Validation

### Real Cairns Taxis Documents

The Finance Agent was verified against real examples of:

- A standard Cairns Taxis remittance.
- An Account Booking payment.
- A Cairns Taxis invoice.

The real invoice test successfully extracted:

```text
Invoice Number: INV-14272
Invoice Date: 13 Jul 2026
Due Date: 22 Jul 2026
Invoice Reference: 13072026
Amount Due: 3.50
Invoice Total: 3.50
Validation Status: VALID
```

The invoice customer identifier was kept separate from the invoice reference.

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

- Confirmed the complete test suite still passes after renaming the Finance Agent directory.
- Confirmed `npm run finance` operates successfully from the renamed directory.
- Confirmed the Git working tree is clean after committing and pushing all changes.

---

## Discoveries

- Standard Remittances, Account Booking payments and Invoices use different PDF structures.
- Account Booking PDFs contain a seven-digit booking reference.
- Invoice PDFs contain both an invoice number and a separate invoice reference.
- The customer identifier contained in an invoice email subject is not the invoice reference.
- Financial documents with missing or conflicting information must be marked for review rather than accepted automatically.
- Downloaded financial documents must remain local and must not be committed to Git.

---

## Milestone

### **Milestone 010 — Email Classification and Document Processing** ✅

Finance Agent can now:

- Search Gmail for supported Cairns Taxis financial emails.
- Classify Remittances, Account Bookings and Invoices.
- Verify recognised senders.
- Download PDF attachments.
- Extract PDF text.
- Parse document-specific financial information.
- Compare related totals.
- Produce structured financial records.
- Mark records as `VALID` or `REVIEW_REQUIRED`.

The completed processing pipeline is:

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

This milestone establishes the verified financial-document foundation required for reconciliation with Shift Mate and Taxi Business Records.

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

- The Cloud Backup Status panel now displays a Restore Reports button when cloud reports are missing locally.
- Restored reports appear immediately without requiring a manual page reload.
- Cloud, Device, and Missing counts update automatically after successful restoration.
- The restore button is hidden when no reports require recovery.

### Recovery Workflow

- The Reports page now retrieves only reports missing from the current device.
- Missing cloud reports are safely merged with existing local reports.
- Existing local reports are preserved and never overwritten by the standard restore process.
- The live restore workflow now uses the tested `mergeMissingReports()` helper.
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

### **Milestone 009 — Safe Cloud Report Restoration** ✅

Shift Mate can now recover missing reports from its Google Sheets backup and safely return them to the current device.

The completed restoration pipeline is:

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

A complete recovery was successfully confirmed on a real mobile device after its local report storage had been cleared:

```text
Cloud: 4
Device before restore: 0
Missing: 4
Reports restored: 4
Device after restore: 4
Missing after restore: 0
```

This milestone establishes a working disaster-recovery process for Shift Mate reports while protecting the integrity of existing local data.

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

- Reports page now checks cloud backup health automatically.
- Added persistent Cloud Backup Status panel.
- Reports now display whether the device is fully synchronised with cloud backups.
- Missing cloud reports are detected without modifying local storage.

### Recovery Workflow

- Restore architecture now separates:
  - Reading cloud backups.
  - Parsing report data.
  - Validation.
  - Comparison.
  - Future restoration.

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

### **Milestone 008 — Cloud Recovery Foundation** ✅

Shift Mate can now safely inspect cloud backups without modifying local data.

Recovery now follows a dedicated pipeline:

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

The application now automatically determines whether reports are missing locally and presents the result through the new **Cloud Backup Status** panel.

This milestone establishes the complete recovery foundation required for future one-click report restoration while preserving the integrity of existing local data.

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
- Hidden **Shift Mate Backup** worksheet.
- Automatic report backup when **Save Report** is pressed.
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
- Reports are now written to the correct worksheet automatically.
- Reports are written to the correct day instead of appending to the end of the worksheet.
- Workbook totals and Summary calculations now update automatically following export.

### Architecture

- Backup is now performed during **Save Report** rather than during export.
- Monthly ledger export and report backup are now completely independent workflows.
- Local browser storage remains the working copy.
- Google Sheets now provides an independent cloud backup.

---

## Engineering

- Introduced `mapper.ts` to isolate business rules.
- Introduced `worksheet.ts` to isolate workbook layout logic.
- Introduced dedicated Backup API endpoint.
- Separated responsibilities between:

  - Shift Mate
  - Backup API
  - Export API
  - Mapper
  - Worksheet Resolver
  - SheetsAgent

- Eliminated duplicate backup logic from the export pipeline.
- Established clear separation between:

  - Business record export.
  - Disaster recovery backup.

---

## Milestone

### **Milestone 006 — First End-to-End Export** ✅

Shift Mate successfully exports completed shift reports directly into the Taxi Business Records workbook.

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

### **Milestone 007 — Automatic Report Backup** ✅

Shift Mate now automatically protects every saved report.

Every report is stored in two independent locations:

- Local browser storage.
- Hidden **Shift Mate Backup** worksheet.

The complete report JSON is preserved, allowing future restoration without relying on browser storage.

Business record exports are now independent of backups, providing a clear separation between accounting and disaster recovery.

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
- Initial remittance email discovery.
- Additional authentication unit tests.

## Changed

- Authentication workflow now supports automatic re-authentication using the stored refresh token.
- Finance Agent now searches Gmail using configurable search queries.
- Email output simplified from raw API responses to key header information:
  - From
  - Subject
  - Date

## Discovered

- Cairns Taxis remittance notifications are delivered via Xero.
- Remittance emails include useful metadata within the subject line.
- Xero remittance documents include a unique payment reference suitable for future reconciliation with Shift Mate and Taxi Business Records.

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

**Milestone 001 — Google Authentication**

Agent 001 successfully authenticated with Google services using OAuth and established the foundation for Gmail and Google Sheets integration.
