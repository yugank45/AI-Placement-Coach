# AI Placement Coach — API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3001`  
**Interactive docs:** `http://localhost:3001/api-docs` (Swagger UI)  
**OpenAPI spec:** `http://localhost:3001/api-docs.json`

---

## Authentication

All protected endpoints require a JSON Web Token in the HTTP `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `POST /api/auth/register` or `POST /api/auth/login`.  
Tokens expire after 7 days by default (configurable via `JWT_EXPIRES_IN`).

---

## Standard Response Format

**Success**
```json
{ /* resource or array of resources */ }
```

**Validation error (422)**
```json
{
  "errors": [
    { "type": "field", "msg": "Valid email is required", "path": "email", "location": "body" }
  ]
}
```

**Application error (4xx / 5xx)**
```json
{
  "error": "Human-readable error message"
}
```

---

## Endpoints

---

### Health

#### `GET /health`

Returns server status. No authentication required.

**Response `200`**
```json
{
  "status": "ok",
  "timestamp": "2024-10-15T12:00:00.000Z"
}
```

---

### Authentication

#### `POST /api/auth/register`

Register a new user account. Creates both the user and an initial profile.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `email` | string | ✅ | Valid email address |
| `password` | string | ✅ | Minimum 8 characters |
| `name` | string | ✅ | Non-empty |

**Example request**
```json
{
  "email": "arjun@iit.ac.in",
  "password": "securePass123",
  "name": "Arjun Mehta"
}
```

**Response `201`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "arjun@iit.ac.in",
    "createdAt": "2024-10-15T10:00:00.000Z"
  }
}
```

**Error responses**

| Status | Condition |
|---|---|
| `409 Conflict` | Email already in use |
| `422 Unprocessable Entity` | Validation failure |

---

#### `POST /api/auth/login`

Authenticate with email and password; receive a JWT.

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Example request**
```json
{
  "email": "arjun@iit.ac.in",
  "password": "securePass123"
}
```

**Response `200`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "arjun@iit.ac.in",
    "createdAt": "2024-10-15T10:00:00.000Z"
  }
}
```

**Error responses**

| Status | Condition |
|---|---|
| `401 Unauthorized` | Invalid email or password |
| `422 Unprocessable Entity` | Validation failure |

---

#### `GET /api/auth/me` 🔒

Returns the currently authenticated user.

**Response `200`**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "arjun@iit.ac.in",
  "createdAt": "2024-10-15T10:00:00.000Z"
}
```

**Error responses**

| Status | Condition |
|---|---|
| `401 Unauthorized` | Missing, invalid, or expired token |
| `404 Not Found` | User deleted after token was issued |

---

### Profile

#### `GET /api/profile` 🔒

Returns the authenticated user's student profile.

**Response `200`**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Arjun Mehta",
  "university": "Indian Institute of Technology",
  "targetRole": "Frontend Engineer",
  "readinessScore": 78,
  "createdAt": "2024-10-15T10:00:00.000Z",
  "updatedAt": "2024-10-15T10:00:00.000Z"
}
```

**Error responses**

| Status | Condition |
|---|---|
| `401 Unauthorized` | Not authenticated |
| `404 Not Found` | Profile not found |

---

#### `PUT /api/profile` 🔒

Updates the authenticated user's profile. All fields are optional — only send what needs to change.

**Request body**

| Field | Type | Constraints |
|---|---|---|
| `name` | string | Non-empty |
| `university` | string | — |
| `targetRole` | string | — |
| `readinessScore` | integer | 0–100 |

**Example request**
```json
{
  "targetRole": "Fullstack Engineer",
  "readinessScore": 85
}
```

**Response `200`** — updated profile object (same shape as GET).

---

### Skills

#### `GET /api/skills` 🔒

Returns all skills for the authenticated user.

**Response `200`**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "TypeScript",
    "currentLevel": 5,
    "requiredLevel": 8,
    "category": "core",
    "createdAt": "2024-10-15T10:00:00.000Z",
    "updatedAt": "2024-10-15T10:00:00.000Z"
  }
]
```

---

#### `GET /api/skills/:id` 🔒

Returns a single skill by ID.

**Path parameters**

| Parameter | Description |
|---|---|
| `id` | UUID of the skill |

**Response `200`** — skill object.

**Error responses** `401`, `404`

---

#### `POST /api/skills` 🔒

