# Agent 001 – Engineering Principles

These principles guide the design and implementation of Agent 001.

If future features conflict with these principles, the principles take precedence.

---

## Principle 1 — Preserve Original Data

Driver Companion data is never automatically modified.

Agent 001 validates exported data against official Cairns Taxis remittance emails.

If differences are found:

- The original exported values remain unchanged.
- The Status is updated to **Review**.
- The Notes field records the discrepancy and any relevant references.

Agent 001 verifies data.

It does not rewrite history.

---

## Principle 2 — Single Source of Truth

Each value has one authoritative source.

Examples:

- Driver Companion → Shift data.
- Gmail / Xero → Official remittance information.
- Google Sheets → Audit trail.

Agent 001 never invents or duplicates authoritative data.

---

## Principle 3 — Never Guess

If information cannot be verified, it is never assumed.

Unknown values are flagged for review.

---

## Principle 4 — Record Facts, Explain Differences

Differences are never hidden.

They are documented so recurring patterns can be investigated.

Repeated discrepancies may reveal:

- Driver Companion calculation issues.
- Cairns Taxis processing differences.
- Business rule changes.
- Software defects.

---

## Principle 5 — Small, Testable Components

Every component has one responsibility.

Examples:

- Mapper → Convert Driver Companion data into spreadsheet rows.
- SheetsAgent → Communicate with Google Sheets.
- GmailAgent → Read remittance emails.
- FinanceAgent → Coordinate the workflow.

Each component should be independently testable.

---

## Principle 6 — Respect the Cairns Taxis Settlement Process

Driver Companion follows the official Cairns Taxis settlement envelope.

Settlement values have meaning:

**Negative (-)**

Cairns Taxis owes the driver.

This represents money payable to the driver and is exported to the Taxi Business Records workbook as a **positive Settlement value**.

**Positive (+)**

The driver owes Cairns Taxis.

These values are **not** treated as income and will form part of a future expenses and reimbursements workflow.

The original Driver Companion report is never modified.

The mapper is responsible only for translating Driver Companion settlement values into the format required by the Taxi Business Records workbook.

It must never alter the original financial record.