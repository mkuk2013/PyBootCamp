# PyBootCamp — API Reference

All routes are JSON. Auth uses NextAuth JWT cookie. Protected routes return:
- `401 Unauthorized` — not logged in
- `403 Forbidden` — logged in but missing role
- `400 Bad Request` — Zod validation failure (`{ error, issues }`)

## Auth

### `POST /api/auth/signup`
Create new account (status: **pending approval**).

Body:
```json
{ "name": "Ali", "email": "ali@x.com", "password": "Strong1234" }
```
Responses: `201` ok · `409` email exists · `400` validation.

### `POST /api/auth/callback/credentials`  *(NextAuth handles this)*
Login. Use client `signIn("credentials", { email, password })`.

---

## Learning (User – approved)

### `GET /api/levels`
Returns array of `LevelProgress`:
```ts
{ id, title, description, order, totalTasks, completedTasks, percent, unlocked }
```

### `GET /api/modules/:id`
Returns `{ module, tasks: [...with completed flag] }`.

### `POST /api/run`
Run code without grading.
```json
{ "code": "print(1+1)", "stdin": "" }
```
Returns:
```ts
{ stdout, stderr, compileOutput, status, time, memory }
```

### `POST /api/submissions`
Run + grade. Saves submission, returns:
```ts
{ pass, score, output, detail: [{ idx, pass, expected, got, stderr }] }
```

### `GET /api/leaderboard`
Top 50: `[{ rank, userId, name, email, totalScore, tasksSolved }]`.

---

## Admin (role = "admin")

| Method | Path | Body |
|--------|------|------|
| `PATCH` | `/api/admin/users/[id]` | `{ approved?: boolean, role?: "user"\|"admin" }` |
| `DELETE` | `/api/admin/users/[id]` | — |
| `POST` | `/api/admin/levels` | `{ title, description?, order }` |
| `PATCH` | `/api/admin/levels/[id]` | partial of POST |
| `DELETE` | `/api/admin/levels/[id]` | — (cascades to modules/tasks) |
| `POST` | `/api/admin/modules` | `{ levelId, title, content, order }` |
| `PATCH` | `/api/admin/modules/[id]` | partial |
| `DELETE` | `/api/admin/modules/[id]` | — |
| `POST` | `/api/admin/tasks` | `{ moduleId, question, starterCode?, expectedOutput, testCases?, difficulty, order }` |
| `PATCH` | `/api/admin/tasks/[id]` | partial |
| `DELETE` | `/api/admin/tasks/[id]` | — |

`testCases` is a JSON-string array: `[{ "input": "3\n", "expected": "6" }]`

---

## Page Routes

| Path | Access |
|------|--------|
| `/` | public landing |
| `/login` `/signup` `/pending` | public |
| `/dashboard` | approved users |
| `/level/[id]` | approved users (level must be unlocked) |
| `/module/[id]` | approved users |
| `/task/[id]` | approved users |
| `/leaderboard` | approved users |
| `/certificate` | approved users (unlocks at 100% completion) |
| `/admin` `/admin/*` | admins only |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation/bad input |
| 401 | Not logged in |
| 403 | Wrong role |
| 404 | Not found |
| 409 | Conflict (e.g., duplicate email) |
| 502 | Judge0 unavailable |
