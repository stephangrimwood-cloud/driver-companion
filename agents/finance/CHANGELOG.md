# Changelog

All notable changes to Agent 001 are documented here.

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

Driver Companion can now recover missing reports from its Google Sheets backup and safely return them to the current device.

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

This milestone establishes a working disaster-recovery process for Driver Companion reports while protecting the integrity of existing local data.

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

- Introduced `parser.ts` to safely convert backup JSON into Driver Companion report objects.
- Introduced `comparer.ts` to compare local reports against cloud backups.
- Introduced `restore.ts` to isolate recovery logic from the Reports page.
- Reduced coupling between the user interface and Finance Agent.
- Improved type safety by comparing reports using Report ID references.
- Established the foundation for full disaster recovery.

---

## Milestone

### **Milestone 008 — Cloud Recovery Foundation** ✅

Driver Companion can now safely inspect cloud backups without modifying local data.

Recovery now follows a dedicated pipeline:

```
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
- Driver Companion export API endpoint.
- Driver Companion report mapper.
- Worksheet resolver.
- Monthly worksheet row writer.
- Automatic worksheet selection.
- Initial worksheet status support (`Pending`).

### Driver Companion Backup

- Dedicated Driver Companion backup API endpoint.
- Hidden **Driver Companion Backup** worksheet.
- Automatic report backup when **Save Report** is pressed.
- Report ID tracking.
- Backup timestamp storage.
- Application version storage.
- Complete Driver Companion JSON backup.
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

  - Driver Companion
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

Driver Companion successfully exports completed shift reports directly into the Taxi Business Records workbook.

Workflow:

```
Driver Companion
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

Driver Companion now automatically protects every saved report.

Every report is stored in two independent locations:

- Local browser storage.
- Hidden **Driver Companion Backup** worksheet.

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
- Xero remittance documents include a unique payment reference suitable for future reconciliation with Driver Companion and Taxi Business Records.

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