"use client";

import { Filter, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  onCreateTask?: () => void;
};

export function BoardToolbar({
  taskCount,
  filters,
  members,
  labels,
  onFiltersChange,
  onCreateTask,
}: BoardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onCreateTask}>
          + Add task
        </Button>
        <span className="text-xs text-muted-foreground">
          {taskCount} task{taskCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFiltersChange({
              priority: value as TaskPriority | "all",
            })
          }
        >
          <SelectTrigger className="h-8 w-[140px] border-transparent bg-transparent shadow-none">
            <Filter className="size-3.5" />
            <SelectValue placeholder="Filter" />
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
          <SelectTrigger className="h-8 w-[150px] border-transparent bg-transparent shadow-none">
            <SlidersHorizontal className="size-3.5" />
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
          <SelectTrigger className="h-8 w-[140px] border-transparent bg-transparent shadow-none">
            <Search className="size-3.5" />
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
