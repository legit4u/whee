# Copilot Instructions — Whee

You are assisting on **Whee**, a **crowdsourced inflation-tracking mobile app**
that helps users ride prices down like a kid sliding down a playground slide
— find where things are cheapest and track prices over time. Read this
file fully before generating code. Path-specific rules live in
`.github/instructions/*.instructions.md` and are applied automatically on top
of this file for matching paths. The full product spec is in
`docs/PRODUCT-SPEC.md` — consult it for anything not covered here.

## 1. What the app does

Users log day-to-day purchases (groceries, fruits, vegetables, stationery —
more categories later) either by manual entry or by **scanning a paper bill**.
Each purchase is normalized into a common unit per category, tagged with the
store's location and the date, and stored anonymously. Crowdsourced data lets
any user:

- View a **price-over-time graph** for a specific item.
- See **where an item is/was cheaper nearby**, either per-item or as a
  per-bill "you could have saved ₹X" report.

Later (not in POC scope): web app, "navigate to cheaper store" deep link into
the phone's default maps app, social sharing of reports, and searching
marketplaces (e.g. Amazon) for an item.

## 2. Tech stack (recommended, keep it this way unless asked to change)

| Layer | Choice | Why |
|---|---|---|
| Mobile app | **React Native + Expo (Expo Router), TypeScript** | One codebase for iOS now, Android later, minimal native tooling |
| On-device OCR | **ML Kit Text Recognition** (on-device, e.g. via a native module / Expo config plugin) | Bill images never leave the device — see privacy rules below |
| Client state | **React Query** for server data, **Zustand** for local UI state | Simple, well supported by Copilot |
| Charts | **react-native-gifted-charts** or **victory-native** | Price-over-time line graphs |
| Backend | **Postgres + PostGIS** (Supabase is a good managed option for the POC) | Geo queries ("cheaper store within N km") need PostGIS |
| API | REST via a thin **Node.js/Express (or Supabase auto-REST)** layer | Simple, swappable later |
| Styling | **NativeWind (Tailwind for RN)** | Fast, consistent styling |

If you (Copilot) are about to suggest a different major library for one of
these roles, stop and ask the user first — don't silently substitute.

## 3. Repo structure

```
app/                      # Expo Router screens (file-based routing)
  (tabs)/home.tsx
  (tabs)/scan.tsx
  item/[id].tsx            # item detail + price history graph
  bill/[id]/report.tsx     # "could have saved" report for a scanned bill
src/
  components/              # shared UI components
  features/
    scan/                  # OCR capture, parsing, review-and-edit flow
    items/                 # item detail, price history
    bills/                 # bill list, bill report
  lib/
    units.ts                # price normalization logic (see below)
    categories.ts           # category definitions + keyword classifier
    geo.ts                   # geohash / distance helpers
  services/                 # API client (React Query hooks)
  store/                    # Zustand stores
server/                    # backend API (if not using Supabase directly)
  db/                       # migrations, schema
  routes/
docs/
  PRODUCT-SPEC.md
```

## 4. Core domain model

- **Category** — `fruits | vegetables | groceries | stationery | ...`
  (extensible list, don't hardcode assumptions that there are only 4).
- **Item** — a canonical product concept users search/browse (e.g. "Tomato",
  "Toned Milk 1L pouch"). Bill line items get matched/mapped to an Item.
- **PricePoint** — one crowdsourced data point: `item_id, store_id,
  normalized_price, normalized_unit, raw_quantity, raw_unit, raw_price,
  purchase_date, anonymous_device_id`. **No user identity fields.**
- **Store** — `name, lat, lng, geohash`. Public info about a shop, not the
  user.

## 5. Price normalization — critical logic, get this right

Bills express price per kg, per piece, per pack, per dozen, etc. Every
`PricePoint` must be normalized to a **canonical unit per category** so
prices are comparable across users and stores:

| Category type | Canonical unit | Example |
|---|---|---|
| Sold by weight (vegetables, fruits, atta, rice, dal) | **price per 100 g** | ₹80/kg → ₹8.00 per 100g |
| Sold by volume (milk, oil, liquids) | **price per 100 ml** | ₹60/L → ₹6.00 per 100ml |
| Sold as discrete units (eggs, stationery, packaged count items) | **price per piece** | ₹120 for a dozen eggs → ₹10/piece |

Rules:
- Always store **both** the raw bill value (quantity, unit, total price) and
  the normalized value. Never discard the raw value — normalization logic
  will need fixing over time and you must be able to recompute.
- The normalization function lives in `src/lib/units.ts` and must be a pure
  function: `normalize(category, rawQuantity, rawUnit, rawPrice) →
  { unit: 'per_100g' | 'per_100ml' | 'per_piece', value: number }`.
- Category determines which canonical unit applies — don't infer it from the
  raw unit alone (e.g. a bill might list milk in "ml" or in "L" or as
  "1 pouch"; all must resolve to per-100ml for the dairy category, using
  pack-size metadata for the "1 pouch" case).
- Write unit tests for `normalize()` covering: per-kg, per-100g-already,
  per-piece, per-dozen, per-pack-with-known-size, and unrecognized units
  (should flag for user review, never silently guess).

## 6. Privacy & anonymity — non-negotiable

This app collects **crowdsourced pricing data**, not user data. Enforce this
everywhere:

- **No accounts, no names, no phone numbers, no emails, no payment info are
  ever collected or stored.** Use a random, locally-generated
  `anonymous_device_id` (UUID) with no link to any real identity.
- **Bill images are processed on-device and are never uploaded.** OCR runs
  locally; only the structured, user-confirmed line items (item name,
  quantity, price, category) are sent to the backend. The photo itself must
  be discarded after parsing (or kept locally only, never transmitted).
- **Store location is public information about a shop, not about the user**
  — that's fine to store. Do **not** store the user's own device location
  history, home address, or any location not tied to a specific purchase at
  a specific store.
- Before submitting a scanned bill, **always show the user a review/edit
  screen** listing what was extracted (items, prices, store) so they can
  correct OCR errors and confirm before anything is sent to the backend.
- When writing backend schema or API code, if a field could plausibly be
  used to re-identify a person (device fingerprint beyond the anonymous UUID,
  IP logging tied to submissions, precise timestamps combined with a home
  store, etc.), flag it to the user rather than adding it by default.

## 7. Coding conventions

- TypeScript strict mode everywhere. No `any` without a comment explaining
  why.
- Functional React components, hooks-based. No class components.
- Keep OCR parsing, unit normalization, and category classification as pure,
  independently testable functions in `src/lib/` — not inline in components.
- Prefer small, composable components over large screen files.
- Every new screen goes through Expo Router file-based routing under `app/`.
- Write a unit test alongside any new pure function in `src/lib/`.

## 8. POC scope — don't over-build yet

For the current milestone, build:
1. Manual entry + bill scan → review/edit → save.
2. Category = fixed list of 4 (fruits, vegetables, groceries, stationery) —
   make the list a config, not hardcoded logic, so more can be added later.
2. Item detail screen with price-over-time graph.
3. Per-item and per-bill "cheaper nearby" comparison.

Do **not** yet build: web interface, in-app maps navigation, social sharing,
marketplace search. These are designed for later — see `docs/PRODUCT-SPEC.md`
§ Roadmap — but don't scaffold dead code for them now unless asked.
