# Supabase Database Setup Guide

This guide walks you through setting up a PostgreSQL database with Supabase for Whee.

## Quick Start (5 minutes)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in with GitHub
3. Click "New Project"
4. Fill in:
   - **Project name**: `whee` (or your choice)
   - **Database password**: Generate a strong password or use the auto-generated one
   - **Region**: Choose closest to your users (India: `ap-south-1`)
5. Wait for project to initialize (2-3 minutes)

### 2. Get Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to find the **Connection String** section
3. Select **URI** tab
4. Copy the connection string (looks like `postgresql://postgres:password@db.supabaseproject.com:5432/postgres`)

### 3. Create .env.local

In the project root (`c:\Users\mahes\code\whee\.env.local`):

```bash
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?sslmode=require

# Or use individual variables:
# DB_HOST=db.YOUR_PROJECT_ID.supabase.co
# DB_PORT=5432
# DB_NAME=postgres
# DB_USER=postgres
# DB_PASSWORD=YOUR_PASSWORD

# API Configuration
PORT=3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Replace:
- `YOUR_PASSWORD` with your Supabase database password
- `YOUR_PROJECT_ID` with your Supabase project ID (find in URL: `https://app.supabase.com/project/YOUR_PROJECT_ID`)

### 4. Run Database Migrations

1. Open Supabase SQL Editor
2. Copy the entire schema from `server/db/001_initial_schema.sql`
3. Paste into the SQL editor
4. Click "Run"

Or use the Supabase CLI:
```bash
npm install -g supabase
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
```

### 5. Start the Server

```bash
npm run server:dev
```

You should see: `[DB] Health check passed` and `Server listening on port 3001`

## Verifying the Connection

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Production Setup

When ready to deploy (for sharing with real users):

1. **Use Supabase's managed backups** (automatic daily)
2. **Enable SSL** (Supabase enables by default)
3. **Set up proper connection pooling** (PgBouncer - Supabase provides this)
4. **Monitor performance** (Supabase dashboard → Monitoring)
5. **Scale vertically** (add more resources as needed) - easily done in Supabase dashboard

## Cost

**Supabase Pricing:**
- **Free tier**: Good for POC/MVP
  - 500 MB database
  - 2 GB file storage
  - Up to 50,000 monthly active users for free Auth
  
- **Paid tier** ($25/month):
  - 8 GB database
  - 100 GB file storage
  - Scale as you grow

For a production app with 1000s of users, you'll likely want the paid tier or self-hosted PostgreSQL.

## Troubleshooting

**Connection refused?**
- Check `DATABASE_URL` is correct
- Verify Supabase project is active
- Check firewall: Supabase allows all IPs by default

**SSL error?**
- Add `?sslmode=require` to your connection string (already included above)

**Port 5432 blocked?**
- Supabase uses port 5432 by default
- Most ISPs allow this; if blocked, contact ISP

**Database doesn't show tables?**
- Run the SQL migrations again
- Check SQL Editor for errors

## Next Steps

Once database is connected:
1. ✅ Restart backend server (`npm run server:dev`)
2. ✅ Test bill submission through app
3. ✅ Verify data appears in Supabase SQL Editor
4. ✅ Share app with test users!

