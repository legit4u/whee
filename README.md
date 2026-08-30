# Whee - Crowdsourced Inflation Tracking

A React Native/Expo mobile app that helps users track real purchase prices and find where items are cheapest in their area.

## 📖 Documentation

- **[Product Specification](docs/PRODUCT-SPEC.md)** — Core problem, user flows, features, and scope
- **[Copilot Instructions](.github/copilot-instructions.md)** — Tech stack, architecture, and coding conventions
- **Path-specific rules** in `.github/instructions/`

## 🏗️ Project Structure

```
whee/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout with React Query provider
│   └── (tabs)/             # Tab-based navigation
│       ├── home.tsx        # Home screen (recent activity, quick add)
│       ├── scan.tsx        # Bill scanning (OCR) and manual entry
│       ├── items.tsx       # Browse and search items
│       └── settings.tsx    # Settings and privacy info
│
├── src/
│   ├── lib/                # Pure, testable utility functions
│   │   ├── units.ts        # Price normalization logic
│   │   ├── units.test.ts   # Unit tests for normalization
│   │   ├── categories.ts   # Category definitions and metadata
│   │   └── geo.ts          # Geolocation and distance helpers
│   │
│   ├── services/           # API client and React Query hooks
│   │   ├── api.ts          # Base API client with fetch wrapper
│   │   ├── hooks.ts        # React Query hooks for all endpoints
│   │   └── provider.tsx    # QueryClientProvider setup
│   │
│   ├── features/           # Feature-specific components and logic
│   │   ├── scan/           # Bill scanning/OCR feature
│   │   ├── items/          # Item detail and price history
│   │   └── bills/          # Bill list and reports
│   │
│   ├── components/         # Shared UI components
│   └── store/              # Zustand stores (local UI state)
│
├── server/                 # Backend API (Node.js + Express)
│   ├── index.ts            # Express app entry point
│   ├── routes/             # API route handlers (TODO)
│   ├── db/                 # Database migrations and schema
│   │   └── 001_initial_schema.sql
│   └── middleware/         # Express middleware (TODO)
│
├── docs/
│   └── PRODUCT-SPEC.md     # Full product specification
│
└── .github/
    ├── copilot-instructions.md  # AI coding guidelines
    └── instructions/
        ├── backend-api.instructions.md      # API design rules
        ├── data-model.instructions.md       # Schema and data model rules
        ├── bill-scanning.instructions.md    # OCR and review flow rules
        └── ui-conventions.instructions.md   # React Native/Expo UI conventions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (optional, `npx expo` works)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the Expo dev server (iOS simulator or physical device)
npm start

# Run on iOS
npm run ios

# Run on Android (once Android support is ready)
npm run android

# Run on web
npm run web
```

### Running the Backend Server

```bash
# Start in development mode with auto-reload
npm run server:dev

# Or run once
npm run server
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test:watch
```

## 🗄️ Database Setup

The schema is defined in `server/db/001_initial_schema.sql`. To set up:

1. Create a Postgres + PostGIS database (e.g., using Supabase)
2. Run the migration to create tables and views
3. Set `EXPO_PUBLIC_API_URL` in your `.env.local` to point to the backend API

Example `.env.local`:

```
EXPO_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgres://user:password@localhost/whee_db
```

## 🔐 Privacy & Anonymity

- **No PII collected.** No names, emails, phone numbers, addresses.
- **Anonymous device IDs only.** Each device gets a random UUID (anonymous_device_id).
- **No bill photos uploaded.** OCR runs on-device; only parsed, confirmed data is sent to the backend.
- **User locations not tracked.** Store locations (public) are fine; user location history is not collected.

See `.github/copilot-instructions.md` § 6 for full privacy rules.

## 📱 Core Features (POC)

1. **Log purchases** — Scan a bill (OCR) or manually enter items
2. **Review & confirm** — Edit OCR results before submitting
3. **Track prices** — View price-over-time graph for any item
4. **Find it cheaper** — See nearby stores with lower prices (per-item or per-bill reports)

See [PRODUCT-SPEC.md](docs/PRODUCT-SPEC.md) for full feature list and roadmap.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile app | **React Native + Expo (Expo Router)**, TypeScript |
| Client state | **React Query** (server state), **Zustand** (UI state) |
| On-device OCR | **ML Kit Text Recognition** (via Expo config plugin) |
| Charts | **react-native-gifted-charts** or **victory-native** |
| Styling | **NativeWind** (Tailwind for React Native) |
| Backend | **Node.js + Express**, TypeScript |
| Database | **Postgres + PostGIS** (Supabase recommended for POC) |

## 📝 Coding Conventions

- **TypeScript strict mode** everywhere; no `any` without comment
- **Functional React components** with hooks
- **Pure functions** in `src/lib/` for testability (normalization, category logic, geo helpers)
- **Small, composable components** (keep <150 lines)
- **Unit tests** alongside pure functions
- **File-based routing** via Expo Router in `app/`

For full conventions, see `.github/copilot-instructions.md` § 7.

## 🚦 Next Steps

1. **Implement bill scan/OCR flow** (`src/features/scan/`)
2. **Wire up backend endpoints** (`server/routes/`)
3. **Connect to live database** (Supabase or self-hosted Postgres)
4. **Build item detail & price history screens** (`src/features/items/`)
5. **Implement "cheaper nearby" comparison** (`src/features/items/`)
6. **Add bill submission & report** (`src/features/bills/`)

See [PRODUCT-SPEC.md](docs/PRODUCT-SPEC.md) for detailed roadmap.

## 📄 License

TBD
