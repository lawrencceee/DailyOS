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

export const PRIORITY_ACCENT = {
  low: "#9AA096",
  medium: "#33523F",
  high: "#AD5A3E",
};
