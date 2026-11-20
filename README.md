# TaskFlow

A polished Kanban-style task board built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**.

This repository is currently in **phase 1**: application shell, design system, task foundation, and a mock-data dashboard. Authentication, RLS, CRUD, and drag-and-drop land in later phases.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + CSS variables |
| UI | shadcn/ui primitives + Lucide icons |
| Auth / DB | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — stubs only for now |
| Validation | Zod |
| Dates | date-fns |
| DnD | `@dnd-kit/*` (installed, not wired yet) |
| Themes | `next-themes` (light / dark / system) |
| Package manager | pnpm |

## Getting started

```bash
pnpm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY when ready
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
pnpm dev          # development server (Turbopack)
pnpm build        # production build
pnpm start        # serve production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
```

## Project structure

```text
src/
├── app/                 # App Router routes, layout, loading, error
├── components/
│   ├── layout/          # Sidebar, header, shell, theme toggle
│   ├── board/           # Kanban board, columns, cards, dialog, stats
│   └── ui/              # Reusable shadcn-style primitives
├── features/tasks/      # Types, schemas, constants, hooks, mock data
├── lib/supabase/        # Browser + server client helpers
└── providers/           # Theme provider
```

## Manual configuration

1. Create a free Supabase project.
2. Copy `.env.example` → `.env.local` and paste the **project URL** and **anon key**.
3. Do **not** put the service-role key in frontend env vars or commit it.

Database schema, RLS, and anonymous guest auth will be added in a subsequent phase. The app UI runs with mock data without Supabase credentials.

## Design system

Central CSS variables in `src/app/globals.css` drive light and dark themes:

- Light background `#F7F8FA`, surface `#FFFFFF`, primary `#635BFF`
- Dark background `#171923`, surface `#242735`, elevated `#303445`

## Phase 1 scope

Implemented:

- Application shell (sidebar, header, responsive mobile nav)
- Theme system with system preference support
- Mock Kanban board (To Do / In Progress / In Review / Done)
- Task types, Zod schemas, board constants
- Supabase client stubs
- Loading and error UI

Not yet implemented (by design):

- Supabase anonymous auth / guest sessions
- Database tables and RLS
- Real task CRUD
- Drag-and-drop status updates
