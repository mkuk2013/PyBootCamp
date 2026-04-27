# 🐍 PyBootCamp

> Interactive LMS for learning Python — built with Next.js 14, TypeScript, Tailwind CSS, Drizzle ORM, Turso (SQLite), NextAuth, and Judge0.

---

## ✨ Features (Planned)

- 🔐 Authentication with NextAuth (Credentials Provider)
- 👨‍💼 Admin approval workflow for new users
- 📚 Level-based curriculum (Beginner → Intermediate → Advanced)
- 📝 Modules with explanations + code examples
- 💻 Interactive Monaco code editor with Python syntax highlighting
- 🚀 Real code execution via Judge0 API
- ✅ Auto-graded tasks with test cases
- 📊 Progress tracking & locked/unlocked levels
- 🏆 Certificates, leaderboard, notifications
- 🌓 Dark / Light mode

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Turso (libSQL / SQLite) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js (Credentials) |
| Code Editor | Monaco Editor |
| Code Runner | Judge0 API |
| Validation | Zod |

---

## 🚀 Setup Guide (Step 1 – Project Initialization)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Then fill in:

- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from [turso.tech](https://turso.tech)
- `NEXTAUTH_SECRET` (generate via `openssl rand -base64 32`)
- `JUDGE0_*` keys from [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)

> 💡 For local development without Turso, you can set:
> `TURSO_DATABASE_URL="file:./local.db"` and leave the auth token empty.

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Folder Structure

```
PyBootCamp/
├── app/                # Next.js App Router pages
│   ├── (auth)/login, signup
│   ├── dashboard/
│   ├── level/[id]/
│   ├── module/[id]/
│   ├── admin/
│   └── api/            # Route handlers
├── components/         # Reusable React components
├── lib/                # db, auth, judge0 helpers
│   └── db/
│       ├── index.ts
│       └── schema.ts
├── scripts/            # seed.ts, etc.
├── drizzle/            # Generated migrations
└── public/
```

---

## 🗺 Build Roadmap

| Step | Topic | Status |
|------|-------|--------|
| 1 | Project setup | ✅ |
| 2 | Database schema (Drizzle + Turso) | ⏳ Next |
| 3 | Authentication (NextAuth + bcrypt) | ⏳ |
| 4 | User Dashboard + Levels | ⏳ |
| 5 | Module + Task pages | ⏳ |
| 6 | Code Editor + Judge0 | ⏳ |
| 7 | Submissions + Progress | ⏳ |
| 8 | Admin Panel | ⏳ |
| 9 | Certificates + Leaderboard | ⏳ |

---

## 📝 License

MIT © 2026 PyBootCamp
