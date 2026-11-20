"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_LABELS } from "@/features/tasks/constants";
import type {
  BoardFilters,
  TaskAssignee,
  TaskLabel,
  TaskPriority,
} from "@/features/tasks/types";

type BoardToolbarProps = {
  taskCount: number;
  filters: BoardFilters;
  members: TaskAssignee[];
  labels: TaskLabel[];
  onFiltersChange: (next: Partial<BoardFilters>) => void;
};

export function BoardToolbar({
  taskCount,
  filters,
  members,
  labels,
  onFiltersChange,
}: BoardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Kanban board</h2>
        <p className="text-sm text-muted-foreground">
          {taskCount} visible task{taskCount === 1 ? "" : "s"} · drag cards
          between columns
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ search: event.target.value })
            }
            placeholder="Search title..."
            className="h-9 pl-9"
            aria-label="Search tasks by title"
          />
        </div>

        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFiltersChange({
              priority: value as TaskPriority | "all",
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assigneeId}
          onValueChange={(value) => onFiltersChange({ assigneeId: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.labelId}
          onValueChange={(value) => onFiltersChange({ labelId: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All labels</SelectItem>
            {labels.map((label) => (
              <SelectItem key={label.id} value={label.id}>
                {label.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
