# Agent 001 – Engineering Principles

These principles guide the design and implementation of Agent 001 – Cairns Taxis Finance.

If a future feature conflicts with these principles, the principles take precedence.

---

## Principle 1 — Preserve Original Data

Shift Mate data is never silently or automatically rewritten by Agent 001.

Agent 001 validates Shift Mate records against official Cairns Taxis financial documents and Taxi Business Records.

If differences are found:

- The original Shift Mate values remain unchanged.
- The relevant record is marked as requiring review.
- The discrepancy is recorded clearly.
- Official references and amounts are preserved.
- Any later correction must be explicit and traceable.

Agent 001 verifies data.

It does not rewrite history.

---

## Principle 2 — Respect the Source of Truth

Each value has an authoritative source.

Examples:

- Shift Mate → Shift and driver-entered operational data.
- Gmail / Xero → Official remittances, Account Booking payments and invoices.
- Taxi Business Records → Accounting ledger and audit trail.
- Shift Mate Backup → Independent recovery copy of complete reports.
- Local browser storage → Current working copy used by Shift Mate.

Agent 001 must not invent, replace or duplicate authoritative data unnecessarily.

When two authoritative sources disagree, the conflict is recorded and flagged for review rather than resolved through assumption.

---

## Principle 3 — Never Guess

If information cannot be verified, it is never assumed.

Unknown, incomplete or conflicting values are marked:

```text
REVIEW_REQUIRED
```

Missing information must remain visibly missing until a reliable source supplies it.

Agent 001 must never fabricate:

- Dates.
- Amounts.
- Reference numbers.
- Booking numbers.
- Invoice numbers.
- Payment status.
- Reconciliation outcomes.

---

## Principle 4 — Validate Before Accepting

A financial record is accepted only when its required information is present and its relevant totals agree.

Examples include:

- Remittance email subject total.
- Remittance PDF total.
- Remittance payment-line total.
- Account Booking email subject total.
- Account Booking PDF total.
- Invoice amount due.
- Invoice total.

A successfully parsed document is not automatically a valid document.

Records receive one of two validation states:

### `VALID`

Required information was found and all relevant checks passed.

### `REVIEW_REQUIRED`

Information is missing, incomplete, inconsistent or cannot be verified safely.

---

## Principle 5 — Keep Financial Document Types Separate

Remittances, Account Booking payments and invoices serve different purposes and use different document structures.

They must be classified, parsed and reconciled separately.

Agent 001 must not:

- Treat an invoice as income.
- Treat an Account Booking payment as a standard remittance.
- Treat a customer identifier as an invoice reference.
- Apply one document parser indiscriminately to every financial email.

Shared helpers are acceptable only where the underlying meaning is genuinely the same.

---

## Principle 6 — Record Facts and Explain Differences

Differences are never hidden.

They are documented so recurring patterns can be investigated.

A review record should preserve enough information to explain:

- What Shift Mate recorded.
- What the official document recorded.
- Which values differ.
- The amount of the difference.
- The relevant payment, booking or invoice reference.
- The source document.
- When the comparison occurred.

Repeated discrepancies may reveal:

- Shift Mate calculation issues.
- Cairns Taxis processing differences.
- Business-rule changes.
- Incorrect source data.
- Software defects.
- Duplicate or missing transactions.

---

## Principle 7 — Respect the Cairns Taxis Settlement Process

Shift Mate follows the official Cairns Taxis settlement-envelope process.

Settlement values have meaning.

### Negative settlement

Cairns Taxis owes the driver.

This represents money payable to the driver and is exported to Taxi Business Records as a positive Settlement income value.

### Positive settlement

The driver owes Cairns Taxis.

This is not treated as income. It belongs to a separate expenses, reimbursements or accounts-payable workflow.

The original Shift Mate report is never modified.

The mapper translates Shift Mate values into the format required by Taxi Business Records. It must not alter the underlying financial record.

---

## Principle 8 — Separate Working Data, Accounting Data and Backup Data

Shift Mate, Taxi Business Records and cloud backup have different responsibilities.

### Shift Mate

Records the driver's shift information and remains the working source for local reports.

### Taxi Business Records

Preserves accounting entries and reconciliation outcomes.

### Shift Mate Backup

Stores complete report JSON independently of the monthly ledger.

Backup and monthly-ledger export must remain separate operations.

A successful backup does not mean a report has been exported.

A successful export does not mean a report has been backed up.

