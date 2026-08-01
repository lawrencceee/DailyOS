import { Card, CardContent, CardActions, Typography, Chip, IconButton, Stack, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { STATUS_META, PRIORITY_ACCENT } from "../constants/taskMeta.js";

/**
 * The left border color = priority, matching the same convention used
 * in Week and Calendar views — previously this card showed priority as
 * a text chip instead, so the same task looked visually inconsistent
 * depending which view you were in. The status chip stays (there's
 * room for it here, unlike the compact grid views), so status is still
 * readable at a glance without opening the task.
 */
export default function TaskItem({ task, onEdit, onDelete, onToggleDone }) {
  const isDone = task.status === "done";

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${PRIORITY_ACCENT[task.priority]}`,
        transition: "border-color .15s ease",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <CardContent sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", pb: 1 }}>
        {/* One-click complete — previously the only way to mark a task
            done was opening the edit dialog and changing its status,
            which is a lot of friction for the single most common action
            in a task manager. */}
        <IconButton
          size="small"
          onClick={() => onToggleDone(task)}
          aria-label={isDone ? "mark as not done" : "mark as done"}
          sx={{ mt: 0.25, color: isDone ? "primary.main" : "text.secondary", flexShrink: 0 }}
        >
          {isDone ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
        </IconButton>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography
              variant="h6"
              sx={{
                fontSize: "1.05rem",
                textDecoration: isDone ? "line-through" : "none",
                color: isDone ? "text.secondary" : "text.primary",
              }}
            >
              {task.title}
            </Typography>
            <Chip size="small" label={STATUS_META[task.status].label} sx={{ flexShrink: 0, ...STATUS_META[task.status] }} />
          </Stack>

          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {task.description}
            </Typography>
          )}

          {task.deadline && (
            <Typography sx={{ mt: 0.75, fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.75rem", color: "text.secondary" }}>
              Due{" "}
              {new Date(task.deadline).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ pt: 0, pl: 7 }}>
        <IconButton size="small" onClick={() => onEdit(task)} aria-label="edit">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(task.id)} aria-label="delete">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}
