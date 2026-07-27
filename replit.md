# AI Placement Coach

A fully client-side React + Vite web app that helps final-year students prepare for campus/off-campus placements. All "AI" behaviour (resume scoring, interview feedback, etc.) is simulated with local state and timers — no backend, no database, no external API calls.

## Stack

- **React 18 + Vite 5** — component-based UI, fast dev server
- **wouter** — lightweight client-side routing
- **Tailwind CSS v4** — utility-first styling with custom CSS theme variables
- **Radix UI primitives** — accessible unstyled components (tabs, tooltip, dialog, etc.)
- **Recharts** — area/line charts on the Progress Tracker page
- **Framer Motion** — micro-interactions and page transitions
- **TypeScript** throughout

## Pages / Routes

| Route | Page |
|---|---|
| `/` | Landing page |
| `/dashboard` | Command centre — readiness score, next actions |
| `/resume` | Resume Analyzer — simulated ATS scoring, skill gaps |
| `/interview` | Mock Interview — idle → recording → processing → result flow |
| `/jobs` | Job Recommendations + kanban application tracker |
| `/progress` | Charts: readiness trend, interview/application activity |

## Running the app

The dev server requires two env vars (`PORT` and `BASE_PATH`), both set in Replit's shared environment:

```
PORT=5000
BASE_PATH=/
```

The managed **web** workflow starts the app automatically:

```bash
pnpm run dev
```

The Vite dev server binds to `0.0.0.0` and the Replit artifact system assigns the actual port at runtime.

## User preferences

_(none recorded yet)_
