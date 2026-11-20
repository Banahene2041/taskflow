"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ListChecks,
  Settings,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { label: "Board", href: "/", icon: LayoutGrid },
  { label: "My Tasks", href: "/tasks", icon: ListChecks },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const shortId = user?.id ? user.id.slice(0, 8) : "guest";

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {APP_NAME}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Product workspace
          </p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 px-3 py-3">
          <Avatar className="size-9">
            <AvatarFallback
              className="bg-primary/15 text-primary"
              style={{ backgroundColor: "color-mix(in srgb, #635BFF 18%, transparent)" }}
            >
              GU
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Guest User</p>
            <p className="truncate text-xs text-muted-foreground">
              {shortId}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
