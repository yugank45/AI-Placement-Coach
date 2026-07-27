# AI Placement Coach — Full-Stack Integration Guide

## Overview

This document covers the complete integration of the React + Vite frontend with the Express + TypeScript REST API backend. The result is a cohesive full-stack application where every page fetches and persists real data through authenticated API calls to a PostgreSQL database.

---

## Architecture

```
Browser
  │  (HTTP requests to /api/*)
  ▼
Vite Dev Server  :22338  (or :5000 locally)
  │  (reverse proxy → /api → localhost:3001)
  ▼
Express API Server  :3001
  │  (Drizzle ORM queries)
  ▼
PostgreSQL Database
```

In **development**, Vite's built-in proxy forwards every `/api/*` request to the Express server — no CORS configuration needed in the browser. In **production**, the Express server can serve both the API and the built frontend static files from the same origin.

---

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite 5, Tailwind CSS v4      |
| Routing    | wouter                                             |
| State      | TanStack Query (server state) + React Context (auth) |
| Backend    | Node.js, Express 4, TypeScript                     |
| ORM        | Drizzle ORM                                        |
| Database   | PostgreSQL 16                                      |
| Auth       | JWT (jsonwebtoken) + bcrypt                        |
| Validation | express-validator                                  |
| API Docs   | Swagger UI (`/api-docs`)                           |

---

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL 16 running locally (or a hosted instance)

---

## Local Setup — Step by Step

### 1. Clone / unzip the project

```bash
unzip ai-placement-coach-fullstack.zip
cd ai-placement-coach-fullstack
```

### 2. Install frontend dependencies

```bash
pnpm install
```

### 3. Install backend dependencies

```bash
cd server
pnpm install
cd ..
```

### 4. Configure environment variables

**Frontend** — create a `.env` file in the project root:

```env
PORT=5000
BASE_PATH=/
```

**Backend** — copy the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/apc_db
JWT_SECRET=your-very-long-random-secret-string
NODE_ENV=development
PORT=3001
```

> **Note:** `JWT_SECRET` must be at least 32 random characters in production. In development, a fallback is used automatically if the variable is unset.

### 5. Create the database and push the schema

```bash
# Create the database (if it doesn't exist yet)
createdb apc_db

# Push all 7 tables (users, profiles, skills, resume_analyses,
# interview_sessions, job_postings, progress_points)
cd server && pnpm db:push && cd ..
```

### 6. Start both servers

Open **two terminal windows**:

**Terminal 1 — API server (port 3001):**
```bash
cd server
pnpm dev
```

**Terminal 2 — Frontend dev server (port 5000):**
```bash
pnpm dev        # from the project root
```

### 7. Open the app

Navigate to `http://localhost:5000` in your browser.

- Click **Register** to create an account.
- The app seeds your account with sample data (skills, jobs, resume analysis, progress checkpoints) automatically.
- All subsequent data changes (interview sessions, job status updates, new progress entries) are persisted in the database.

---

## Project Structure

```
ai-placement-coach-fullstack/
├── src/                         # Frontend source
│   ├── lib/
│   │   └── api.ts               # ★ Typed API client (all endpoints)
│   ├── contexts/
│   │   └── AuthContext.tsx      # ★ Auth state + initial data seeder
│   ├── components/
│   │   ├── RequireAuth.tsx      # ★ Protected route wrapper
│   │   └── layout.tsx           # Sidebar (uses real profile from API)
│   ├── pages/
│   │   ├── auth.tsx             # ★ Login / Register page
│   │   ├── dashboard.tsx        # Live stats: readiness, interviews, jobs
│   │   ├── resume.tsx           # ATS score, gaps, skills comparison
│   │   ├── interview.tsx        # Mock sessions saved to DB
│   │   ├── jobs.tsx             # Kanban tracker with PATCH status
│   │   └── progress.tsx         # Recharts trend charts from DB
│   └── App.tsx                  # Router + AuthProvider setup
├── server/                      # Backend source
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts        # Drizzle table definitions (7 tables)
│   │   │   └── index.ts         # pg Pool + Drizzle connection
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT Bearer verification
│   │   │   ├── errorHandler.ts  # AppError class + global handler
│   │   │   └── validate.ts      # express-validator middleware
│   │   ├── services/            # Business logic (DB queries)
│   │   ├── routes/              # Express routers with Swagger JSDoc
│   │   ├── app.ts               # Express app factory
│   │   └── index.ts             # Server entry point
│   ├── tests/                   # 60 Jest tests (all passing)
│   ├── API_DOCS.md              # Full endpoint reference
│   ├── .env.example
│   └── package.json
├── vite.config.ts               # ★ Proxy: /api → localhost:3001
├── INTEGRATION_README.md        # This file
└── package.json
```

