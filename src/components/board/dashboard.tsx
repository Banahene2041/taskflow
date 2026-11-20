"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Board } from "@/components/board/board";
import { SetupGate } from "@/components/board/setup-gate";
import { StatsCards } from "@/components/board/stats-cards";
import { TaskDetailPanel } from "@/components/board/task-detail-panel";
import { TaskDialog } from "@/components/board/task-dialog";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/features/tasks/board-store";
import { useTaskStats } from "@/features/tasks/hooks";
import type { Task, TaskStatus } from "@/features/tasks/types";
import { useAuth } from "@/providers/auth-provider";

export function Dashboard() {
  const { configured, loading: authLoading, error: authError, refresh } =
    useAuth();
  const {
    tasks,
    loading,
    error,
    refresh: refreshBoard,
    seedDemo,
  } = useBoardStore();
  const stats = useTaskStats(tasks);

  const [createOpen, setCreateOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function handleSeedDemo() {
    setSeeding(true);
    try {
      await seedDemo();
    } finally {
      setSeeding(false);
    }
  }

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
    <AppShell onCreateTask={() => openCreate("todo")}>
      <div className="space-y-4 px-4 py-4 sm:px-6">
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
          <div className="flex items-center gap-3 px-1 py-8 text-sm text-muted-foreground">
            <div
              className="size-5 animate-spin rounded-full border-2 border-border border-t-primary"
              aria-hidden
            />
            Loading board…
          </div>
        ) : (
          <>
            {tasks.length === 0 ? (
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">No tasks yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a task or load demo data to explore the board.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => void handleSeedDemo()}
                  disabled={seeding}
                  className="shrink-0"
                >
                  <Sparkles className="size-4" />
                  {seeding ? "Loading…" : "Load demo data"}
                </Button>
              </div>
            ) : (
              <StatsCards stats={stats} />
            )}
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
