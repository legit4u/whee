# Product Spec — Whee

## Problem

Official inflation figures lag and don't reflect what people actually pay,
store to store, week to week. This app crowdsources real purchase prices
(starting with groceries, fruits & vegetables) to show real, local price
trends and help people find where things are currently cheaper.

## Core user flows

### 1. Log a purchase
- **Scan a bill** (primary path): camera → on-device OCR → parsed line items
  → review/edit screen (item, category, quantity, unit, price, store, date
  all editable) → confirm → submit.
- **Manual entry** (fallback): same review/edit form, filled in by hand.

### 2. Track a price
- Search/browse items → item detail screen → price-over-time line graph
  (normalized unit on y-axis) → optional filter by store/area.

### 3. Find it cheaper
- **Per item**: on the item detail screen, "cheaper nearby" list — stores
  within a radius, sorted by price, with distance and ₹/％ savings.
- **Per bill**: after submitting a scanned bill, a report showing, for each
  item, whether a nearby store currently has it cheaper and by how much, or
  a confirmation it was already the best price nearby.

## Categories (POC)

Fixed starter list, structured as data so more can be added without code
changes: `fruits`, `vegetables`, `groceries`, `stationery`.

## Price normalization

See `.github/copilot-instructions.md` § 5 and
`.github/instructions/data-model.instructions.md` for the canonical-unit
table and rules (per 100g / per 100ml / per piece).

## Privacy model

No accounts. No PII. Anonymous per-device UUID only. Bill photos processed
on-device and never uploaded — only structured, user-confirmed data is sent.
Store location (public) is fine to store; user location history is not
collected. Full rules in `.github/copilot-instructions.md` § 6.

## Roadmap

**POC (now)**
- iOS app: manual entry, bill scan, categorize, price history graph,
  cheaper-nearby (per item + per bill).

**V1**
- Android release (same Expo codebase).
- More categories.
- Basic abuse/outlier protection on crowdsourced submissions.

**V2**
- Web interface (likely Next.js, reusing the same backend/API).
- Tap a cheaper suggestion → open the phone's default maps app with
  directions to that store.
- Generate a shareable price report image/link → share via standard
  OS share sheet (social apps, messaging).
- "Search this item on Amazon" style marketplace deep links from the item
  detail screen.

## Open questions to revisit

- How to seed/merge duplicate `items` created by different users' OCR
  guesses for the "same" product (e.g. "Tomato" vs "Tomatoes 1kg") —
  needs a matching/merge strategy before scale.
- How much store-location precision to store for very small/informal
  vendors (e.g. street vendors with no fixed address) vs organized retail.
- Anti-abuse strategy for crowdsourced price submissions beyond simple
  outlier rejection (e.g. per-device rate limiting) as usage grows.
