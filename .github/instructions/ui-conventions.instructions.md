---
description: "React Native / Expo UI conventions"
applyTo: "app/**/*.tsx,src/components/**/*.tsx,src/features/**/*.tsx"
---

# UI conventions

- File-based routing via Expo Router under `app/`. Tab bar covers: Home
  (recent activity / quick add), Scan, Items (search/browse), Settings.
- Screens: keep screen components thin — they compose feature components and
  hooks from `src/features/*` and `src/services/*`. Business logic does not
  live in screen files.
- Styling: NativeWind (Tailwind classes) for layout/spacing/color. Avoid
  inline `StyleSheet.create` unless doing something Tailwind can't express.
- Data fetching: React Query hooks in `src/services/`, one hook per
  operation (e.g. `useItemPriceHistory(itemId)`, `useNearbyCheaper(itemId,
  coords)`). Screens never call `fetch` directly.
- Charts: price-over-time uses a line chart (react-native-gifted-charts or
  victory-native) with date on the x-axis and `normalized_value` on the
  y-axis; label the unit (per 100g / per 100ml / per piece) clearly since
  category-crossing comparisons are meaningless.
- "Cheaper nearby" results: show item, store name, distance, and price
  delta (₹ and %) versus what the user paid/is viewing — sort by savings
  descending. If the current store is already the cheapest, show a clear
  "already the best price nearby" state rather than an empty list.
- Accessibility: every icon-only button needs an `accessibilityLabel`;
  respect system font scaling (avoid fixed heights that clip scaled text).
- Keep components under ~150 lines; extract subcomponents rather than
  growing a file.
