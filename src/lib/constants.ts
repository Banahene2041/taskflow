export const APP_NAME = "TaskFlow";
export const APP_DESCRIPTION =
  "A polished Kanban board for planning, tracking, and shipping work.";

export const NAV_ITEMS = [
  { label: "Board", href: "/", icon: "layout-grid" },
  { label: "My Tasks", href: "/tasks", icon: "list-checks" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;
