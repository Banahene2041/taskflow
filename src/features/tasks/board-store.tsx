"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createComment,
  createLabel,
  createMember,
  createTask,
  deleteLabel,
  deleteMember,
  deleteTask,
  ensureDefaultLabels,
  fetchActivity,
  fetchBoardData,
  fetchComments,
  seedDemoData,
  updateTask,
  updateTaskStatus,
} from "@/features/tasks/api";
import type {
  CreateCommentInput,
  CreateLabelInput,
  CreateMemberInput,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/features/tasks/schemas";
import type {
  BoardFilters,
  Task,
  TaskActivity,
  TaskAssignee,
  TaskComment,
  TaskLabel,
  TaskStatus,
} from "@/features/tasks/types";
import { useAuth } from "@/providers/auth-provider";

type BoardStoreValue = {
  tasks: Task[];
  members: TaskAssignee[];
  labels: TaskLabel[];
  filters: BoardFilters;
  setFilters: (next: Partial<BoardFilters>) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  moveTask: (taskId: string, status: TaskStatus) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  addMember: (input: CreateMemberInput) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  addLabel: (input: CreateLabelInput) => Promise<void>;
  removeLabel: (labelId: string) => Promise<void>;
  loadComments: (taskId: string) => Promise<TaskComment[]>;
  addComment: (input: CreateCommentInput) => Promise<TaskComment>;
  loadActivity: (taskId: string) => Promise<TaskActivity[]>;
  seedDemo: () => Promise<void>;
};

const defaultFilters: BoardFilters = {
  search: "",
  priority: "all",
  assigneeId: "all",
  labelId: "all",
};

const BoardStoreContext = createContext<BoardStoreValue | null>(null);

export function BoardStoreProvider({ children }: { children: ReactNode }) {
  const { user, configured, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TaskAssignee[]>([]);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [filters, setFiltersState] = useState<BoardFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!configured || !user) return;

    setLoading(true);
    setError(null);

    try {
      await ensureDefaultLabels();
      const data = await fetchBoardData();
      setTasks(data.tasks);
      setMembers(data.members);
      setLabels(data.labels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board.");
    } finally {
      setLoading(false);
    }
  }, [configured, user]);

  useEffect(() => {
    if (authLoading || !user) return;

    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authLoading, user, refresh]);

  const setFilters = useCallback((next: Partial<BoardFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo<BoardStoreValue>(
    () => ({
      tasks,
      members,
      labels,
      filters,
      setFilters,
      loading: authLoading || loading,
      error,
      refresh,
      async createTask(input) {
        const created = await createTask(input);
        setTasks((prev) => [...prev, created]);
        setLabels((prev) => {
          const missing = created.labels.filter(
            (label) => !prev.some((item) => item.id === label.id),
          );
          return missing.length ? [...prev, ...missing] : prev;
        });
      },
      async updateTask(input) {
        const updated = await updateTask(input);
        setTasks((prev) =>
          prev.map((task) => (task.id === updated.id ? updated : task)),
        );
      },
      async moveTask(taskId, status) {
        const previous = tasks;
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task,
          ),
        );

        try {
          await updateTaskStatus({ id: taskId, status });
        } catch (err) {
          setTasks(previous);
          throw err;
        }
      },
      async removeTask(taskId) {
        await deleteTask(taskId);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      },
      async addMember(input) {
        const member = await createMember(input);
        setMembers((prev) => [...prev, member]);
      },
      async removeMember(memberId) {
        await deleteMember(memberId);
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
        setTasks((prev) =>
          prev.map((task) =>
            task.assigneeId === memberId
              ? { ...task, assigneeId: null, assignee: null }
              : task,
          ),
        );
      },
      async addLabel(input) {
        const label = await createLabel(input);
        setLabels((prev) => [...prev, label]);
      },
      async removeLabel(labelId) {
        await deleteLabel(labelId);
        setLabels((prev) => prev.filter((label) => label.id !== labelId));
        setTasks((prev) =>
          prev.map((task) => ({
            ...task,
            labels: task.labels.filter((label) => label.id !== labelId),
          })),
        );
      },
      loadComments: fetchComments,
      addComment: createComment,
      loadActivity: fetchActivity,
      async seedDemo() {
        setLoading(true);
        setError(null);
        try {
          const data = await seedDemoData();
          setTasks(data.tasks);
          setMembers(data.members);
          setLabels(data.labels);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load demo data.",
          );
          throw err;
        } finally {
          setLoading(false);
        }
      },
    }),
    [
      tasks,
      members,
      labels,
      filters,
      setFilters,
      authLoading,
      loading,
      error,
      refresh,
    ],
  );

  return (
    <BoardStoreContext.Provider value={value}>
      {children}
    </BoardStoreContext.Provider>
  );
}

export function useBoardStore() {
  const context = useContext(BoardStoreContext);
  if (!context) {
    throw new Error("useBoardStore must be used within BoardStoreProvider");
  }
  return context;
}
