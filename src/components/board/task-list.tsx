"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Check, Circle, GripVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BOARD_COLUMNS, PRIORITY_LABELS } from "@/features/tasks/constants";
import { useBoardStore } from "@/features/tasks/board-store";
import { resolveDropTarget } from "@/features/tasks/dnd";
import { taskBoardCollisionDetection } from "@/features/tasks/dnd-collision";
import { useFilteredTasks, useTasksByStatus } from "@/features/tasks/hooks";
import type { Task, TaskStatus } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

const dropAnimation: DropAnimation = {
  duration: 180,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.45" },
    },
  }),
};

function ListRowOverlay({ task }: { task: Task }) {
  return (
    <div className="flex w-[min(720px,90vw)] items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg">
      <GripVertical className="size-4 text-muted-foreground" />
      <span className="truncate text-sm font-medium">{task.title}</span>
    </div>
  );
}

function ListRow({
  task,
  onOpen,
}: {
  task: Task;
  onOpen?: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task, status: task.status },
  });

  const done = task.status === "done";
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className="relative touch-none">
      {isDragging ? (
        <div
          className="mx-1 my-0.5 h-10 rounded-md border-2 border-dashed border-primary/40 bg-primary/5"
          aria-hidden
        />
      ) : (
        <button
          type="button"
          className={cn(
            "group grid w-full cursor-grab grid-cols-[20px_minmax(0,1fr)_120px_110px] items-center gap-2 rounded-md px-1 py-2 text-left transition-colors",
            "hover:bg-muted/60 active:cursor-grabbing",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          onClick={() => onOpen?.(task)}
          {...listeners}
          {...attributes}
        >
          <span
            className="flex size-5 items-center justify-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            <GripVertical className="size-3.5" />
          </span>

          <span className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                done
                  ? "border-success bg-success text-success-foreground"
                  : "border-muted-foreground/50",
              )}
            >
              {done ? (
                <Check className="size-2.5" strokeWidth={3} />
              ) : (
                <Circle className="size-2.5 opacity-0" />
              )}
            </span>
            <span
              className={cn(
                "truncate text-sm",
                done && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </span>
          </span>

          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.assignee ? (
              <>
                <Avatar className="size-5">
                  <AvatarFallback
                    className="text-[9px] font-semibold text-white"
                    style={{ backgroundColor: task.assignee.color }}
                  >
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{task.assignee.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground/70">—</span>
            )}
          </span>

          <span className="text-right text-xs text-muted-foreground">
            {task.dueDate
              ? format(new Date(task.dueDate), "MMM d")
              : PRIORITY_LABELS[task.priority]}
          </span>
        </button>
      )}
    </li>
  );
}

function ListSection({
  status,
  title,
  tasks,
  onOpenTask,
  onAddTask,
}: {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onOpenTask?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: status,
    data: { type: "section", status },
  });
  const highlighted = Boolean(active) && isOver;
  const itemIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  return (
    <section>
      <div className="mb-1 flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "rounded-lg transition-colors",
          highlighted && "bg-primary/5 ring-1 ring-primary/30",
        )}
      >
        <div className="mb-1 hidden grid-cols-[20px_minmax(0,1fr)_120px_110px] gap-2 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
          <span />
          <span>Name</span>
          <span>Assignee</span>
          <span className="text-right">Due date</span>
        </div>

        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <ul>
            {tasks.map((task) => (
              <ListRow key={task.id} task={task} onOpen={onOpenTask} />
            ))}
          </ul>
        </SortableContext>

        {tasks.length === 0 ? (
          <div
            className={cn(
              "mx-1 my-2 rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground",
              highlighted ? "border-primary/40 bg-primary/5" : "border-border/70",
            )}
          >
            {highlighted ? "Release to move here" : "Drop tasks here"}
          </div>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          className="mt-1 justify-start text-muted-foreground"
          onClick={() => onAddTask?.(status)}
        >
          <Plus className="size-4" />
          Add task
        </Button>
      </div>
    </section>
  );
}

type TaskListProps = {
  onOpenTask?: (task: Task) => void;
  onCreateTask?: (status?: TaskStatus) => void;
};

export function TaskList({ onOpenTask, onCreateTask }: TaskListProps) {
  const {
    tasks,
    filters,
    reorderTaskLocal,
    restoreTasks,
    commitTaskOrder,
  } = useBoardStore();
  const filteredTasks = useFilteredTasks(tasks, filters);
  const grouped = useTasksByStatus(filteredTasks);
  const groupedAll = useTasksByStatus(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const dragSnapshotRef = useRef<Task[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const taskLookup = useMemo(() => {
    const map = new Map<string, Task>();
    for (const task of tasks) map.set(task.id, task);
    return map;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(taskLookup.get(String(event.active.id)) ?? null);
    setMoveError(null);
    dragSnapshotRef.current = tasks;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTaskState = taskLookup.get(activeId);
    if (!activeTaskState) return;

    const overData = over.data.current as
      | { type?: string; status?: TaskStatus; task?: Task }
      | undefined;

    const target = resolveDropTarget(
      overId,
      overData,
      activeId,
      groupedAll,
      tasks,
    );
    if (!target) return;

    if (
      activeTaskState.status === target.status &&
      overData?.type !== "task"
    ) {
      return;
    }

    if (activeTaskState.status === target.status) {
      const fromIndex = groupedAll[target.status].findIndex(
        (task) => task.id === activeId,
      );
      if (fromIndex === target.index) return;
    }

    reorderTaskLocal(activeId, target.status, target.index);
  }

  async function handleDragEnd(_event: DragEndEvent) {
    setActiveTask(null);
    const snapshot = dragSnapshotRef.current;
    dragSnapshotRef.current = null;
    if (!snapshot) return;

    try {
      await commitTaskOrder(snapshot);
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "Failed to reorder task.",
      );
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
    const snapshot = dragSnapshotRef.current;
    dragSnapshotRef.current = null;
    if (snapshot) restoreTasks(snapshot);
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <p className="font-medium">No tasks yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create one from Add task, or switch to Board view.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => onCreateTask?.("todo")}
        >
          <Plus className="size-4" />
          Add task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onCreateTask?.("todo")}>
          + Add task
        </Button>
        <span className="text-xs text-muted-foreground">
          Drag a row to reorder or move between sections
        </span>
      </div>

      {moveError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {moveError}
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={taskBoardCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={(event) => {
          void handleDragEnd(event);
        }}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-6">
          {BOARD_COLUMNS.map((column) => (
            <ListSection
              key={column.id}
              status={column.id}
              title={column.title}
              tasks={grouped[column.id]}
              onOpenTask={onOpenTask}
              onAddTask={onCreateTask}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? <ListRowOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
