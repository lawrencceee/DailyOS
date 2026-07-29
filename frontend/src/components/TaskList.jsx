import { Stack, Typography } from "@mui/material";
import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
        No tasks yet. Create one to get started.
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Stack>
  );
}
