# Agent 001 – Engineering Principles

These principles guide the design and implementation of Agent 001 – Cairns Taxis Finance.

If a future feature conflicts with these principles, the principles take precedence.

---

## Principle 1 — Preserve Original Data

Shift Mate financial values are never silently or automatically rewritten by Agent 001.

Agent 001 validates Shift Mate records against official Cairns Taxis financial documents and Taxi Business Records.

If differences are found:

- The original Shift Mate values remain unchanged.
- The relevant ledger record remains unresolved until evidence is sufficient.
- The discrepancy is recorded clearly.
- Official references and amounts are preserved.
- Any later correction must be explicit and traceable.

Verification status may be updated when the required verification rules are satisfied, but the underlying financial values must remain unchanged.

Agent 001 verifies data.

It does not rewrite history.

---

## Principle 2 — Respect the Source of Truth

Each value has an authoritative source.

Examples:

- Shift Mate → Shift and driver-entered operational data.
- Gmail / Xero → Official remittances, Account Booking payments and invoices.
- Taxi Business Records → Accounting summary, ledger Notes and verification Status.
- Finance Agent Log → Verification method, timestamp and source.
- Shift Mate Backup → Independent recovery copy of complete reports.
- Local browser storage → Current Shift Mate working copy.

Agent 001 must not invent, replace or duplicate authoritative data unnecessarily.

When authoritative sources disagree, the conflict is surfaced for review rather than resolved through assumption.

---

## Principle 3 — Keep Operational, Accounting and Audit Data Distinct

Different system layers exist for different purposes.

### Shift Mate

Preserves the operational record of each individual shift.

Each report retains its own:

- Report ID.
- Shift date.
- Original financial values.
- Backup state.
- Sync state.
- Audit history.

Multiple Shift Mate reports may exist for the same calendar date.

### Taxi Business Records

Preserves the accounting summary.

Each monthly worksheet contains one row per calendar date.

Where multiple Shift Mate reports share a date, the exported financial values are aggregated into the single daily ledger row.

### Finance Agent Log

Preserves how ledger verification occurred.

A ledger Status describes the result.

The Finance Agent Log describes how that result was reached.

These layers must remain separate even when they refer to the same business activity.

---

## Principle 4 — Never Guess

If information cannot be verified, it is never assumed.

Document-level uncertainty is marked:

```text
REVIEW_REQUIRED
```

Ledger-level uncertainty remains visible through the appropriate status:

```text
Pending
Review Required
```

Missing information must remain visibly missing until a reliable source supplies it.

Agent 001 must never fabricate:

- Dates.
- Amounts.
- Reference numbers.
- Booking numbers.
- Invoice numbers.
- Payment status.
- Shift associations.
- Reconciliation outcomes.
- Verification evidence.

---

## Principle 5 — Validate Before Accepting

A financial document is accepted only when its required information is present and its relevant checks pass.

Examples include:

- Remittance email subject total.
- Remittance PDF total.
- Remittance payment-line total.
- Remittance invoice date and reference consistency.
- Account Booking email subject total.
- Account Booking PDF total.
- Invoice amount due.
- Invoice total.

A successfully parsed document is not automatically a valid document.

Records receive one of two document-validation states.

### `VALID`

Required information was found and all relevant checks passed.

### `REVIEW_REQUIRED`

Information is missing, incomplete, inconsistent or cannot be verified safely.

A `VALID` document is eligible for reconciliation.

It does not automatically mean that a ledger entry is `Verified`.

---

## Principle 6 — Separate Validation from Verification

Document validation and ledger verification are different operations and must remain separate.

### Document validation

Answers:

> Is this financial document internally complete and consistent enough to trust for reconciliation?

Possible states include:

- `VALID`
- `REVIEW_REQUIRED`

### Ledger verification

Answers:

> Has this accounting ledger entry been satisfactorily reconciled against reliable evidence?

Possible states include:

- `Pending`
- `Verified`
- `Review Required`

A document can be `VALID` without producing a `Verified` ledger entry.

A ledger entry must not become `Verified` merely because a document parsed successfully.

---

## Principle 7 — Keep Financial Document Types Separate

Remittances, Account Booking payments and invoices serve different purposes and use different document structures.

They must be classified, parsed and reconciled separately.

Agent 001 must not:

- Treat an invoice as income.
- Treat an Account Booking payment as a standard CTL remittance.
- Treat a customer identifier as an invoice reference.
- Apply one document parser indiscriminately to every financial email.
- Apply CTL remittance rules to unrelated owner/operator payments.
- Treat an Account Booking payment by itself as proof that the whole shift is reconciled.

Shared helpers are acceptable only where the underlying meaning is genuinely the same.

---

## Principle 8 — Respect the Cairns Taxis Settlement Process

