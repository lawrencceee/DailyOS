import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TaskList from "../components/TaskList.jsx";
import TaskForm from "../components/TaskForm.jsx";
import TaskService from "../services/TaskService.js";

const STATUS_LABEL = {
  todo: "open",
  in_progress: "in progress",
  done: "done",
};

const TODAY = new Date().toLocaleDateString(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/**
 * Dashboard owns all Task state and talks to TaskService only —
 * never to axios/api directly. TaskList and TaskForm are presentational:
 * they receive data and callbacks as props and don't know the API exists.
 */
export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TaskService.list();
      setTasks(data);
    } catch (err) {
      setError("Could not load tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // The one signature element on the page: a system-style status
  // readout, "3 open · 1 in progress · 2 done", built from live state
  // rather than decorative — it's the same data the cards below show,
  // just summarized.
  const statusLine = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    return ["todo", "in_progress", "done"]
      .filter((key) => counts[key])
      .map((key) => `${counts[key]} ${STATUS_LABEL[key]}`)
      .join(" · ");
  }, [tasks]);

  const handleCreateClick = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editingTask) {
        await TaskService.update(editingTask.id, payload);
      } else {
        await TaskService.create(payload);
      }
      setFormOpen(false);
      await loadTasks();
    } catch (err) {
      setError("Could not save the task. Please try again.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await TaskService.remove(taskId);
      await loadTasks();
    } catch (err) {
      setError("Could not delete the task. Please try again.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
        <Typography
          variant="overline"
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            color: "text.secondary",
            letterSpacing: "0.08em",
          }}
        >
          DailyOS · {TODAY}
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
          sx={{ mt: 0.5 }}
        >
          <Typography variant="h4">Today's tasks</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
            New task
          </Button>
        </Box>

        {!loading && tasks.length > 0 && (
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "0.8rem",
              color: "text.secondary",
              mt: 1,
            }}
          >
            {statusLine}
          </Typography>
        )}

        <Divider sx={{ mt: 3, mb: 1 }} />

        {error && (
          <Alert severity="error" variant="outlined" sx={{ mt: 2 }} onClose={() => setError(null)}>
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
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreateClick}>
              Add your first task
            </Button>
          </Box>
        ) : (
          <TaskList tasks={tasks} onEdit={handleEditClick} onDelete={handleDelete} />
        )}

        <TaskForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialTask={editingTask}
        />
      </Container>
    </Box>
  );
}