Creates a new skill for the authenticated user.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | ✅ | Non-empty |
| `currentLevel` | integer | ✅ | 0–10 |
| `requiredLevel` | integer | ✅ | 0–10 |
| `category` | string | ✅ | `core` \| `framework` \| `soft` \| `tool` |

**Example request**
```json
{
  "name": "TypeScript",
  "currentLevel": 5,
  "requiredLevel": 8,
  "category": "core"
}
```

**Response `201`** — created skill object.

**Error responses** `401`, `422`

---

#### `PUT /api/skills/:id` 🔒

Updates a skill. All fields are optional.

**Request body** — same fields as POST, all optional.

**Response `200`** — updated skill object.

**Error responses** `401`, `404`, `422`

---

#### `DELETE /api/skills/:id` 🔒

Deletes a skill.

**Response `204 No Content`**

**Error responses** `401`, `404`

---

### Resume Analysis

#### `GET /api/resume` 🔒

Returns the authenticated user's latest resume analysis.

**Response `200`**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "atsScore": 72,
  "extractedSkills": ["JavaScript", "React", "HTML", "CSS", "Git"],
  "gaps": [
    { "skill": "TypeScript", "reason": "Most modern frontend roles require strict typing." },
    { "skill": "Testing", "reason": "No mention of Jest or Cypress." }
  ],
  "recommendedCourses": [
    { "title": "Advanced React & TypeScript", "url": "https://example.com", "duration": "4 hours" }
  ],
  "fileName": "arjun_resume_2024.pdf",
  "createdAt": "2024-10-15T10:00:00.000Z",
  "updatedAt": "2024-10-15T10:00:00.000Z"
}
```

**Error responses** `401`, `404`

---

#### `POST /api/resume` 🔒

Creates or replaces the resume analysis for the authenticated user (upsert — a user has exactly one analysis at a time).

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `atsScore` | integer | ✅ | 0–100 |
| `extractedSkills` | string[] | ✅ | Array of strings |
| `gaps` | object[] | ✅ | Each must have `skill` and `reason` |
| `recommendedCourses` | object[] | ✅ | Each must have `title`, `url`, and `duration` |
| `fileName` | string | ❌ | — |

**Response `200`** — upserted analysis object.

**Error responses** `401`, `422`

---

#### `DELETE /api/resume` 🔒

Deletes the authenticated user's resume analysis.

**Response `204 No Content`**

**Error responses** `401`, `404`

---

### Interview Sessions

#### `GET /api/interviews` 🔒

Returns all interview sessions for the authenticated user, sorted newest first.

**Response `200`**
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-10-10",
    "role": "Frontend Engineer",
    "question": "Explain the virtual DOM and React reconciliation.",
    "score": 85,
    "feedback": "Great explanation of diffing algorithm.",
    "status": "completed",
    "createdAt": "2024-10-10T09:00:00.000Z",
    "updatedAt": "2024-10-10T09:00:00.000Z"
  }
]
```

---

#### `GET /api/interviews/:id` 🔒

Returns a single interview session.

**Response `200`** — session object. **Error responses** `401`, `404`

---

#### `POST /api/interviews` 🔒

Creates a new interview session.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `date` | string | ✅ | Date string (e.g. `"2024-10-10"`) |
| `role` | string | ✅ | Non-empty |
| `question` | string | ✅ | Non-empty |
| `score` | integer | ❌ | 0–100 or null |
| `feedback` | string | ❌ | — |
| `status` | string | ❌ | `completed` \| `in_progress` (default: `in_progress`) |

**Response `201`** — created session object.

**Error responses** `401`, `422`

---

#### `PUT /api/interviews/:id` 🔒

Updates an interview session. All fields optional.

**Request body** — same fields as POST, all optional.

**Response `200`** — updated session object.

**Error responses** `401`, `404`, `422`

---

#### `DELETE /api/interviews/:id` 🔒

Deletes an interview session.

**Response `204 No Content`**

**Error responses** `401`, `404`

---

### Job Postings

#### `GET /api/jobs` 🔒

Returns all job postings for the authenticated user, sorted by `fitScore` descending.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Filter by status: `saved` \| `applied` \| `interviewing` \| `offer` |

**Example:** `GET /api/jobs?status=applied`

