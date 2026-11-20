"use client";

import { useState } from "react";

import { Board } from "@/components/board/board";
import { SetupGate } from "@/components/board/setup-gate";
import { StatsCards } from "@/components/board/stats-cards";
import { TaskDetailPanel } from "@/components/board/task-detail-panel";
import { TaskDialog } from "@/components/board/task-dialog";
import { AppShell } from "@/components/layout/app-shell";
import { useBoardStore } from "@/features/tasks/board-store";
import { useTaskStats } from "@/features/tasks/hooks";
import type { Task, TaskStatus } from "@/features/tasks/types";
import { APP_DESCRIPTION } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";

export function Dashboard() {
  const { configured, loading: authLoading, error: authError, refresh } =
    useAuth();
  const { tasks, members, loading, error, refresh: refreshBoard } =
    useBoardStore();
  const stats = useTaskStats(tasks);

  const [createOpen, setCreateOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  if (!configured) {
    return <SetupGate />;
  }

  function openCreate(status: TaskStatus = "todo") {
    setDefaultStatus(status);
    setCreateOpen(true);
  }

  function openTask(task: Task) {
    setSelectedTask(task);
    setDetailOpen(true);
  }

  return (
    <AppShell title="Board" onCreateTask={() => openCreate("todo")}>
      <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <p className="text-sm font-medium text-primary">Welcome back</p>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Keep work flowing with a calm, intentional board.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {APP_DESCRIPTION} Tasks are scoped to your anonymous guest session
            with Row Level Security.
          </p>
        </section>

        {members.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Team
            </span>
            {members.map((member) => (
              <span
                key={member.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium"
              >
                <span
                  className="flex size-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </span>
                {member.name}
              </span>
            ))}
          </div>
        ) : null}

        {(authError || error) && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p>{authError || error}</p>
            <button
              type="button"
              className="mt-2 font-medium underline"
              onClick={() => {
                void refresh();
                void refreshBoard();
              }}
            >
              Retry
            </button>
          </div>
        )}

        {authLoading || loading ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            <div
              className="size-5 animate-spin rounded-full border-2 border-border border-t-primary"
              aria-hidden
            />
            Loading your board…
          </div>
        ) : (
          <>
            <StatsCards stats={stats} />
            <Board onOpenTask={openTask} onCreateTask={openCreate} />
          </>
        )}
      </div>

      <TaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStatus={defaultStatus}
      />
      <TaskDetailPanel
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </AppShell>
  );
}
