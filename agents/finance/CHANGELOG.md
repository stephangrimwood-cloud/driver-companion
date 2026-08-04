# Changelog

All notable changes to Agent 001 are documented here.

---

## Version 0.0.2

### Added

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

### Changed

- Authentication workflow now supports automatic re-authentication using the stored refresh token.
- Finance Agent now searches Gmail using configurable search queries.
- Email output simplified from raw API responses to key header information:
  - From
  - Subject
  - Date

### Discovered

- Cairns Taxis remittance notifications are delivered via Xero.
- Remittance emails include useful metadata within the subject line.
- Xero remittance documents include a unique payment reference suitable for future reconciliation with Driver Companion and Taxi Business Records.

---

## Version 0.0.1

### Added

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