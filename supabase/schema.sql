-- TaskFlow schema + RLS
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Also enable Anonymous Sign-Ins: Authentication → Providers → Anonymous.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  color text not null default '#635BFF',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  color text not null default '#635BFF',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  due_date date,
  assignee_id uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_labels (
  task_id uuid not null references public.tasks (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  primary key (task_id, label_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (user_id, status);
create index if not exists team_members_user_id_idx on public.team_members (user_id);
create index if not exists labels_user_id_idx on public.labels (user_id);
create index if not exists comments_task_id_idx on public.comments (task_id);
create index if not exists task_activity_task_id_idx on public.task_activity (task_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Activity helpers
-- ---------------------------------------------------------------------------

create or replace function public.log_task_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.task_activity (task_id, user_id, action, meta)
    values (
      new.id,
      new.user_id,
      'created',
      jsonb_build_object('title', new.title, 'status', new.status)
    );
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      insert into public.task_activity (task_id, user_id, action, meta)
      values (
        new.id,
        new.user_id,
        'status_changed',
        jsonb_build_object('from', old.status, 'to', new.status)
      );
    end if;

    if old.title is distinct from new.title
      or old.description is distinct from new.description
      or old.priority is distinct from new.priority
      or old.due_date is distinct from new.due_date then
      insert into public.task_activity (task_id, user_id, action, meta)
      values (
        new.id,
        new.user_id,
        'updated',
        jsonb_build_object(
          'title_changed', old.title is distinct from new.title,
          'priority_changed', old.priority is distinct from new.priority,
          'due_date_changed', old.due_date is distinct from new.due_date
        )
      );
    end if;

    if old.assignee_id is distinct from new.assignee_id then
      insert into public.task_activity (task_id, user_id, action, meta)
      values (
        new.id,
        new.user_id,
        'assignee_changed',
        jsonb_build_object('from', old.assignee_id, 'to', new.assignee_id)
      );
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_log_activity on public.tasks;
create trigger tasks_log_activity
after insert or update on public.tasks
for each row
execute function public.log_task_activity();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.team_members enable row level security;
alter table public.labels enable row level security;
alter table public.tasks enable row level security;
alter table public.task_labels enable row level security;
alter table public.comments enable row level security;
alter table public.task_activity enable row level security;

-- team_members
drop policy if exists "team_members_select_own" on public.team_members;
create policy "team_members_select_own"
  on public.team_members for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "team_members_insert_own" on public.team_members;
create policy "team_members_insert_own"
  on public.team_members for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "team_members_update_own" on public.team_members;
create policy "team_members_update_own"
  on public.team_members for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "team_members_delete_own" on public.team_members;
create policy "team_members_delete_own"
  on public.team_members for delete
  to authenticated
  using (user_id = auth.uid());

-- labels
drop policy if exists "labels_select_own" on public.labels;
create policy "labels_select_own"
  on public.labels for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "labels_insert_own" on public.labels;
create policy "labels_insert_own"
  on public.labels for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "labels_update_own" on public.labels;
create policy "labels_update_own"
  on public.labels for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "labels_delete_own" on public.labels;
create policy "labels_delete_own"
  on public.labels for delete
  to authenticated
  using (user_id = auth.uid());

-- tasks
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete
  to authenticated
  using (user_id = auth.uid());

-- task_labels (via owned task)
drop policy if exists "task_labels_select_own" on public.task_labels;
create policy "task_labels_select_own"
  on public.task_labels for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "task_labels_insert_own" on public.task_labels;
create policy "task_labels_insert_own"
  on public.task_labels for insert
  to authenticated
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.user_id = auth.uid()
    )
    and exists (
      select 1 from public.labels l
      where l.id = label_id and l.user_id = auth.uid()
    )
  );

drop policy if exists "task_labels_delete_own" on public.task_labels;
create policy "task_labels_delete_own"
  on public.task_labels for delete
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and t.user_id = auth.uid()
    )
  );

-- comments
drop policy if exists "comments_select_own" on public.comments;
create policy "comments_select_own"
  on public.comments for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.tasks t
      where t.id = task_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (user_id = auth.uid());

-- task_activity
drop policy if exists "task_activity_select_own" on public.task_activity;
create policy "task_activity_select_own"
  on public.task_activity for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "task_activity_insert_own" on public.task_activity;
create policy "task_activity_insert_own"
  on public.task_activity for insert
  to authenticated
  with check (user_id = auth.uid());
