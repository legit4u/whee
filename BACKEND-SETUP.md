# Backend Server Setup for Testing

The bill submission feature requires the backend API server to be running. Follow these steps:

## Step 1: Create .env.local (One-time setup)

Copy the example environment file and update it with your local IP:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001
```

**Find your local IP:**
- **Windows:** Run `ipconfig` in PowerShell, look for "IPv4 Address" under your network adapter
- **Mac/Linux:** Run `ifconfig`, look for "inet" address

Example: If your IP is `192.168.1.100`, set:
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

## Step 2: Start the Backend Server

In a new terminal:

```bash
cd server
npm run dev
# or if dev script not configured:
npx ts-node index.ts
```

You should see:
```
Whee API server listening on port 3001
```

## Step 3: Verify Connection

Test the health check endpoint:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

## Step 4: Test from Mobile App

1. **Update Expo environment** — The app needs to know the backend IP before bundling
2. **Clear Expo cache:** `npm start -- --clear`
3. **Reload on phone:** Press `r` in terminal or rescan QR code
4. **Try submitting a bill:**
   - Tap "Scan" → "Add Manually"
   - Add an item (e.g., Milk)
   - Click "Next: Review"
   - Enter store name
   - Click "✓ Submit Bill"
   - Should see "Success" alert

## Backend API Endpoints (Currently Working)

- ✅ `GET /health` — Health check
- ✅ `GET /v1/categories` — List all categories
- ✅ `POST /v1/bills` — Submit a bill
- ⏳ `GET /v1/items/search` — Search items (not implemented)
- ⏳ `GET /v1/items/:id/price-history` — Price history (not implemented)
- ⏳ `GET /v1/items/:id/nearby-cheaper` — Nearby cheaper stores (not implemented)
- ⏳ `GET /v1/bills/:id/report` — Bill report (not implemented)

## Troubleshooting

**"Network request failed" error:**
- Check that backend server is running on port 3001
- Verify `.env.local` has the correct IP address (not localhost)
- Make sure phone and computer are on the same WiFi network
- Try reloading the app (`r` in terminal)

**"Cannot GET /health" (404 error):**
- Backend server not running, or running on wrong port
- Check terminal where you started the server

**Bill submission shows success but nothing happened:**
- Check backend terminal for log messages
- Bill data is stored in-memory (will be lost on server restart)

## Next: Connect to PostgreSQL Database

Once bill submission works end-to-end, the next step is to:
1. Set up PostgreSQL database
2. Update `server/index.ts` to use real database instead of in-memory storage
3. Implement remaining API endpoints (search, price history, etc.)
