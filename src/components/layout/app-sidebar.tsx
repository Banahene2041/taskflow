"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListChecks, Plus, Settings, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { label: "Board", href: "/", icon: LayoutGrid },
  { label: "List", href: "/tasks", icon: ListChecks },
  { label: "Team", href: "/settings", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  onCreateTask?: () => void;
};

export function AppSidebar({
  className,
  onNavigate,
  onCreateTask,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const shortId = user?.id ? user.id.slice(0, 8) : "guest";

  return (
    <aside
      className={cn(
        "flex h-full w-[244px] flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="px-3 pt-3">
        <Button
          variant="create"
          className="w-full justify-start rounded-full"
          onClick={() => {
            onCreateTask?.();
            onNavigate?.();
          }}
        >
          <Plus className="size-4" />
          Create
        </Button>
      </div>

      <div className="mt-4 px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {APP_NAME}
        </p>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-2" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-sidebar-border p-3">
        <Button
          variant="secondary"
          className="w-full justify-start rounded-lg bg-[#fcbd01] text-[#1e1f21] hover:bg-[#fcbd01]/90"
          asChild
        >
          <Link href="/settings" onClick={onNavigate}>
            Invite teammates
          </Link>
        </Button>
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-brand/25 text-xs font-semibold text-brand">
              GU
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Guest User</p>
            <p className="truncate text-xs text-muted-foreground">{shortId}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
