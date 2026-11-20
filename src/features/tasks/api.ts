import { createClient } from "@/lib/supabase/client";
import {
  mapActivity,
  mapComment,
  mapLabel,
  mapMember,
  mapTask,
} from "@/lib/mappers";
import type {
  CreateCommentInput,
  CreateLabelInput,
  CreateMemberInput,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from "@/features/tasks/schemas";
import type {
  Task,
  TaskActivity,
  TaskAssignee,
  TaskComment,
  TaskLabel,
} from "@/features/tasks/types";

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in as a guest to manage tasks.");
  }

  return { supabase, userId: user.id };
}

export async function fetchBoardData(): Promise<{
  tasks: Task[];
  members: TaskAssignee[];
  labels: TaskLabel[];
}> {
  const { supabase } = await requireUserId();

  const [tasksResult, membersResult, labelsResult, taskLabelsResult] =
    await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: true }),
      supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase.from("labels").select("*").order("name", { ascending: true }),
      supabase.from("task_labels").select("task_id, label_id"),
    ]);

  if (tasksResult.error) throw new Error(tasksResult.error.message);
  if (membersResult.error) throw new Error(membersResult.error.message);
  if (labelsResult.error) throw new Error(labelsResult.error.message);
  if (taskLabelsResult.error) throw new Error(taskLabelsResult.error.message);

  const members = (membersResult.data ?? []).map(mapMember);
  const labels = (labelsResult.data ?? []).map(mapLabel);
  const membersById = new Map(members.map((member) => [member.id, member]));
  const labelsById = new Map(labels.map((label) => [label.id, label]));

  const labelsByTask = new Map<string, TaskLabel[]>();
  for (const link of taskLabelsResult.data ?? []) {
    const label = labelsById.get(link.label_id);
    if (!label) continue;
    const existing = labelsByTask.get(link.task_id) ?? [];
    existing.push(label);
    labelsByTask.set(link.task_id, existing);
  }

  const tasks = (tasksResult.data ?? []).map((row) =>
    mapTask(
      row,
      row.assignee_id ? (membersById.get(row.assignee_id) ?? null) : null,
      labelsByTask.get(row.id) ?? [],
    ),
  );

  return { tasks, members, labels };
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      status: input.status ?? "todo",
      priority: input.priority ?? "normal",
      due_date: input.dueDate || null,
      assignee_id: input.assigneeId || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const labelIds = input.labelIds ?? [];
  if (labelIds.length > 0) {
    const { error: linkError } = await supabase.from("task_labels").insert(
      labelIds.map((labelId) => ({
        task_id: data.id,
        label_id: labelId,
      })),
    );
    if (linkError) throw new Error(linkError.message);
  }

  const board = await fetchBoardData();
  const created = board.tasks.find((task) => task.id === data.id);
  if (!created) throw new Error("Task created but could not be reloaded.");
  return created;
}

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const { supabase } = await requireUserId();

  const patch: {
    title?: string;
    description?: string | null;
    status?: Task["status"];
    priority?: Task["priority"];
    due_date?: string | null;
    assignee_id?: string | null;
  } = {};

  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) {
    patch.description = input.description || null;
  }
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.dueDate !== undefined) patch.due_date = input.dueDate || null;
  if (input.assigneeId !== undefined) {
    patch.assignee_id = input.assigneeId || null;
  }

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from("tasks")
      .update(patch)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
  }

  if (input.labelIds !== undefined) {
    const { error: deleteError } = await supabase
      .from("task_labels")
      .delete()
      .eq("task_id", input.id);
    if (deleteError) throw new Error(deleteError.message);

    if (input.labelIds.length > 0) {
      const { error: insertError } = await supabase.from("task_labels").insert(
        input.labelIds.map((labelId) => ({
          task_id: input.id,
          label_id: labelId,
        })),
      );
      if (insertError) throw new Error(insertError.message);
    }
  }

  const board = await fetchBoardData();
  const updated = board.tasks.find((task) => task.id === input.id);
  if (!updated) throw new Error("Task updated but could not be reloaded.");
  return updated;
}

export async function updateTaskStatus(
  input: UpdateTaskStatusInput,
): Promise<void> {
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("tasks")
    .update({ status: input.status })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
}

export async function createMember(
  input: CreateMemberInput,
): Promise<TaskAssignee> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      user_id: userId,
      name: input.name,
      color: input.color ?? "#635BFF",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapMember(data);
}

export async function deleteMember(memberId: string): Promise<void> {
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId);
  if (error) throw new Error(error.message);
}

export async function createLabel(input: CreateLabelInput): Promise<TaskLabel> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("labels")
    .insert({
      user_id: userId,
      name: input.name,
      color: input.color ?? "#635BFF",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLabel(data);
}

export async function deleteLabel(labelId: string): Promise<void> {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("labels").delete().eq("id", labelId);
  if (error) throw new Error(error.message);
}

export async function ensureDefaultLabels(): Promise<TaskLabel[]> {
  const board = await fetchBoardData();
  if (board.labels.length > 0) return board.labels;

  const defaults = [
    { name: "Bug", color: "#E5484D" },
    { name: "Feature", color: "#635BFF" },
    { name: "Design", color: "#30A46C" },
  ];

  const created: TaskLabel[] = [];
  for (const item of defaults) {
    created.push(await createLabel(item));
  }
  return created;
}

export async function fetchComments(taskId: string): Promise<TaskComment[]> {
  const { supabase } = await requireUserId();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapComment);
}

export async function createComment(
  input: CreateCommentInput,
): Promise<TaskComment> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      task_id: input.taskId,
      user_id: userId,
      body: input.body,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapComment(data);
}

export async function fetchActivity(taskId: string): Promise<TaskActivity[]> {
  const { supabase } = await requireUserId();
  const { data, error } = await supabase
    .from("task_activity")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapActivity);
}
