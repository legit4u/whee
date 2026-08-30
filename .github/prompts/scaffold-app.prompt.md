---
mode: agent
description: "Scaffold the initial Whee Expo app + backend"
---

Scaffold the initial project for **Whee** per `.github/copilot-instructions.md` and the
path-specific files in `.github/instructions/`. Specifically:

1. Initialize an Expo (TypeScript) app using Expo Router, with NativeWind
   configured, at the repo root under `app/` + `src/` as described in the
   repo structure section of the copilot-instructions.
2. Create the tab navigation: Home, Scan, Items, Settings (stub screens are
   fine for now).
3. Create `src/lib/units.ts` with the `normalize()` function signature from
   the copilot instructions (category, rawQuantity, rawUnit, rawPrice) →
   normalized unit/value, plus a starter unit test file covering: per-kg,
   per-piece, per-dozen, and an unrecognized-unit case that should flag for
   review rather than guess.
4. Create `src/lib/categories.ts` with the initial fixed category list
   (fruits, vegetables, groceries, stationery) and each one's canonical unit,
   structured as data (not hardcoded conditionals) so more can be added
   later.
5. Set up React Query and a `src/services/` folder with a typed API client
   stub (base URL from an env var, not hardcoded) for the endpoints listed
   in `.github/instructions/backend-api.instructions.md`.
6. Set up a `server/` folder with a minimal Express + TypeScript skeleton
   and the SQL schema from `.github/instructions/data-model.instructions.md`
   as an initial migration file — don't wire up a live DB connection yet,
   just the schema and route stubs matching the API list.
7. Add `docs/PRODUCT-SPEC.md` to the README as the source of truth for scope.

Ask me before adding any dependency not already named in
`.github/copilot-instructions.md`'s tech stack table. Stop after scaffolding
and summarize what was created — don't start building the scan/OCR feature
yet, that's a separate task.
