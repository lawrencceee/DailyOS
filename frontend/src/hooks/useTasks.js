import { useState, useEffect, useCallback } from "react";
import TaskService from "../services/TaskService.js";

/**
 * Owns task data and CRUD operations against TaskService. Previously
 * this logic lived directly inside Dashboard.jsx; pulling it into a
 * hook means the List, Week, and Calendar views can all read/mutate
 * the same task data without three separate fetches or three copies
 * of the same try/catch/error-message logic.
 */
export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
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
    load();
  }, [load]);

  const createTask = useCallback(
    async (payload) => {
      try {
        await TaskService.create(payload);
        await load();
        return true;
      } catch (err) {
        setError("Could not save the task. Please try again.");
        return false;
      }
    },
    [load]
  );

  const updateTask = useCallback(
    async (taskId, payload) => {
      try {
        await TaskService.update(taskId, payload);
        await load();
        return true;
      } catch (err) {
        setError("Could not save the task. Please try again.");
        return false;
      }
    },
    [load]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      try {
        await TaskService.remove(taskId);
        await load();
      } catch (err) {
        setError("Could not delete the task. Please try again.");
      }
    },
    [load]
  );

  return { tasks, loading, error, setError, reload: load, createTask, updateTask, deleteTask };
}
