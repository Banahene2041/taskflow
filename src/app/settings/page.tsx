import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-4 py-16 sm:px-6">
        <p className="text-sm font-medium text-primary">Coming next</p>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Theme preferences are available in the header. Account and workspace
          settings will land after guest auth is wired up.
        </p>
      </div>
    </AppShell>
  );
}
