---
description: "Bill scanning, OCR parsing, and review flow rules"
applyTo: "src/features/scan/**,app/**/scan*.tsx"
---

# Bill scanning feature rules

## Pipeline

1. **Capture** — camera or photo picker (Expo Camera / ImagePicker).
2. **On-device OCR** — run text recognition locally (ML Kit). The photo is
   never uploaded; discard it (or keep local-only) once text is extracted.
3. **Parse** — turn raw OCR text lines into candidate line items:
   `{ rawText, itemNameGuess, quantity, unit, price }`. This is heuristic and
   will be wrong sometimes — that's expected.
4. **Classify** — map each item name guess to a `category` (keyword/alias
   match against `items.aliases` first; fall back to an "uncategorized"
   bucket the user must resolve manually — never silently guess a category
   with no signal).
5. **Normalize** — call `src/lib/units.ts:normalize()` per line item.
6. **Review & edit (mandatory)** — show the user every parsed line item,
   editable, with the store (auto-detected from GPS + nearest known store,
   editable) and date (defaults to today, editable) before anything is sent
   to the backend. This screen is not optional — it's the main data-quality
   safeguard against OCR errors.
7. **Submit** — send only the confirmed structured data to the backend, plus
   `anonymous_device_id`.

## Parsing guidance

- Bill formats vary a lot; don't try to build one universal parser. Structure
  it as: a generic line-tokenizer + a small set of pattern matchers (e.g.
  `qty x unit @ price`, `weight kg @ price/kg`, `item ... price` with no
  explicit unit) tried in order, first match wins, else flagged as
  "needs manual entry" for that line.
- Always surface OCR confidence / ambiguity to the user rather than guessing
  silently — e.g. if quantity or unit couldn't be parsed, leave those fields
  blank and highlighted on the review screen instead of defaulting to 1 or
  "piece".
- Keep the parser and classifier as pure functions with unit tests using
  sample bill text fixtures (add fixtures under
  `src/features/scan/__fixtures__/`) — don't couple parsing logic to camera
  or navigation code.

## Manual entry

Manual entry (no scan) should reuse the same review-and-edit form and the
same `normalize()` call — it's the same data shape as a single-line parsed
bill, just without the OCR step.
