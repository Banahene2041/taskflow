-- Run once in the Supabase SQL Editor if your tasks table was created
-- before list reordering existed.

alter table public.tasks
  add column if not exists position integer not null default 0;

create index if not exists tasks_status_position_idx
  on public.tasks (user_id, status, position);

with ranked as (
  select
    id,
    row_number() over (
      partition by user_id, status
      order by position asc, created_at asc
    ) - 1 as next_position
  from public.tasks
)
update public.tasks as t
set position = ranked.next_position
from ranked
where t.id = ranked.id
  and t.position is distinct from ranked.next_position;