Shift Mate follows the Cairns Taxis settlement-envelope process.

Settlement values have meaning.

### Negative Shift Mate payable

Cairns Taxis owes the driver.

This represents money payable to the driver and is exported to Taxi Business Records as positive Settlement income.

### Positive Shift Mate payable

The driver owes Cairns Taxis.

This is not income.

It belongs to a separate invoice, expense, reimbursement or accounts-payable workflow.

The original Shift Mate report is never modified merely to fit the accounting representation.

The mapper translates Shift Mate values into the form required by Taxi Business Records without altering the underlying operational record.

---

## Principle 9 — Preserve the Ledger Methodology

Taxi Business Records is a daily accounting summary, not a duplicate of the complete Shift Mate report.

The current ledger structure is:

```text
Date | Cash | Settlement | Account Payment | Total Income | Notes | Status
```

### Cash

```text
Cash = Cash Taken - Area Charge
```

Cash therefore may:

- Differ from the physical cash handled by the driver.
- Be zero.
- Be negative when Area Charges exceed Cash Taken.

The original `Cash Taken` and `Area Charge` values remain preserved in Shift Mate.

### Total Income

```text
Total Income = Cash + Settlement + Account Payment
```

Agent 001 must understand this methodology before treating a ledger difference as an error.

Financial figures must not be changed merely to make two sources appear to agree.

---

## Principle 10 — Aggregate Same-Day Shift Reports Without Losing Detail

Multiple separate shifts may occur on the same calendar date.

Shift Mate must preserve each report independently.

Taxi Business Records must continue to use one row per date.

Therefore:

- Individual Shift Mate reports remain distinct.
- Their accounting values are aggregated for the daily ledger row.
- Re-exporting rewrites the single date row rather than appending duplicates.
- Report IDs and detailed audit history remain in Shift Mate.
- Daily aggregation must never erase the underlying individual reports.

Operational detail and accounting summary must both be preserved.

---

## Principle 11 — Record Facts and Explain Differences

Differences are never hidden.

They are documented so recurring patterns can be investigated.

A review or manual-verification record should preserve enough information to explain:

- What Shift Mate recorded.
- What the official document recorded.
- Which values differ.
- The amount of the difference.
- The relevant payment, booking or invoice reference.
- The source document.
- When the comparison occurred.
- Why a human decision was required.

Repeated discrepancies may reveal:

- Shift Mate calculation issues.
- Cairns Taxis processing differences.
- Business-rule changes.
- Incorrect source data.
- Software defects.
- Duplicate or missing transactions.

---

## Principle 12 — Automate Routine Differences, Review Exceptional Differences

Automation should be reserved for differences that are repeatable, well-understood and supported by reliable evidence.

Routine rules may be automated.

Exceptional operational anomalies should be surfaced for human investigation.

Current example:

- A CTL settlement difference of exactly one cent is an accepted rounding tolerance.
- A larger difference is not automatically explained or adjusted.

The working rule is:

> Routine differences are automated. Exceptional differences are surfaced for human investigation.

Agent 001 must not grow increasingly complicated rules merely to eliminate every real-world exception.

---

## Principle 13 — One-Cent Tolerance Must Remain Explicit

Settlement comparison is performed using integer cents.

The current rule is:

```text
Difference = $0.00 → EXACT
Difference = $0.01 → ROUNDING_TOLERANCE
Difference > $0.01 → NO_MATCH
```

A one-cent tolerance:

- May permit automatic verification when all other conditions pass.
- Must not alter the ledger financial values.
- Must be recorded in the audit source as `ROUNDING_TOLERANCE`.

Any future tolerance change must be explicit, documented and tested.

There must never be a hidden or expanding numerical tolerance.

---

## Principle 14 — All Required Components Must Be Verified

A ledger row may contain more than one income component.

A confirmed component does not automatically verify the entire row.

### No Account Payment

If no Account Payment exists:

- Confirmed CTL Settlement may be sufficient for automatic verification.

### Account Payment present

If Account Payment exists:

- The Account Booking payment must be confirmed.
- CTL Settlement must also be confirmed independently.

Only when all required components are satisfactorily supported may the row become `Verified`.

Account Booking evidence alone must never verify unresolved Settlement income.

---

## Principle 15 — Shift Date Is the Authoritative Work Date

For Account Booking reconciliation, the Shift Mate report date represents when the work occurred.

Invoice and payment dates may occur later.

Therefore:

- Shift date identifies the operational accounting date.
- Invoice date is supporting document evidence.
- Payment date is settlement evidence.
- Later payment processing must not move the income to a different shift date merely because the payment occurred later.

This distinction must be preserved throughout reconciliation.

---

## Principle 16 — Financial-Year Routing Must Be Explicit

The Taxi Business Records workbook follows the Australian financial year:

```text
July → June
```

