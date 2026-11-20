"use client";

import { format } from "date-fns";

import { SetupGate } from "@/components/board/setup-gate";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { useBoardStore } from "@/features/tasks/board-store";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/features/tasks/constants";
import { useAuth } from "@/providers/auth-provider";

export default function TasksPage() {
  const { configured } = useAuth();
  const { tasks, loading, error } = useBoardStore();

  if (!configured) {
    return <SetupGate />;
  }

  return (
    <AppShell title="My Tasks">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">My Tasks</h2>
          <p className="text-sm text-muted-foreground">
            A flat list of everything on your board.
          </p>
        </section>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create one from the board to see it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {STATUS_LABELS[task.status]}
                    </Badge>
                    <Badge variant="outline">
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {task.dueDate ? (
                    <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                  ) : null}
                  {task.assignee ? <span>{task.assignee.name}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
