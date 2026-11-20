import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "My Tasks",
};

export default function TasksPage() {
  return (
    <AppShell title="My Tasks">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-4 py-16 sm:px-6">
        <p className="text-sm font-medium text-primary">Coming next</p>
        <h2 className="text-2xl font-semibold tracking-tight">My Tasks</h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          A focused personal list view will live here once task persistence and
          filtering are connected.
        </p>
      </div>
    </AppShell>
  );
}
