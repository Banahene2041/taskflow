"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, Menu, Search } from "lucide-react";

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useBoardStore } from "@/features/tasks/board-store";
import { useAuth } from "@/providers/auth-provider";

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { filters, setFilters } = useBoardStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const shortId = user?.id ? `${user.id.slice(0, 8)}…` : "Guest";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-header">
      <div className="relative flex h-12 items-center gap-3 px-3 sm:px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="pointer-events-none absolute inset-x-0 flex justify-center px-16">
          <div className="pointer-events-auto relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={searchRef}
              type="search"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="Search"
              aria-label="Search tasks"
              className="h-9 w-full rounded-full border-0 bg-search px-10 pr-14 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ⌘ K
            </kbd>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" aria-label="Help" className="hidden sm:inline-flex">
            <HelpCircle className="size-4" />
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="Open profile menu"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-brand/20 text-[10px] font-semibold text-brand">
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
        </div>
      </div>
    </header>
  );
}
