import {
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  LoaderCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TaskStats } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  stats: TaskStats;
};

const STAT_ITEMS = [
  {
    key: "total",
    label: "Total Tasks",
    description: "Everything on your board",
    icon: ClipboardList,
    accent: "text-primary bg-primary/10",
  },
  {
    key: "todo",
    label: "To Do",
    description: "Ready to pick up",
    icon: CircleDashed,
    accent: "text-sky-600 bg-sky-500/10 dark:text-sky-300",
  },
  {
    key: "inProgress",
    label: "In Progress",
    description: "Currently moving",
    icon: LoaderCircle,
    accent: "text-amber-600 bg-amber-500/10 dark:text-amber-300",
  },
  {
    key: "done",
    label: "Completed",
    description: "Shipped and closed",
    icon: CheckCircle2,
    accent: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-300",
  },
] as const;

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <Card key={item.key} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="mt-1 text-2xl font-semibold tracking-tight">
                  {value}
                </CardTitle>
              </div>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  item.accent,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
