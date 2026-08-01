import { useMemo } from "react";
import { Box, Typography, Alert, CircularProgress, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TaskList from "../components/TaskList.jsx";
import { useTasksContext } from "../context/TasksContext.jsx";
import { STATUS_META, STATUS_ORDER } from "../constants/taskMeta.js";

export default function ListView() {
  const { tasks, loading, error, setError, openEdit, deleteTask, updateTask, openCreate } = useTasksContext();

  const statusLine = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    return STATUS_ORDER.filter((key) => counts[key])
      .map((key) => `${counts[key]} ${STATUS_META[key].label}`)
      .join(" · ");
  }, [tasks]);

  // Sends only { status }, not the whole form — the backend's partial-
  // update semantics (exclude_unset) mean description/priority/deadline
  // are left untouched, so this can't accidentally clobber other fields.
  const handleToggleDone = (task) => {
    updateTask(task.id, { status: task.status === "done" ? "todo" : "done" });
  };

  return (
    <Box>
      {!loading && tasks.length > 0 && (
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.8rem", color: "text.secondary", mb: 2 }}>
          {statusLine}
        </Typography>
      )}
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
      ) : (
        <TaskList tasks={tasks} onEdit={openEdit} onDelete={deleteTask} onToggleDone={handleToggleDone} />
      )}
    </Box>
  );
}
