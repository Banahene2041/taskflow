"use client";

import { useMemo, useState } from "react";

import { Board } from "@/components/board/board";
import { StatsCards } from "@/components/board/stats-cards";
import { TaskDialog } from "@/components/board/task-dialog";
import { AppShell } from "@/components/layout/app-shell";
import { useTaskStats } from "@/features/tasks/hooks";
import { MOCK_TASKS } from "@/features/tasks/mock-data";
import { APP_DESCRIPTION } from "@/lib/constants";

export function Dashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const tasks = useMemo(() => MOCK_TASKS, []);
  const stats = useTaskStats(tasks);

  return (
    <AppShell title="Board" onCreateTask={() => setCreateOpen(true)}>
      <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <p className="text-sm font-medium text-primary">Welcome back</p>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Keep work flowing with a calm, intentional board.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {APP_DESCRIPTION} This preview uses mock data so you can evaluate
            layout, hierarchy, and interaction design before persistence is
            connected.
          </p>
        </section>

        <StatsCards stats={stats} />
        <Board tasks={tasks} />
      </div>

      <TaskDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppShell>
  );
}
