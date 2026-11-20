"use client";

import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  onCreateTask?: () => void;
};

export function AppShell({ children, title, onCreateTask }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <AppSidebar />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} onCreateTask={onCreateTask} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
