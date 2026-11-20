"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoardStore } from "@/features/tasks/board-store";

const COLORS = ["#635BFF", "#30A46C", "#F5A524", "#E5484D", "#0091FF", "#AB4ABA"];

export function TeamPanel() {
  const { members, labels, addMember, removeMember, addLabel, removeLabel } =
    useBoardStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(COLORS[1]);
  const [error, setError] = useState<string | null>(null);

  async function handleAddMember(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await addMember({ name, color });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
    }
  }

  async function handleAddLabel(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await addLabel({ name: labelName, color: labelColor });
      setLabelName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add label.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold">Team members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add people you can assign to tasks. Avatars appear on cards.
        </p>

        <ul className="mt-4 space-y-2">
          {members.length === 0 ? (
            <li className="text-sm text-muted-foreground">No members yet.</li>
          ) : (
            members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback
                      className="text-xs font-semibold text-white"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${member.name}`}
                  onClick={() => void removeMember(member.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))
          )}
        </ul>

        <form className="mt-4 space-y-3" onSubmit={(event) => void handleAddMember(event)}>
          <div className="grid gap-2">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Rivera"
              required
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`Color ${swatch}`}
                className="size-7 rounded-full border-2"
                style={{
                  backgroundColor: swatch,
                  borderColor: color === swatch ? "#171923" : "transparent",
                }}
                onClick={() => setColor(swatch)}
              />
            ))}
          </div>
          <Button type="submit" size="sm">
            <Plus className="size-4" />
            Add member
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold">Labels</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create tags like Bug, Feature, or Design and filter the board by them.
        </p>

        <ul className="mt-4 space-y-2">
          {labels.map((label) => (
            <li
              key={label.id}
              className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
            >
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${label.color}22`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${label.name}`}
                onClick={() => void removeLabel(label.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>

        <form className="mt-4 space-y-3" onSubmit={(event) => void handleAddLabel(event)}>
          <div className="grid gap-2">
            <Label htmlFor="label-name">Label name</Label>
            <Input
              id="label-name"
              value={labelName}
              onChange={(event) => setLabelName(event.target.value)}
              placeholder="Bug"
              required
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`Label color ${swatch}`}
                className="size-7 rounded-full border-2"
                style={{
                  backgroundColor: swatch,
                  borderColor: labelColor === swatch ? "#171923" : "transparent",
                }}
                onClick={() => setLabelColor(swatch)}
              />
            ))}
          </div>
          <Button type="submit" size="sm">
            <Plus className="size-4" />
            Add label
          </Button>
        </form>
      </section>

      {error ? <p className="text-sm text-destructive lg:col-span-2">{error}</p> : null}
    </div>
  );
}
