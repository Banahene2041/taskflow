"use client";

import { useState, type ReactNode } from "react";

import { TaskDialog } from "@/components/board/task-dialog";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ProjectHeader } from "@/components/layout/project-header";
import type { TaskStatus } from "@/features/tasks/types";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  onCreateTask?: () => void;
};

export function AppShell({ children, onCreateTask }: AppShellProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

  function openCreate(status: TaskStatus = "todo") {
    if (onCreateTask) {
      onCreateTask();
      return;
    }
    setDefaultStatus(status);
    setCreateOpen(true);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen border-r border-sidebar-border">
          <AppSidebar onCreateTask={() => openCreate("todo")} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <ProjectHeader onCreateTask={() => openCreate("todo")} />
        <main className="flex-1">{children}</main>
      </div>

      {!onCreateTask ? (
        <TaskDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          defaultStatus={defaultStatus}
        />
      ) : null}
    </div>
  );
}
