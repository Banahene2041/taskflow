"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List, Plus, Settings2, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/features/tasks/board-store";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const VIEW_TABS = [
  { label: "List", href: "/tasks", icon: List },
  { label: "Board", href: "/", icon: LayoutGrid },
] as const;

type ProjectHeaderProps = {
  onCreateTask?: () => void;
};

export function ProjectHeader({ onCreateTask }: ProjectHeaderProps) {
  const pathname = usePathname();
  const { members } = useBoardStore();

  return (
    <div className="border-b border-border bg-background px-4 pt-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <Sparkles className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {APP_NAME}
            </h1>
            <p className="text-xs text-muted-foreground">Product workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {members.length > 0 ? (
            <div className="hidden items-center -space-x-1.5 sm:flex">
              {members.slice(0, 4).map((member) => (
                <Avatar
                  key={member.id}
                  className="size-7 border-2 border-background"
                  title={member.name}
                >
                  <AvatarFallback
                    className="text-[10px] font-semibold text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : null}
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/settings">
              <Settings2 className="size-4" />
              Customize
            </Link>
          </Button>
          <Button variant="create" size="sm" onClick={onCreateTask}>
            <Plus className="size-4" />
            Add task
          </Button>
        </div>
      </div>

      <nav className="mt-4 flex items-center gap-5 overflow-x-auto" aria-label="Views">
        {VIEW_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative inline-flex items-center gap-1.5 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-3.5" aria-hidden />
              {tab.label}
              {isActive ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
