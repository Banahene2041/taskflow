"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  formatActivityMessage,
  formatActivityTime,
} from "@/features/tasks/activity";
import { useBoardStore } from "@/features/tasks/board-store";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/features/tasks/constants";
import type {
  Task,
  TaskActivity,
  TaskComment,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types";

type TaskDetailPanelProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function TaskDetailBody({
  task,
  onOpenChange,
}: {
  task: Task;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    members,
    labels,
    updateTask,
    removeTask,
    loadComments,
    addComment,
    loadActivity,
  } = useBoardStore();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "none");
  const [selectedLabels, setSelectedLabels] = useState(
    task.labels.map((label) => label.id),
  );
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [nextComments, nextActivity] = await Promise.all([
          loadComments(task.id),
          loadActivity(task.id),
        ]);
        if (!active) return;
        setComments(nextComments);
        setActivity(nextActivity);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load task details.",
        );
      } finally {
        if (active) setDetailsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [task.id, loadComments, loadActivity]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateTask({
        id: task.id,
        title,
        description,
        status,
        priority,
        dueDate,
        assigneeId: assigneeId === "none" ? null : assigneeId,
        labelIds: selectedLabels,
      });
      const nextActivity = await loadActivity(task.id);
      setActivity(nextActivity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task.");
    } finally {
      setSaving(false);
    }
  }

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    if (!commentBody.trim()) return;

    try {
      const created = await addComment({
        taskId: task.id,
        body: commentBody.trim(),
      });
      setComments((prev) => [...prev, created]);
      setCommentBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this task?")) return;

    try {
      await removeTask(task.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    }
  }

  function toggleLabel(labelId: string) {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
        <div className="grid gap-2">
          <Label htmlFor="detail-title">Title</Label>
          <Input
            id="detail-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="detail-description">Description</Label>
          <Textarea
            id="detail-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((item) => (
                  <SelectItem key={item} value={item}>
                    {PRIORITY_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="grid min-w-0 gap-2">
            <Label htmlFor="detail-due">Due date</Label>
            <Input
              id="detail-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div className="grid min-w-0 gap-2">
            <Label>Assignee</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Labels</Label>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => {
              const selected = selectedLabels.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: selected ? label.color : undefined,
                    backgroundColor: selected ? `${label.color}22` : undefined,
                    color: selected ? label.color : undefined,
                  }}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </form>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Comments</h3>
        {detailsLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-border bg-muted/40 p-3"
                >
                  <p className="text-sm">{comment.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), "MMM d, yyyy · p")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        <form
          className="space-y-2"
          onSubmit={(event) => void handleComment(event)}
        >
          <Textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Write a comment..."
          />
          <Button type="submit" size="sm" disabled={!commentBody.trim()}>
            Add comment
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Activity</h3>
        <div className="space-y-3">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm">{formatActivityMessage(item)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatActivityTime(item.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function TaskDetailPanel({
  task,
  open,
  onOpenChange,
}: TaskDetailPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Task details</SheetTitle>
          <SheetDescription>
            Edit details, leave comments, and review activity.
          </SheetDescription>
        </SheetHeader>

        {task && open ? (
          <TaskDetailBody
            key={task.id}
            task={task}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
