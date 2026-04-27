# PyBootCamp — Step-by-Step Setup Guide

## 1. Prerequisites

- **Node.js** ≥ 18.17 (https://nodejs.org)
- **npm** (comes with Node)
- A **Turso** account → https://turso.tech (free tier is enough)
- A **RapidAPI** account with Judge0 CE subscription → https://rapidapi.com/judge0-official/api/judge0-ce

---

## 2. Install Dependencies

```bash
cd PyBootCamp
npm install
```

This installs Next 14, Drizzle, NextAuth, Monaco, bcrypt, react-markdown, and all dev deps.

---

## 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```ini
# Turso DB
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="ey..."

# Generate via:  openssl rand -base64 32
NEXTAUTH_SECRET="<32-char-random-string>"
NEXTAUTH_URL="http://localhost:3000"

# Judge0
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="<your-rapidapi-key>"
JUDGE0_API_HOST="judge0-ce.p.rapidapi.com"

# Bootstrap admin
ADMIN_EMAIL="admin@pybootcamp.com"
ADMIN_PASSWORD="ChangeMe123!"
ADMIN_NAME="Super Admin"
```

> 💡 **Local-only dev?** Set `TURSO_DATABASE_URL="file:./local.db"` and leave the auth token empty.

### Create the Turso DB:
```bash
npm install -g @turso/cli
turso auth login
turso db create pybootcamp
turso db tokens create pybootcamp        # → TURSO_AUTH_TOKEN
turso db show pybootcamp --url           # → TURSO_DATABASE_URL
```

---

## 4. Initialize Database

```bash
npm run db:push    # creates all tables
npm run db:seed    # creates admin + 3 levels + 3 modules + 5 tasks
```

You can verify with:
```bash
npm run db:studio   # GUI at https://local.drizzle.studio
```

---

## 5. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 6. First Login

1. Go to **/login**
2. Email: `admin@pybootcamp.com`  Password: `ChangeMe123!` (whatever you set)
3. You'll land on the dashboard with sample levels.

### Create Another Admin Anytime

```bash
npm run create-admin -- --email=alice@x.com --password=SuperSafe123 --name="Alice"
```

---

## 7. Test the Full Flow

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign up at `/signup` as a normal user | "Pending approval" screen |
| 2 | Login → blocked | Error: "pending admin approval" |
| 3 | Login as admin → `/admin/users` → Approve | User row turns green |
| 4 | Logout → login as the approved user | Dashboard loads |
| 5 | Beginner → Hello, Python → first task → write `print("Hello, World!")` | Run shows output |
| 6 | Click Submit | Toast: "Passed! +10 pts", progress updates |
| 7 | Complete all tasks | `/certificate` becomes available |

---

## 8. Production Build

```bash
npm run build
npm start
```

Or deploy to **Vercel**:
1. Push repo to GitHub
2. Import on vercel.com
3. Add all `.env.local` variables to Vercel project settings
4. Deploy ✅

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `next: command not found` | Run `npm install` first |
| `TURSO_DATABASE_URL is not set` | Check `.env.local` exists and has the var |
| `Judge0 error 403` | Subscribe to Judge0 CE on RapidAPI (free tier works) |
| Login throws "pending approval" | Login as admin and approve the user |
| Schema changes don't take effect | Re-run `npm run db:push` |