**Response `200`**
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "company": "Razorpay",
    "role": "Frontend Engineer - SDE 1",
    "location": "Bengaluru",
    "remote": false,
    "fitScore": 92,
    "status": "interviewing",
    "salary": "18-24 LPA",
    "logoUrl": null,
    "createdAt": "2024-10-01T10:00:00.000Z",
    "updatedAt": "2024-10-12T10:00:00.000Z"
  }
]
```

---

#### `GET /api/jobs/:id` 🔒

Returns a single job posting.

**Response `200`** — job object. **Error responses** `401`, `404`

---

#### `POST /api/jobs` 🔒

Adds a job posting to the tracker.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `company` | string | ✅ | Non-empty |
| `role` | string | ✅ | Non-empty |
| `location` | string | ❌ | — |
| `remote` | boolean | ❌ | Default: `false` |
| `fitScore` | integer | ❌ | 0–100; default: `0` |
| `status` | string | ❌ | `saved` \| `applied` \| `interviewing` \| `offer`; default: `saved` |
| `salary` | string | ❌ | — |
| `logoUrl` | string | ❌ | Must be a valid URL |

**Response `201`** — created job object. **Error responses** `401`, `422`

---

#### `PUT /api/jobs/:id` 🔒

Updates a job posting. All fields optional.

**Response `200`** — updated job object. **Error responses** `401`, `404`, `422`

---

#### `PATCH /api/jobs/:id/status` 🔒

Updates only the application status of a job — the lightweight kanban move operation.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `status` | string | ✅ | `saved` \| `applied` \| `interviewing` \| `offer` |

**Example request**
```json
{ "status": "applied" }
```

**Response `200`** — updated job object. **Error responses** `401`, `404`, `422`

---

#### `DELETE /api/jobs/:id` 🔒

Deletes a job posting.

**Response `204 No Content`** **Error responses** `401`, `404`

---

### Progress

#### `GET /api/progress` 🔒

Returns all progress data points for the authenticated user, sorted oldest first (for chart rendering).

**Response `200`**
```json
[
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "Aug",
    "readiness": 45,
    "interviews": 1,
    "applications": 2,
    "createdAt": "2024-08-01T00:00:00.000Z"
  },
  {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "Sep",
    "readiness": 58,
    "interviews": 3,
    "applications": 5,
    "createdAt": "2024-09-01T00:00:00.000Z"
  }
]
```

---

#### `POST /api/progress` 🔒

Records a new progress data point.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `date` | string | ✅ | Label for the point (e.g. `"Oct"`, `"2024-10-01"`) |
| `readiness` | integer | ✅ | 0–100 |
| `interviews` | integer | ❌ | ≥ 0; default: `0` |
| `applications` | integer | ❌ | ≥ 0; default: `0` |

**Example request**
```json
{
  "date": "Oct",
  "readiness": 78,
  "interviews": 6,
  "applications": 12
}
```

**Response `201`** — created progress point object. **Error responses** `401`, `422`

---

#### `DELETE /api/progress/:id` 🔒

Deletes a progress point.

**Response `204 No Content`** **Error responses** `401`, `404`

---

## HTTP Status Code Reference

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `204 No Content` | Deleted successfully |
| `401 Unauthorized` | Missing, invalid, or expired JWT |
| `404 Not Found` | Resource not found (or belongs to another user) |
| `409 Conflict` | Unique constraint — e.g. email already registered |
| `422 Unprocessable Entity` | Validation errors — see `errors` array in response |
| `500 Internal Server Error` | Unexpected server-side failure |

---

## Example Workflow

```bash
BASE="http://localhost:3001"

# 1. Register
TOKEN=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@iit.ac.in","password":"securePass123","name":"Arjun Mehta"}' \
  | jq -r .token)

# 2. Update profile
curl -s -X PUT $BASE/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"university":"IIT Bombay","targetRole":"Frontend Engineer","readinessScore":50}'

# 3. Add a skill
curl -s -X POST $BASE/api/skills \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"TypeScript","currentLevel":5,"requiredLevel":8,"category":"core"}'

# 4. Record a progress point
curl -s -X POST $BASE/api/progress \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"Oct","readiness":78,"interviews":6,"applications":12}'

# 5. Track a job application
curl -s -X POST $BASE/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company":"Razorpay","role":"Frontend Engineer","fitScore":92,"status":"saved"}'

# 6. Move it to applied
JOB_ID="<id from step 5>"
curl -s -X PATCH $BASE/api/jobs/$JOB_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"applied"}'
```
