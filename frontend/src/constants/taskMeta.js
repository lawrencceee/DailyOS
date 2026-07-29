/**
 * Display metadata for Task status/priority — labels and colors live
 * here once, so TaskItem, TaskForm, and the Week/Calendar views all
 * render the same thing instead of each hardcoding its own copy.
 * Values match the enum values the backend actually stores
 * (see backend/modules/task/model.py); only the display label changes.
 */
export const STATUS_META = {
  todo: { label: "To Do", bgcolor: "#EFEDE7", color: "#20241F", dot: "#9AA096" },
  in_progress: { label: "In Progress", bgcolor: "#DCE6DF", color: "#33523F", dot: "#33523F" },
  done: { label: "Done", bgcolor: "#33523F", color: "#F6F5F1", dot: "#33523F" },
};

export const PRIORITY_META = {
  low: { label: "Low", bgcolor: "transparent", color: "#6B6F68", border: "1px solid #DDD9CF" },
  medium: { label: "Medium", bgcolor: "transparent", color: "#33523F", border: "1px solid #33523F" },
  high: { label: "High", bgcolor: "#AD5A3E", color: "#F6F5F1" },
};

export const STATUS_ORDER = ["todo", "in_progress", "done"];
export const PRIORITY_ORDER = ["low", "medium", "high"];

/**
 * A single solid color per priority, for use as a border/stripe/dot
 * accent — separate from PRIORITY_META's chip styling (which is
 * transparent-with-border for low/medium, so it can't double as a
 * paint color). Defined once here so TaskForm, WeekView, and
 * CalendarView all agree on what "high priority" looks like.
 */
export const PRIORITY_ACCENT = {
  low: "#9AA096",
  medium: "#33523F",
  high: "#AD5A3E",
};
