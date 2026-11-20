"use client";

import { format } from "date-fns";
import { Check, Circle } from "lucide-react";

import { SetupGate } from "@/components/board/setup-gate";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBoardStore } from "@/features/tasks/board-store";
import { BOARD_COLUMNS, PRIORITY_LABELS } from "@/features/tasks/constants";
import { useTasksByStatus } from "@/features/tasks/hooks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export default function TasksPage() {
  const { configured } = useAuth();
  const { tasks, loading, error, filters } = useBoardStore();
  const filtered = tasks.filter((task) => {
    const query = filters.search.trim().toLowerCase();
    if (query && !task.title.toLowerCase().includes(query)) return false;
    return true;
  });
  const grouped = useTasksByStatus(filtered);

  if (!configured) {
    return <SetupGate />;
  }

  return (
    <AppShell>
      <div className="px-4 py-4 sm:px-6">
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create one from the Board view or the Create button.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {BOARD_COLUMNS.map((column) => {
              const columnTasks = grouped[column.id];
              if (columnTasks.length === 0) return null;

              return (
                <section key={column.id}>
                  <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
                    <h2 className="text-sm font-semibold">{column.title}</h2>
                    <span className="text-sm text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>

                  <ul className="divide-y divide-border">
                    {columnTasks.map((task) => {
                      const done = task.status === "done";
                      return (
                        <li
                          key={task.id}
                          className="grid grid-cols-[minmax(0,1fr)_110px_110px] items-center gap-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                                done
                                  ? "border-success bg-success text-success-foreground"
                                  : "border-muted-foreground/50",
                              )}
                            >
                              {done ? (
                                <Check className="size-2.5" strokeWidth={3} />
                              ) : (
                                <Circle className="size-2.5 opacity-0" />
                              )}
                            </span>
                            <span
                              className={cn(
                                "truncate text-sm",
                                done && "text-muted-foreground line-through",
                              )}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {task.assignee ? (
                              <>
                                <Avatar className="size-5">
                                  <AvatarFallback
                                    className="text-[9px] font-semibold text-white"
                                    style={{ backgroundColor: task.assignee.color }}
                                  >
                                    {task.assignee.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{task.assignee.name}</span>
                              </>
                            ) : (
                              <span>—</span>
                            )}
                          </div>

                          <div className="text-right text-xs text-muted-foreground">
                            {task.dueDate
                              ? format(new Date(task.dueDate), "MMM d")
                              : PRIORITY_LABELS[task.priority]}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