For a financial year beginning in year `Y`:

- July–December belong to year `Y`.
- January–June belong to year `Y + 1`.

References outside the selected financial year must be rejected rather than forced into a worksheet.

The current development service still uses a fixed financial-year start year of `2026`.

This is a known temporary implementation limitation.

Future rollover must make the active financial year dynamic without changing the routing principle.

---

## Principle 17 — Prevent Duplicate Processing

The same report, email, payment, verification or official document must not be applied more than once.

Duplicate protection should use the strongest available identifiers, including:

- Shift Mate Report ID.
- Gmail message ID.
- Remittance reference.
- Account Booking reference.
- Invoice number.
- Invoice reference.
- Ledger date.
- Current verification status.
- Shift date and amount where no stronger identifier is available.

For automatic ledger verification, an already `Verified` row must not be verified again merely because the same source is processed again.

For historical manual-audit backfill, an existing `MANUAL` audit record must prevent duplicate backfill.

A duplicate must be ignored or flagged for review, never silently recorded again.

---

## Principle 18 — Verification Must Be Explicit and Auditable

Automatic verification is allowed only when the required rules are satisfied without ambiguity.

For CTL remittance verification, the current requirements include:

- The Remittance record is `VALID`.
- The corresponding ledger row can be identified.
- The Remittance reference is consistent with the relevant date.
- Settlement is either:
  - `EXACT`, or
  - `ROUNDING_TOLERANCE`.
- Any required Account Booking evidence has been confirmed.
- The current ledger status is `Pending`.

When all required conditions are satisfied, Agent 001 may change:

```text
Pending → Verified
```

and must create an `AUTOMATIC` verification record.

If any required condition is not satisfied, Agent 001 must not automatically verify the row.

---

## Principle 19 — Manual Verification Requires Real Evidence

Manual verification exists for legitimate cases that cannot be safely represented by a general automatic rule.

Examples include:

- EFTPOS terminal failures.
- TSS/EFTPOS operational errors.
- Split shifts.
- Mixed vehicles.
- Mixed operators.
- Separate owner payments.
- Transactions requiring physical supporting records.

Manual verification:

- Requires an explicit manual action.
- Must use real supporting evidence.
- Must not infer or manufacture evidence.
- Applies only to a `Pending` row in the normal workflow.
- Appends an explanatory Note.
- Changes the row to `Verified`.
- Creates a `MANUAL` verification record.
- Preserves the verification source.

Supporting evidence may include:

- Official Cairns Taxis records.
- Invoices.
- EFTPOS printouts.
- Owner shift reports.
- Bank/payment records.
- Driver diary notes.
- Other contemporaneous business records.

---

## Principle 20 — Historical Audit Repair Must Not Rewrite the Ledger

A historical audit backfill exists only to repair missing audit history for rows that were legitimately verified before the protected manual workflow existed.

A backfill must:

- Require the ledger row to already be `Verified`.
- Leave Notes unchanged.
- Leave Status unchanged.
- Leave financial figures unchanged.
- Check existing audit records first.
- Create only the missing `MANUAL` audit entry.
- Refuse to duplicate an existing historical manual record.

Audit repair is not permission to reinterpret or rewrite historical accounting data.

---

## Principle 21 — Maintain an Audit Trail

Important automated and manual actions must be traceable.

The system should preserve:

- Source Gmail message identifiers.
- Sender information.
- Email dates.
- Attachment metadata.
- Official reference numbers.
- Validation results.
- Reconciliation outcomes.
- Verification method.
- Verification timestamp.
- Verification source.
- Backup timestamps.
- Export timestamps.
- Errors.
- Review decisions.

Ledger verification must distinguish between:

- `AUTOMATIC`
- `MANUAL`

The audit trail should explain what Agent 001 did without requiring access to its internal implementation.

A ledger status of `Verified` describes the outcome.

The audit trail describes how that outcome was reached.

---

## Principle 22 — Separate Working Data, Accounting Data and Backup Data

Shift Mate, Taxi Business Records and cloud backup have different responsibilities.

### Shift Mate

Records driver shift information and remains the operational source for individual reports.

### Taxi Business Records

Preserves accounting entries, Notes, verification Status and daily summaries.

### Shift Mate Backup

Stores complete report JSON independently of the monthly ledger.

Backup and monthly-ledger export must remain separate operations.

A successful backup does not mean a report has been exported.

A successful export does not mean a report has been backed up.

Each state must be stored and displayed separately.

---

## Principle 23 — Restore Safely

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

## Principle 24 — Protect Credentials and Financial Documents

OAuth credentials, refresh tokens, service-account credentials and downloaded financial documents must not be committed to Git.

Protected information must be stored using:

- Local development secrets.
- Environment variables.
- Approved secure configuration.
- Ignored local directories for downloaded documents.

