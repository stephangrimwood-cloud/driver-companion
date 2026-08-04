# Changelog

All notable changes to Agent 001 are documented here.

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