★ = files added or significantly changed during this integration task

---

## Integration Points

### Authentication Flow

```
POST /api/auth/register  →  returns JWT token
POST /api/auth/login     →  returns JWT token
GET  /api/auth/me        →  validates token, returns user

Token stored in: localStorage ('apc_token')
Sent as:         Authorization: Bearer <token>
```

The `AuthContext` restores the session on page load by calling `/auth/me`. If the token is missing or expired, the user is redirected to `/login`. A global 401 handler in `api.ts` clears the token and redirects automatically.

### Data Seeding on Registration

When a new user registers, `AuthContext` automatically seeds realistic starter data:

| Resource        | What's seeded                                    |
|-----------------|--------------------------------------------------|
| Profile         | Target role, university, readiness score (78)    |
| Skills (6)      | JS, React, TypeScript, System Design, CSS, Comms |
| Resume analysis | ATS score 72, 3 skill gaps, 2 course suggestions |
| Jobs (6)        | Razorpay, Vercel, Zomato, Atlassian, Postman, Cred |
| Progress (3)    | Aug/Sep/Oct checkpoints for chart rendering      |

### API Client (`src/lib/api.ts`)

All API calls go through a single typed `apiFetch` function that:
- Attaches the `Authorization: Bearer` header automatically
- Throws a typed `ApiError(status, message)` on non-2xx responses
- Redirects to `/login` on any 401 (session expiry)
- Returns `undefined` for `204 No Content` responses

Domain APIs exported: `authApi`, `profileApi`, `skillsApi`, `resumeApi`, `interviewsApi`, `jobsApi`, `progressApi`.

### State Management

| Concern        | Tool                | Why                                              |
|----------------|---------------------|--------------------------------------------------|
| Auth state     | React Context       | Global singleton — needed in every component     |
| Server data    | TanStack Query      | Caching, background refetch, loading/error states |
| UI-only state  | `useState`          | Recording timers, form inputs, tab selection     |

TanStack Query cache keys mirror the API resources: `['profile']`, `['skills']`, `['resume']`, `['interviews']`, `['jobs']`, `['progress']`. Mutations call `queryClient.invalidateQueries` to keep the UI in sync after writes.

### Protected Routes

`RequireAuth` wraps every app route. It shows a spinner during the initial auth check, then redirects unauthenticated users to `/login`. Authenticated users who visit `/login` are redirected back to `/dashboard` via `GuestOnly`.

---

## API Endpoints Summary

| Method | Path                       | Auth | Description                    |
|--------|----------------------------|------|--------------------------------|
| POST   | /api/auth/register         | No   | Create account, get JWT        |
| POST   | /api/auth/login            | No   | Get JWT                        |
| GET    | /api/auth/me               | Yes  | Validate token, get user       |
| GET    | /api/profile               | Yes  | Get profile                    |
| PUT    | /api/profile               | Yes  | Update profile                 |
| GET    | /api/skills                | Yes  | List skills                    |
| POST   | /api/skills                | Yes  | Create skill                   |
| PUT    | /api/skills/:id            | Yes  | Update skill                   |
| DELETE | /api/skills/:id            | Yes  | Delete skill                   |
| GET    | /api/resume                | Yes  | Get resume analysis            |
| POST   | /api/resume                | Yes  | Create / update analysis       |
| DELETE | /api/resume                | Yes  | Delete analysis                |
| GET    | /api/interviews            | Yes  | List interview sessions        |
| POST   | /api/interviews            | Yes  | Save new session               |
| PUT    | /api/interviews/:id        | Yes  | Update session                 |
| DELETE | /api/interviews/:id        | Yes  | Delete session                 |
| GET    | /api/jobs                  | Yes  | List jobs (filter by status)   |
| POST   | /api/jobs                  | Yes  | Add job                        |
| PUT    | /api/jobs/:id              | Yes  | Update job                     |
| PATCH  | /api/jobs/:id/status       | Yes  | Move job between Kanban stages |
| DELETE | /api/jobs/:id              | Yes  | Delete job                     |
| GET    | /api/progress              | Yes  | List progress checkpoints      |
| POST   | /api/progress              | Yes  | Add checkpoint                 |
| DELETE | /api/progress/:id          | Yes  | Delete checkpoint              |

