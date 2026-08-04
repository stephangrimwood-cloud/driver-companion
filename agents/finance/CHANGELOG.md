# Changelog

All notable changes to Agent 001 are documented here.

---

# Version 0.0.3

## Added

- Google Sheets authentication.
- Google Sheets configuration loader.
- Google Sheets client.
- SheetsAgent.
- Workbook title verification.
- Google Sheets write support.
- Driver Companion export API endpoint.
- Driver Companion report mapper.
- Worksheet resolver.
- Report row writer.
- Export workflow from Driver Companion to Taxi Business Records.
- Initial worksheet status support (`Pending`).

## Changed

- Replaced test cell writing with row-based worksheet updates.
- Export workflow now targets the correct worksheet automatically.
- Reports are written to the correct day rather than appended to the end of the sheet.
- Workbook totals and summary calculations now update automatically following an export.

## Engineering

- Introduced `mapper.ts` to separate business rules from Google Sheets logic.
- Introduced `worksheet.ts` to isolate workbook layout knowledge.
- Separated responsibilities between:
  - Mapper
  - Worksheet Resolver
  - SheetsAgent
  - Export API

## Milestone

**Milestone 006 — First End-to-End Export**

Driver Companion can now export completed shift reports directly into the Taxi Business Records workbook.

The complete workflow is now operational:

Driver Companion → Export API → Mapper → Worksheet Resolver → SheetsAgent → Google Sheets

This represents the first successful end-to-end integration between Driver Companion, Agent 001 and Taxi Business Records.

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