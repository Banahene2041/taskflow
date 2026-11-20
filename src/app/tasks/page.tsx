"use client";

import { useState } from "react";

import { SetupGate } from "@/components/board/setup-gate";
import { TaskDetailPanel } from "@/components/board/task-detail-panel";
import { TaskDialog } from "@/components/board/task-dialog";
import { TaskList } from "@/components/board/task-list";
import { AppShell } from "@/components/layout/app-shell";
import { useBoardStore } from "@/features/tasks/board-store";
import type { Task, TaskStatus } from "@/features/tasks/types";
import { useAuth } from "@/providers/auth-provider";

export default function TasksPage() {
  const { configured, loading: authLoading } = useAuth();
  const { loading, error } = useBoardStore();
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

  return (
    <AppShell onCreateTask={() => openCreate("todo")}>
      <div className="px-4 py-4 sm:px-6">
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {authLoading || loading ? (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        ) : (
          <TaskList
            onOpenTask={(task) => {
              setSelectedTask(task);
              setDetailOpen(true);
            }}
            onCreateTask={openCreate}
          />
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
