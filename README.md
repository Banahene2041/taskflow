# TaskFlow

A polished Kanban task board for the Next Play Games internship assessment.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Supabase** (anonymous auth + RLS), and **@dnd-kit**.

## Features

### Required
- Anonymous guest sessions (Supabase Auth)
- Kanban board: To Do · In Progress · In Review · Done
- Create / edit / delete tasks (title, description, priority, due date, assignee, labels)
- Drag-and-drop status updates with optimistic UI
- RLS so each guest only sees their own data
- Loading, empty, and error states
- Light / dark / system themes

### Advanced
- Team members with colored avatars + assignment
- Labels / tags with board filtering
- Task comments (chronological)
- Activity log (status moves, edits, assignments)
- Due-date urgency indicators (soon / overdue)
- Search + filters (priority, assignee, label)
- Board summary stats

## Setup

### 1. Install

```bash
pnpm install
cp .env.example .env.local
```

### 2. Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. **Authentication → Providers → Anonymous** → enable.
3. **SQL Editor** → paste and run [`supabase/schema.sql`](./supabase/schema.sql).
4. **Project Settings → API** → copy Project URL and the **publishable** key into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Never put **secret** / **service role** keys in the frontend or commit them.

### 3. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). A guest session is created automatically.

```bash
pnpm build      # production build
pnpm start      # serve production
pnpm lint
pnpm typecheck
```

## Architecture

```text
src/
├── app/                 # Routes, layout, loading, error
├── components/
│   ├── board/           # Kanban UI, dialogs, detail panel, team settings
│   ├── layout/          # Shell, sidebar, header, theme toggle
│   └── ui/              # shadcn-style primitives
├── features/tasks/      # Types, schemas, API, board store, hooks
├── lib/supabase/        # Browser + server clients, proxy session refresh
├── providers/           # Theme + auth
└── proxy.ts             # Next.js 16 session refresh (replaces middleware)
```

Guest auth runs in the browser via `signInAnonymously()`. The Proxy refreshes cookies on each request. Mutations go through the typed client API and are enforced by RLS.

## Database schema

Full SQL lives in [`supabase/schema.sql`](./supabase/schema.sql).

Tables: `tasks`, `team_members`, `labels`, `task_labels`, `comments`, `task_activity`.

`tasks` fields: `id`, `title`, `description`, `status`, `priority`, `due_date`, `user_id`, `assignee_id`, `created_at`, `updated_at`.

## Deploy (Vercel)

1. Push the repo to GitHub.
2. Import in Vercel and set the two `NEXT_PUBLIC_SUPABASE_*` env vars.
3. Deploy. Include the live URL in your assessment PDF.

## Assessment notes

- Design system uses the assessment palette via CSS variables.
- Do not publicly post the assessment PDF or a public “submission” link on LinkedIn/GitHub profiles per the brief; a private demo URL on a resume is fine.
