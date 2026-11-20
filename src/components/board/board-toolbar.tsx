import { Filter, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BoardToolbarProps = {
  taskCount: number;
};

export function BoardToolbar({ taskCount }: BoardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Kanban board</h2>
        <p className="text-sm text-muted-foreground">
          {taskCount} tasks across four workflow stages
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Filter by title..."
          className="h-9 w-full sm:w-52"
          aria-label="Filter board by title"
          disabled
        />
        <Button variant="outline" size="sm" disabled>
          <Filter className="size-4" />
          Filters
        </Button>
        <Button variant="outline" size="sm" disabled>
          <SlidersHorizontal className="size-4" />
          View
        </Button>
      </div>
    </div>
  );
}
