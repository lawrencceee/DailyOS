import { useState, useEffect } from "react";
import { toDatetimeLocalValue } from "../utils/date.js";

const emptyTask = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  deadline: "",
};

export default function useTaskFormState({ open, initialTask, initialDeadline }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "todo",
        priority: initialTask.priority || "medium",
        // initialTask.deadline is a UTC ISO string from the API.
        // Parsing it into a Date and reading it back via local-time
        // getters (inside toDatetimeLocalValue) correctly converts it
        // to the browser's local wall-clock time — slicing the raw
        // string instead silently keeps the UTC hour, drifting the
        // displayed time by the user's timezone offset.
        deadline: initialTask.deadline ? toDatetimeLocalValue(new Date(initialTask.deadline)) : "",
      });
    } else if (initialDeadline) {
      const d = new Date(initialDeadline);
      if (d.getHours() === 0 && d.getMinutes() === 0) {
        d.setHours(9, 0, 0, 0);
      }
      setForm({ ...emptyTask, deadline: toDatetimeLocalValue(d) });
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
