# TaskFlow — Assessment Overview

Source document for `firstname_lastname_task_manager_assessment.pdf`.

## Overview & design decisions

TaskFlow is a guest-session Kanban board inspired by Asana and Linear: calm surfaces, clear hierarchy, and intentional interaction design. The stack is **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, **shadcn/ui**, **Supabase** (anonymous auth + Postgres RLS), and **@dnd-kit** for drag-and-drop.

Design tokens live in CSS variables for light and dark themes (Asana-like neutrals, coral Create, blue active tabs). The shell uses a persistent sidebar, sticky header with search, List/Board views, and a horizontally scrollable board so columns stay readable on smaller screens.

Optimistic DnD keeps status and order updates snappy; writes persist to Supabase on drop. Each browser gets an anonymous guest session so data is isolated by `user_id` under RLS.

## Live app

- Frontend URL: https://taskflow-livid-iota.vercel.app
- GitHub repository: https://github.com/Banahene2041/taskflow

## Database schema

Full SQL: [`supabase/schema.sql`](../supabase/schema.sql) (paste into the PDF appendix).

If the project was created before list/board reordering, also run [`supabase/migration_add_task_position.sql`](../supabase/migration_add_task_position.sql).

### Tables

| Table | Purpose |
| --- | --- |
| `tasks` | Core board items (`id`, `title`, `status`, `user_id`, `created_at`, plus description, priority, due_date, assignee_id, position) |
| `team_members` | Guest-owned “team” for assignees |
| `labels` / `task_labels` | Custom tags + many-to-many |
| `comments` | Task discussion |
| `task_activity` | Status / edit / assignment history (trigger-backed) |

RLS is enabled on all tables so `auth.uid()` can only read/write their own rows.

## Local setup

1. `pnpm install`
2. Copy `.env.example` → `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and the **publishable/anon** key only
3. In Supabase: enable **Authentication → Providers → Anonymous**
4. Run `supabase/schema.sql` in the SQL Editor (and the position migration if needed)
5. `pnpm dev` → http://localhost:3000 (guest session starts automatically)

Never commit the service-role / secret key. Only the public anon/publishable key belongs in the frontend.

## Required features (checklist)

- [x] Columns: To Do, In Progress, In Review, Done
- [x] Drag tasks between columns (status updates on drop)
- [x] Create tasks (title + optional description, priority, due date, assignee, labels)
- [x] Guest anonymous auth + RLS
- [x] Loading, empty, and error states
- [x] Responsive layout (sidebar sheet on mobile)

## Advanced features built

1. **Team members & assignees** — create members with color, assign on create/edit, avatars on cards  
2. **Task comments** — detail panel, chronological timestamps, `comments` table  
3. **Activity log** — trigger-written timeline (created, status moves, field edits)  
4. **Labels / tags** — create labels, multi-assign, filter board by label  
5. **Due date indicators** — overdue / due-soon styling on cards  
6. **Search & filtering** — header search by title; toolbar filters for priority, assignee, label  
7. **Board summary** — total, completed, and overdue counts above the board  

Extras beyond the brief: List view with the same DnD model, within-column reordering via `position`.

## Tradeoffs / future work

- Client-side optimistic board state (no Supabase Realtime yet) — drop persistence meets the brief; Realtime would sync multiple tabs  
- Anonymous guests cannot recover a session after clearing storage — expected for guest-only auth  
- Single assignee per task (multi-assignee would need a join table)  
- CAPTCHA / rate limits for anonymous sign-in would harden abuse resistance in production  
- Richer text descriptions and file attachments would be natural follow-ups  

## Security

- Frontend uses only `NEXT_PUBLIC_SUPABASE_URL` + publishable/anon key  
- RLS policies bind all CRUD to `auth.uid()`  
- Service-role key is never used in the app and must not be committed  
