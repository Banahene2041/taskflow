import type { TaskStats } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  stats: TaskStats;
};

const STAT_ITEMS = [
  {
    key: "total" as const,
    label: "Total tasks",
    tone: "default" as const,
  },
  {
    key: "done" as const,
    label: "Completed",
    tone: "success" as const,
  },
  {
    key: "overdue" as const,
    label: "Overdue",
    tone: "danger" as const,
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <dl
      className="grid grid-cols-3 overflow-hidden rounded-xl border border-border/60 bg-card"
      aria-label="Board summary"
    >
      {STAT_ITEMS.map((item, index) => {
        const value = stats[item.key];
        const emphasizeDanger = item.tone === "danger" && value > 0;

        return (
          <div
            key={item.key}
            className={cn(
              "relative px-4 py-3.5 sm:px-5",
              index > 0 &&
                "before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-border/70",
            )}
          >
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
              {item.label}
            </dt>
            <dd
              className={cn(
                "mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground",
                item.tone === "success" &&
                  value > 0 &&
                  "text-emerald-600 dark:text-emerald-400",
                emphasizeDanger && "text-destructive",
              )}
            >
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
