"use client";

import { useState } from "react";
import { Menu, Plus, Search } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useBoardStore } from "@/features/tasks/board-store";
import { useAuth } from "@/providers/auth-provider";

type AppHeaderProps = {
  title?: string;
  onCreateTask?: () => void;
};

export function AppHeader({
  title = "Board",
  onCreateTask,
}: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { filters, setFilters } = useBoardStore();
  const shortId = user?.id ? `${user.id.slice(0, 8)}…` : "Guest";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Plan work visually across your board
          </p>
        </div>

        <div className="relative hidden w-full max-w-xs md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            placeholder="Search tasks..."
            className="h-9 pl-9"
            aria-label="Search tasks"
          />
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Open profile menu"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  GU
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Guest session</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs">
              {shortId}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className="hidden sm:inline-flex"
          onClick={onCreateTask}
        >
          <Plus className="size-4" />
          Create Task
        </Button>
        <Button
          size="icon-sm"
          className="sm:hidden"
          onClick={onCreateTask}
          aria-label="Create task"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </header>
  );
}
