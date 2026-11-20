# TaskFlow — Assessment Overview

Use this document as the source for `firstname_lastname_task_manager_assessment.pdf`.

## Overview & design decisions

TaskFlow is a guest-session Kanban board inspired by Linear/Asana: calm surfaces, clear hierarchy, and keyboard-friendly controls. The stack is Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui primitives, Supabase Auth + Postgres with RLS, and @dnd-kit for drag-and-drop.

Design tokens live in CSS variables for light and dark themes. The shell uses a persistent sidebar, sticky header, and a horizontally scrollable board so columns stay readable on smaller screens.

## Live app

- Frontend URL: _add Vercel URL after deploy_
- GitHub repository: _add repo URL_

## Database schema

See `supabase/schema.sql` in the repository (also paste the full SQL into the PDF appendix).

## Local setup

1. `pnpm install`
2. Enable Anonymous auth in Supabase
3. Run `supabase/schema.sql`
4. Copy `.env.example` → `.env.local` with URL + anon key
5. `pnpm dev`

## Advanced features built

1. Team members & assignees
2. Task comments
3. Task activity log
4. Labels / tags + filter
5. Due date urgency indicators
6. Search & filtering
7. Board summary stats

## Tradeoffs / future work

- Client-side board state keeps DnD snappy; could add Realtime subscriptions next.
- Anonymous guests cannot recover a session after clearing storage — expected for the brief.
- CAPTCHA / rate limits for anonymous sign-in would harden abuse resistance in production.
- Multi-select assignees and richer rich-text descriptions would be natural follow-ups.