Each state must be stored and displayed separately.

---

## Principle 9 — Restore Safely

Standard cloud restoration must restore only reports missing from the current device.

The restore process must:

- Preserve all existing local reports.
- Match reports using Report ID.
- Prevent duplicate Report IDs.
- Reject malformed or incomplete backup records.
- Avoid overwriting local reports automatically.
- Sort restored reports consistently.
- Report what was restored and what was skipped.

Any future replace-all recovery option must require explicit warning and confirmation and must create a safety backup first.

Recovery must favour preservation over convenience.

---

## Principle 10 — Prevent Duplicate Processing

The same report, email, payment or official document must not be applied more than once.

Duplicate protection should use the strongest available identifiers, including:

- Shift Mate Report ID.
- Gmail message ID.
- Remittance reference.
- Account Booking reference.
- Invoice number.
- Invoice reference.
- Shift date and amount where no stronger identifier is available.

A duplicate must be ignored or flagged for review, never silently recorded again.

---

## Principle 11 — Maintain an Audit Trail

Important automated actions must be traceable.

The system should preserve:

- Source message identifiers.
- Sender information.
- Email dates.
- Attachment metadata.
- Official reference numbers.
- Validation results.
- Reconciliation outcomes.
- Backup timestamps.
- Export timestamps.
- Errors and review decisions.

The audit trail should explain what Agent 001 did without requiring access to its internal implementation.

---

## Principle 12 — Protect Credentials and Financial Documents

OAuth credentials, refresh tokens, service-account credentials and downloaded financial documents must not be committed to Git.

Protected information must be stored using:

- Local development secrets.
- Environment variables.
- Approved secure configuration.
- Ignored local directories for downloaded documents.

Logs must avoid exposing secrets or unnecessary personal financial information.

Only the minimum information required for diagnosis should be displayed.

---

## Principle 13 — Small, Testable Components

Every component should have one clear responsibility.

Examples:

- `GmailAgent` → Search, read and classify Gmail financial messages.
- Document extractors → Parse one specific financial field.
- Record builders → Produce structured validated financial records.
- Mapper → Convert Shift Mate data into worksheet-ready values.
- Worksheet resolver → Determine the correct monthly sheet and row.
- `SheetsAgent` → Communicate with Google Sheets.
- Parser → Validate and convert backup JSON.
- Comparer → Compare cloud and local reports.
- Restore helper → Merge missing reports safely.
- Finance Agent coordinator → Orchestrate the complete workflow.

Components should be independently testable wherever practical.

---

## Principle 14 — One Feature, One Test, One Result

Development proceeds in small verified steps.

For each feature:

1. Define the expected behaviour.
2. Add or update a focused test.
3. Confirm the expected failure where appropriate.
4. Implement the smallest correct change.
5. Run the test suite.
6. Verify the real workflow when external services are involved.
7. Update documentation.
8. Commit only when the working tree is correct.

Passing tests are required, but real Gmail, Google Sheets and production checks remain necessary for integration work.

---

## Principle 15 — Prefer Clear Code Over Clever Code

Agent 001 should remain understandable to a future maintainer.

Prefer:

- Explicit names.
- Small functions.
- Visible business rules.
- Straightforward control flow.
- Document-specific types.
- Clear validation states.
- Simple error handling.

Avoid:

- Hidden side effects.
- Unnecessary abstraction.
- Premature generalisation.
- Compressed code that obscures financial meaning.
- Complexity added only for theoretical future use.

---

## Principle 16 — Fail Safely

A failed email search, PDF parse, backup, export or reconciliation must not corrupt existing data.

Failure behaviour should:

- Preserve the original record.
- Avoid partial updates where possible.
- Return a clear error.
- Store useful diagnostic information.
- Mark the item for review when financial certainty is affected.
- Allow the operation to be retried safely.

The system must never report success before the operation is actually complete.

---

## Principle 17 — Documentation Is Part of the System

The following documents must remain aligned with implemented behaviour:

- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `PRINCIPLES.md`

Documentation must reflect:

- Current capabilities.
- Current milestone.
- Completed work.
- Validation rules.
- Known limitations.
- Test status.
- Important discoveries.

A feature is not fully complete until its documentation is updated.

---

# Engineering Standard

Shift Mate records reality.

Agent 001 verifies reality.

Taxi Business Records preserve reality.

Cloud backup protects reality.

Present facts.

Preserve originals.

Never guess.

Always verify.

If uncertain, flag for review.
