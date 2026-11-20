"use client";

import { SetupGate } from "@/components/board/setup-gate";
import { TeamPanel } from "@/components/board/team-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/providers/auth-provider";

export default function SettingsPage() {
  const { configured, user, loading } = useAuth();

  if (!configured) {
    return <SetupGate />;
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6">
        <section className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Team & labels</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage assignees and tags for your guest workspace.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Guest session</h3>
          {loading ? (
            <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <p className="mt-2 break-all text-sm text-muted-foreground">
              User ID: {user?.id ?? "Not signed in"}
            </p>
          )}
        </section>

        <TeamPanel />
      </div>
    </AppShell>
  );
}