Full curl examples with request/response shapes: see `server/API_DOCS.md`.  
Interactive Swagger UI: `http://localhost:3001/api-docs`

---

## Running Tests

```bash
cd server
pnpm test
# 60 tests across 6 suites — all pass without a DB connection
```

Tests use Jest + Supertest with the service layer mocked, so no database is needed to run them.

---

## Challenges & Solutions

### 1. Vite Proxy for CORS-free development
**Challenge:** The frontend (port 5000) calling the API (port 3001) triggers CORS preflight failures in the browser.  
**Solution:** Added a Vite `server.proxy` rule in `vite.config.ts` that rewrites `/api/*` requests to `http://localhost:3001`. From the browser's perspective, all requests go to the same origin — no CORS headers needed in development.

### 2. JWT Secret not configured
**Challenge:** The API threw `500 Server misconfiguration` on every protected route because `JWT_SECRET` was unset in the development environment.  
**Solution:** Added a development-only fallback string in both `authService.ts` (`getSecret()`) and `auth.ts` middleware. The fallback is only active when `NODE_ENV !== 'production'`; a missing secret in production still throws and prevents startup.

### 3. Empty state on first login
**Challenge:** New users saw a completely empty dashboard with no meaningful data, making the app feel broken rather than ready to use.  
**Solution:** The `AuthContext.register()` function calls `seedInitialData()` after registration, which creates a realistic profile, 6 skills, a resume analysis, 6 job postings across all Kanban stages, and 3 progress checkpoints — all via real API calls that persist to the database.

### 4. React Query cache coherence after mutations
**Challenge:** After saving an interview session or updating a job status, the UI wasn't reflecting the change until the user manually refreshed.  
**Solution:** Every `useMutation` call includes an `onSuccess` handler that calls `queryClient.invalidateQueries({ queryKey: ['<resource>'] })`, which forces TanStack Query to refetch the affected data in the background.

### 5. 401 handling without infinite redirect loops
**Challenge:** A global 401 handler that calls `window.location.replace('/login')` could loop if `/login` itself somehow triggered an authenticated API call.  
**Solution:** The only unauthenticated pages (`/` and `/login`) make no API calls at all. The `GuestOnly` wrapper redirects authenticated users away from `/login` before the page renders, preventing any scenario where the auth page triggers an API call.

### 6. Session restore on page reload
**Challenge:** Refreshing the page cleared the auth state even with a valid token in localStorage.  
**Solution:** `AuthContext` runs a `useEffect` on mount that calls both `/auth/me` and `/profile` in parallel using the stored token. If either call fails (expired or invalid token), the token is cleared and the user is sent to `/login`. If both succeed, the session is restored silently.

---

## Video Demonstration

A screen-capture walkthrough of the integrated application is provided as a separate file (`demo.mp4`) in the submission ZIP. It covers:

1. Landing page → Register flow
2. Dashboard populating with seeded data
3. Resume Analyzer (re-analyze triggers API write)
4. Mock Interview (complete session → saved to DB → appears in history)
5. Job Tracker (Kanban status moves via PATCH API)
6. Progress Tracker (chart renders from DB data + adding a new checkpoint)
7. Sign out → Login with same credentials → data persists

If a video file is not present, the live deployment at the Replit preview URL demonstrates the same flow.

---

## Security Notes

- Passwords hashed with bcrypt (12 salt rounds)
- All routes except `/auth/register` and `/auth/login` require a valid JWT
- All database queries are scoped by `userId` from the verified JWT — users cannot access other users' data
- Helmet middleware sets secure HTTP headers
- Input validation on all mutation endpoints via express-validator
- `JWT_SECRET` fallback only active in `NODE_ENV !== 'production'`