Logs must avoid exposing secrets or unnecessary personal financial information.

Only the minimum information required for diagnosis should be displayed.

---

## Principle 25 — Small, Testable Components

Every component should have one clear responsibility.

Examples:

- `GmailAgent` → Search, read, classify and build structured Gmail financial records.
- Document extractors → Parse one specific financial field.
- Record builders → Produce structured validated financial records.
- Remittance matcher → Compare validated Remittance payment lines with ledger rows.
- Account Booking matcher → Compare validated Account Booking records across the financial-year ledger.
- Mapper → Convert Shift Mate data into worksheet-ready values.
- Worksheet resolver → Determine the correct monthly worksheet and row.
- Financial-year worksheet helpers → Route references across July–June.
- `SheetsAgent` → Read and write Google Sheets data.
- Verification helpers → Apply protected automatic or manual verification actions.
- Backfill helper → Repair missing historical manual audit records without changing the ledger.
- Parser → Validate and convert backup JSON.
- Comparer → Compare cloud and local reports.
- Restore helper → Merge missing reports safely.
- Finance Agent coordinator → Orchestrate the complete workflow.

Components should be independently testable wherever practical.

---

## Principle 26 — One Feature, One Test, One Result

Development proceeds in small verified steps.

For each feature:

1. Define the expected behaviour.
2. Add or update a focused test.
3. Confirm the expected failure where appropriate.
4. Implement the smallest correct change.
5. Run the relevant test.
6. Run the complete test suite.
7. Verify the real workflow when external services are involved.
8. Update documentation.
9. Commit only when the working tree is correct.

Passing tests are required, but real Gmail, Google Sheets and production checks remain necessary for integration work.

Current verified test baseline:

```text
Test Files  10 passed (10)
Tests       97 passed (97)
```

---

## Principle 27 — Prefer Clear Code Over Clever Code

Agent 001 should remain understandable to a future maintainer.

Prefer:

- Explicit names.
- Small functions.
- Visible business rules.
- Straightforward control flow.
- Document-specific types.
- Clear validation and verification states.
- Simple error handling.
- Business-language terminology that reflects the underlying financial meaning.

Avoid:

- Hidden side effects.
- Unnecessary abstraction.
- Premature generalisation.
- Compressed code that obscures financial meaning.
- Complexity added only for theoretical future use.
- Special-case automation for rare events unless the rule becomes genuinely repeatable.

---

## Principle 28 — Fail Safely

A failed email search, PDF parse, backup, export, reconciliation or verification must not corrupt existing data.

Failure behaviour should:

- Preserve the original financial values.
- Avoid partial updates where possible.
- Return a clear error.
- Store useful diagnostic information.
- Leave the item unresolved when financial certainty is affected.
- Allow the operation to be retried safely.

Where one logical operation requires multiple external writes, incomplete operations must be detectable and recoverable.

For example, manual verification currently involves:

1. Adding the explanatory ledger Note.
2. Updating the Status.
3. Appending the audit record.

Future hardening should improve recovery if one of these external writes succeeds and a later write fails.

The system must never report success before the operation is actually complete.

---

## Principle 29 — Documentation Is Part of the System

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
- Verification rules.
- Financial-year behaviour.
- Known limitations.
- Test status.
- Important discoveries.
- Manual exception policy.

A feature is not fully complete until its documentation is updated.

---

## Principle 30 — Preserve Compatibility During Renaming and Migration

The wider system is named Shift Mate.

Remaining visible references to legacy `Driver Companion` / `DC` naming should progressively be replaced with `Shift Mate`.

However, compatibility takes precedence over cosmetic consistency.

Before renaming:

- Internal storage keys.
- Existing backup worksheet names.
- Persisted identifiers.
- API contracts.
- Other compatibility-sensitive values.

the impact on existing user data must be reviewed.

A rename must never make existing reports, backups or financial records inaccessible.

---

## Principle 31 — Keep Future Financial Workflows Separate Until Defined

Invoice and Expense reconciliation are the next major development area.

They must not be forced into the existing income-reconciliation model merely for convenience.

Future work must explicitly define:

- What constitutes an expense.
- Which source is authoritative.
- How invoices payable to Cairns Taxis are represented.
- How payment status is tracked.
- How GST-relevant information is preserved.
- How duplicates are prevented.
- How exceptions are reviewed.
- How the audit trail records the outcome.

The existing Settlement and Account Booking rules must remain stable while those workflows are designed.

---

# Engineering Standard

Shift Mate records reality.

Agent 001 verifies reality.

Taxi Business Records summarise reality.

Finance Agent Log explains verification.

Cloud backup protects reality.

Present facts.

Preserve originals.

Never guess.

Always verify.

Automate what is repeatable.

Investigate what is exceptional.

If uncertain, leave it visible for review.
