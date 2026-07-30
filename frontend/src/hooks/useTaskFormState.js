import { useState, useEffect } from "react";
import { toDatetimeLocalValue } from "../utils/date.js";

const emptyTask = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  deadline: "",
};

/**
 * Owns TaskForm's state: what's in each field, how it gets pre-filled
 * (editing an existing task, or a deadline pre-filled from a Week/
 * Calendar day-click), and how the final payload is built for submit.
 *
 * This is what TaskFormDesktop.jsx and TaskFormMobile.jsx both call —
 * the two views render completely different markup, but neither needs
 * its own copy of "how does the form behave," so that logic lives here
 * exactly once.
 */
export default function useTaskFormState({ open, initialTask, initialDeadline }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "todo",
        priority: initialTask.priority || "medium",
        deadline: initialTask.deadline
          ? toDatetimeLocalValue(new Date(initialTask.deadline))
          : "",
      });
    } else if (initialDeadline) {
      const d = new Date(initialDeadline);
    
      if (d.getHours() === 0 && d.getMinutes() === 0) {
        d.setHours(9, 0, 0, 0);
      }
    
      setForm({
        ...emptyTask,
        deadline: toDatetimeLocalValue(d),
      });
    } else {
      setForm(emptyTask);
    }
  }, [initialTask, initialDeadline, open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    ...form,
    deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
  });

  const canSave = Boolean(form.title.trim());

  return { form, handleChange, setField, buildPayload, canSave };
}
