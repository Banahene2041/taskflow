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
    <AppShell title="Settings">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage team members and labels for your guest workspace. Theme
            preferences live in the header toggle.
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
