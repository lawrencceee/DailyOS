import { createContext, useContext, useState, useCallback } from "react";
import useTasks from "../hooks/useTasks.js";

/**
 * Combines task data (from useTasks) with the "is the form open, and
 * for what" state. Grouping these together is a pragmatic call for v1:
 * a stricter separation would split "data" and "modal UI state" into
 * two contexts, but every consumer of one currently needs the other
 * (e.g. Week/Calendar need both the task list AND openCreate), so one
 * provider keeps the wiring simple without real cost yet.
 */
const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const tasksApi = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [initialDeadline, setInitialDeadline] = useState(null);

  const openCreate = useCallback((deadline = null) => {
    setEditingTask(null);
    setInitialDeadline(deadline);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((task) => {
    setEditingTask(task);
    setInitialDeadline(null);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => setFormOpen(false), []);

  const submitForm = useCallback(
    async (payload) => {
      const ok = editingTask
        ? await tasksApi.updateTask(editingTask.id, payload)
        : await tasksApi.createTask(payload);
      if (ok) setFormOpen(false);
    },
    [editingTask, tasksApi]
  );

  const value = {
    ...tasksApi,
    formOpen,
    editingTask,
    initialDeadline,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasksContext() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasksContext must be used within a TasksProvider");
  }
  return ctx;
}
