# Driver Companion - Events Feature

## Purpose

The Events feature highlights significant events that may influence taxi demand, traffic conditions, airport activity, hotel activity, tourism movement, road closures, or long-distance transfers within the Cairns region.

The Events page is intended to provide useful operational awareness for drivers and is not a prediction or earnings forecast tool.

---

## Feature Status

### Version 1 Complete

Implemented features:

* Events page added to Driver Hub
* Consistent Driver Companion styling
* Home navigation button
* Dynamic event rendering from data file
* Separate `eventsData.ts` data source
* Previous Month / Next Month navigation
* Dynamic month heading
* Month-based event filtering
* Automatic date sorting
* Empty month handling
* Single-day event support
* Multi-day event support
* Cross-month event support
* Driver Notes section

---

## Data Structure

Events are stored in:

```text
app/events/eventsData.ts
```

Example structure:

```ts
{
  id: "ironman-cairns",
  title: "Ironman Cairns",
  type: "Sporting Event",
  venue: "Cairns Esplanade",
  date: "2026-06-14",
  endDate: "2026-06-14",
  demand: "high",
  notes: "Major visitor numbers expected."
}
```

Events are grouped by year for readability:

```ts
//========== 2026 ==========

//========== 2027 ==========
```

These comments are for maintenance purposes only and are ignored by the application.

---

## Event Inclusion Philosophy

The Events page is designed to provide useful signals rather than an exhaustive list of every local event.

Inclusion should be based on the following question:

> Would a Cairns taxi driver reasonably benefit from knowing this event is taking place?

Events should generally be included when they are likely to influence:

* Airport activity
* Hotel activity
* Tourism movement
* Passenger demand
* Road closures
* Traffic conditions
* Long-distance transfers
* Major city activity

---

## Events Typically Included

Examples:

* Ironman Cairns
* Cairns Festival
* Cairns Show
* Major sporting events
* Major conferences
* Major exhibitions
* Tourism industry events
* Significant Port Douglas events
* Major regattas
* Cruise-related events

---

## Events Typically Excluded

Examples:

* Small community gatherings
* Coffee mornings
* Toddler groups
* Minor suburb markets
* Small local entertainment events
* Trivia nights
* Small venue performances

The presence of some taxi demand alone is not sufficient reason for inclusion.

---

## Port Douglas Policy

Relevant Port Douglas events may be included where they are likely to influence:

* Cairns Airport activity
* Hotel transfers
* Tourism movement
* Long-distance taxi work
* Regional traffic conditions

Small local Port Douglas events should generally be excluded.

---

## Demand Ratings

Demand ratings are intended as a guide only.

High, Medium, and Low demand indicators represent an assessment of potential impact based on available information.

They are not a guarantee of:

* Passenger numbers
* Traffic conditions
* Earnings
* Shift performance

---

## Historical Archive Policy

Events are retained as a historical archive.

Past events are not removed from the dataset and remain accessible through month navigation.

This provides:

* Historical reference
* Consistent maintenance
* Simpler data management
* Future analysis opportunities

---

## Future Development

Potential future enhancements:

* Additional historical event data
* Expanded regional coverage
* AI-assisted event discovery
* Source tracking for events
* Event update workflow
* Additional event categories if required

Current focus remains on maintaining a curated, high-quality dataset rather than increasing event volume.

//========= Calculator change

Future Investigation

Add Cash Taken field.

Use real-world settlement data from multiple shifts to verify
settlement formula before changing final calculation.

Goal:
More Cash = Pay Operator
More EFTPOS = Pay Driver