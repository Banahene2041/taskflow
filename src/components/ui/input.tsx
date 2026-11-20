import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 max-w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        type === "date" &&
          "appearance-none [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-date-and-time-value]:text-left",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
