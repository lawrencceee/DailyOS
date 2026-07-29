import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { STATUS_META, PRIORITY_META } from "../constants/taskMeta.js";

export default function TaskItem({ task, onEdit, onDelete }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6">{task.title}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={STATUS_META[task.status].label} sx={STATUS_META[task.status]} />
            <Chip size="small" label={PRIORITY_META[task.priority].label} sx={PRIORITY_META[task.priority]} />
          </Stack>
        </Stack>
        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {task.description}
          </Typography>
        )}
        {task.deadline && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Due: {new Date(task.deadline).toLocaleString()}
          </Typography>
        )}
      </CardContent>
      <CardActions>
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
