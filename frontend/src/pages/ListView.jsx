import { useMemo, useState } from "react";
import { Box, Typography, Alert, CircularProgress, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TaskList from "../components/TaskList.jsx";
import SegmentedControl from "../components/SegmentedControl.jsx";
import { useTasksContext } from "../context/TasksContext.jsx";
import { STATUS_META, STATUS_ORDER, PRIORITY_META } from "../constants/taskMeta.js";

// Priority order for grouping sections runs high → low (the order you'd
// scan first); PRIORITY_ORDER in taskMeta.js runs low → high (built for
// the dropdown/chip pickers, where that's the more natural tab order) —
// deliberately a separate constant rather than reusing/reversing that one,
// since the two orderings serve different UI purposes.
const PRIORITY_GROUP_ORDER = ["high", "medium", "low"];
const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

const VIEW_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "deadline", label: "Deadline" },
];

/**
 * Sort comparator: earlier deadline first; a task with no deadline
 * sorts after every task that has one (treated as "furthest away").
 * When two deadlines are equal — including the common case of two
 * tasks that both have no deadline at all — priority breaks the tie,
 * high first, per the requested ordering rule.
 */
function compareByDeadlineThenPriority(a, b) {
  const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
  const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
  if (aTime !== bTime) return aTime - bTime;
  return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
}

export default function ListView() {
  const { tasks, loading, error, setError, openEdit, deleteTask, updateTask, openCreate } = useTasksContext();
  const [viewMode, setViewMode] = useState("deadline");

  const statusLine = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    return STATUS_ORDER.filter((key) => counts[key])
      .map((key) => `${counts[key]} ${STATUS_META[key].label}`)
      .join(" · ");
  }, [tasks]);

  const handleToggleDone = (task) => {
    updateTask(task.id, { status: task.status === "done" ? "todo" : "done" });
  };

  // "status" and "priority" modes bucket tasks into sections; each
  // section is independently sorted by the same deadline-then-priority
  // rule, so switching modes changes what groups tasks — never how
  // they're ordered within a group. Empty sections (e.g. no Done tasks
  // yet) are dropped rather than shown with a "· 0" header.
  const groupedSections = useMemo(() => {
    if (viewMode === "status") {
      return STATUS_ORDER.map((key) => ({
        key,
        label: STATUS_META[key].label,
        tasks: tasks.filter((t) => t.status === key).sort(compareByDeadlineThenPriority),
      })).filter((section) => section.tasks.length > 0);
    }
    if (viewMode === "priority") {
      return PRIORITY_GROUP_ORDER.map((key) => ({
        key,
        label: PRIORITY_META[key].label,
        tasks: tasks.filter((t) => t.priority === key).sort(compareByDeadlineThenPriority),
      })).filter((section) => section.tasks.length > 0);
    }
    return null; // "deadline" mode is one flat sorted list, not grouped
  }, [tasks, viewMode]);

  const flatSortedTasks = useMemo(() => [...tasks].sort(compareByDeadlineThenPriority), [tasks]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        {!loading && tasks.length > 0 && (
          <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.8rem", color: "text.secondary" }}>
            {statusLine}
          </Typography>
        )}
        <SegmentedControl options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} size="small" />
      </Stack>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" sx={{ mt: 6 }}>
          <CircularProgress size={28} sx={{ color: "primary.main" }} />
        </Box>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Nothing logged for today yet.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openCreate()}>
            Add your first task
          </Button>
        </Box>
      ) : groupedSections ? (
        <Stack spacing={3}>
          {groupedSections.map((section) => (
            <Box key={section.key}>
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {section.label} · {section.tasks.length}
              </Typography>
              <TaskList tasks={section.tasks} onEdit={openEdit} onDelete={deleteTask} onToggleDone={handleToggleDone} />
            </Box>
          ))}
        </Stack>
      ) : (
        <TaskList tasks={flatSortedTasks} onEdit={openEdit} onDelete={deleteTask} onToggleDone={handleToggleDone} />
      )}
    </Box>
  );
}
