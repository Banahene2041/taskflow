import { AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";

import type { TaskStats } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  stats: TaskStats;
};

const STAT_ITEMS = [
  {
    key: "total" as const,
    label: "Total",
    icon: ClipboardList,
    accent: "text-primary",
  },
  {
    key: "done" as const,
    label: "Completed",
    icon: CheckCircle2,
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "overdue" as const,
    label: "Overdue",
    icon: AlertTriangle,
    accent: "text-destructive",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border/70 bg-card px-4 py-3"
      aria-label="Board summary"
    >
      {STAT_ITEMS.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="flex items-center gap-4">
            {index > 0 ? (
              <span
                className="hidden h-4 w-px bg-border sm:block"
                aria-hidden
              />
            ) : null}
            <div className="flex items-center gap-2.5">
              <Icon className={cn("size-4 shrink-0", item.accent)} aria-hidden />
              <div className="leading-tight">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-lg font-semibold tabular-nums tracking-tight">
                  {stats[item.key]}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
