# AI Placement Coach — REST API

A production-ready RESTful API server built with **Node.js + Express + TypeScript** and **PostgreSQL** (via Drizzle ORM). It backs the AI Placement Coach web application, handling authentication, student profiles, skills tracking, resume analysis, mock interview sessions, job application tracking, and progress charting.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Setup & Running](#setup--running)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [Running Tests](#running-tests)
8. [API Overview](#api-overview)
9. [Security](#security)
10. [Design Decisions](#design-decisions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 15+ |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | express-validator |
| HTTP security | helmet + cors |
| API docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Testing | Jest + supertest + ts-jest |
| Dev server | tsx (watch mode) |

---

## Project Structure

```
server/
├── src/
│   ├── app.ts                  # Express app factory (used by tests and server)
│   ├── index.ts                # Server entry point
│   ├── db/
│   │   ├── index.ts            # Drizzle DB connection pool
│   │   └── schema.ts           # All table definitions + relations
│   ├── middleware/
│   │   ├── auth.ts             # JWT Bearer authentication middleware
│   │   ├── errorHandler.ts     # Global error handler + AppError class
│   │   └── validate.ts         # express-validator result middleware
│   ├── services/               # Business logic + DB queries (one file per domain)
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   ├── skillService.ts
│   │   ├── resumeService.ts
│   │   ├── interviewService.ts
│   │   ├── jobService.ts
│   │   └── progressService.ts
│   └── routes/                 # Express routers (validation chains + service calls)
│       ├── index.ts
│       ├── auth.ts
│       ├── profile.ts
│       ├── skills.ts
│       ├── resume.ts
│       ├── interviews.ts
│       ├── jobs.ts
│       └── progress.ts
├── tests/
│   ├── setup.ts                # Shared test helpers (token factories, fixture IDs)
│   ├── auth.test.ts
│   ├── profile.test.ts
│   ├── skills.test.ts
│   ├── interviews.test.ts
│   ├── jobs.test.ts
│   └── progress.test.ts
├── drizzle/                    # Auto-generated migration files (git-committed)
├── .env.example                # Template — copy to .env for local dev
├── drizzle.config.ts
├── jest.config.ts
├── package.json
├── tsconfig.json
├── README.md                   # This file
└── API_DOCS.md                 # Detailed endpoint reference
```

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (or npm/yarn — adjust commands accordingly)
- **PostgreSQL** ≥ 15

> **On Replit:** The PostgreSQL database is provisioned automatically and `DATABASE_URL` is injected into the environment. No additional setup is required.

---

## Setup & Running

### 1. Clone / extract the project

```bash
# If you received a ZIP:
unzip ai-placement-coach-api.zip
cd server
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables below)
```

### 4. Push the database schema

```bash
pnpm db:push
```

This runs `drizzle-kit push` and creates all tables in the PostgreSQL database specified by `DATABASE_URL`. It is idempotent — safe to run multiple times.

### 5. Start the development server

```bash
pnpm dev
```

The server starts with hot-reload via `tsx`. Output:

```
✅  AI Placement Coach API running on http://0.0.0.0:3001
📚  Swagger docs:     http://0.0.0.0:3001/api-docs
🏥  Health check:     http://0.0.0.0:3001/health
```

### 6. (Optional) Build for production

```bash
pnpm build     # compiles TypeScript → dist/
pnpm start     # runs the compiled server
```

---

## Environment Variables

Copy `.env.example` to `.env` and set the values below.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Full PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Secret key for signing JWTs. Use ≥ 32 random characters in production. |
| `JWT_EXPIRES_IN` | ❌ | `7d` | Token lifetime (e.g. `1d`, `12h`, `7d`) |
| `PORT` | ❌ | `3001` | Port the HTTP server binds to |
| `NODE_ENV` | ❌ | `development` | `development` or `production` (affects error message verbosity) |
| `CORS_ORIGINS` | ❌ | `*` | Comma-separated list of allowed CORS origins |

---

## Database Schema

Seven tables, all using UUID primary keys:

| Table | Description |
|---|---|
| `users` | Auth credentials (email + bcrypt hash) |
| `profiles` | One-to-one student profile per user |
| `skills` | Many skills per user (level 0–10, four categories) |
| `resume_analyses` | One analysis per user (JSONB for skills/gaps/courses) |
| `interview_sessions` | Many sessions per user (score 0–100, status enum) |
| `job_postings` | Many jobs per user (fit score 0–100, kanban status) |
| `progress_points` | Many time-series points per user |

All tables include `created_at` and `updated_at` timestamps (except `progress_points` which has only `created_at`). Foreign keys cascade-delete when the parent user is deleted.

---

## Running Tests

Tests use **Jest + supertest** with all service-layer database calls **mocked**. No database connection is required to run them.

```bash
# Run all tests
pnpm test

# Run with coverage report
pnpm test:coverage

# Run a specific test file
pnpm test -- tests/auth.test.ts

# Watch mode
pnpm test -- --watch
```

### What is tested

| Test file | Coverage |
|---|---|
| `auth.test.ts` | Register (happy path, duplicate email, validation), Login (success, bad credentials, missing fields), /me (authenticated, no token, bad token) |
| `profile.test.ts` | Get (authenticated, 401, 404), Update (success, score out of range, blank name) |
| `skills.test.ts` | List, Get (404), Create (success, missing name, bad category, level out of range), Update (success, 404), Delete (success, 404) |
| `interviews.test.ts` | List (401), Get (404), Create (success, missing fields, score OOB, bad status), Update, Delete (404) |
| `jobs.test.ts` | List (status filter, invalid filter, 401), Get (404), Create (success, missing company, fitScore OOB), Patch status (success, invalid status), Delete |
| `progress.test.ts` | List (401), Create (success, missing readiness, OOB, missing date), Delete (404) |

---

## API Overview

The full reference is in [API_DOCS.md](./API_DOCS.md). Interactive Swagger UI is available at `/api-docs` when the server is running.

### Base URL

```
http://localhost:3001
```

### Authentication

All routes except `POST /api/auth/register` and `POST /api/auth/login` require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Endpoints at a glance

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login, receive JWT |
| `GET` | `/api/auth/me` | Get current user 🔒 |
| `GET` | `/api/profile` | Get profile 🔒 |
| `PUT` | `/api/profile` | Update profile 🔒 |
| `GET` | `/api/skills` | List skills 🔒 |
| `POST` | `/api/skills` | Create skill 🔒 |
| `GET` | `/api/skills/:id` | Get skill 🔒 |
| `PUT` | `/api/skills/:id` | Update skill 🔒 |
| `DELETE` | `/api/skills/:id` | Delete skill 🔒 |
| `GET` | `/api/resume` | Get resume analysis 🔒 |
| `POST` | `/api/resume` | Create/replace resume analysis 🔒 |
| `DELETE` | `/api/resume` | Delete resume analysis 🔒 |
| `GET` | `/api/interviews` | List interview sessions 🔒 |
| `POST` | `/api/interviews` | Create session 🔒 |
| `GET` | `/api/interviews/:id` | Get session 🔒 |
| `PUT` | `/api/interviews/:id` | Update session 🔒 |
| `DELETE` | `/api/interviews/:id` | Delete session 🔒 |
| `GET` | `/api/jobs` | List jobs (filterable by status) 🔒 |
| `POST` | `/api/jobs` | Add job 🔒 |
| `GET` | `/api/jobs/:id` | Get job 🔒 |
| `PUT` | `/api/jobs/:id` | Update job 🔒 |
| `PATCH` | `/api/jobs/:id/status` | Update job status only 🔒 |
| `DELETE` | `/api/jobs/:id` | Delete job 🔒 |
| `GET` | `/api/progress` | List progress points 🔒 |
| `POST` | `/api/progress` | Record progress point 🔒 |
| `DELETE` | `/api/progress/:id` | Delete progress point 🔒 |

🔒 = Requires `Authorization: Bearer <token>` header

---

## Security

| Concern | Implementation |
|---|---|
| Password storage | bcrypt with 12 salt rounds |
| Authentication | Stateless JWT; tokens expire (default 7 days) |
| Input validation | express-validator on every mutating route |
| HTTP headers | helmet sets security headers (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | Configurable allowed-origins list |
| SQL injection | Drizzle ORM parameterised queries; no raw string interpolation |
| Data isolation | Every query scopes rows by `userId` from the verified JWT |
| Error leakage | In `production` mode, internal error messages are suppressed |

---

## Design Decisions

- **Service layer:** Routes stay thin (validate → call service → respond). Business logic and DB queries live in `src/services/`. This makes unit testing trivial — tests mock services, not the database.
- **Upsert for resume:** A user has exactly one resume analysis. `POST /api/resume` is an upsert — create on first call, replace on subsequent calls.
- **PATCH for job status:** Kanban-style status moves are a common, lightweight operation. A dedicated `PATCH /:id/status` endpoint avoids requiring the full job body for a single field change.
- **AppError:** A typed error class lets services throw structured errors that the global error handler serialises into consistent JSON responses without leaking stack traces.
- **Test isolation:** All tests mock the service layer. No database is needed to run the test suite — CI can run `pnpm test` with zero infrastructure.
