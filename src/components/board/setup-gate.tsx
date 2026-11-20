import { APP_NAME } from "@/lib/constants";

export function SetupGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-primary">Setup required</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Connect Supabase to run {APP_NAME}
        </h1>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            Create a free Supabase project and enable{" "}
            <strong className="text-foreground">Anonymous</strong> sign-ins under
            Authentication → Providers.
          </li>
          <li>
            Run <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">supabase/schema.sql</code>{" "}
            in the SQL Editor.
          </li>
          <li>
            Copy <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">.env.example</code> to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">.env.local</code> and
            paste your project URL + publishable key.
          </li>
          <li>Restart <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">pnpm dev</code>.</li>
        </ol>
      </div>
    </div>
  );
}
