import { useState, useMemo } from "react";
import { Box, Typography, IconButton, Stack, Chip, Paper } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { useTasksContext } from "../context/TasksContext.jsx";
import { STATUS_META, PRIORITY_ACCENT } from "../constants/taskMeta.js";
import { startOfWeek, addDays, isSameDay, formatWeekRangeLabel } from "../utils/date.js";

const DAY_LABEL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Tasks are grouped by matching their deadline's calendar day against
 * each column — a task with no deadline can't appear in a week grid,
 * so those are listed separately underneath instead of silently hidden.
 */
export default function WeekView() {
  const { tasks, openEdit, openCreate } = useTasksContext();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const unscheduled = tasks.filter((t) => !t.deadline);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.85rem", color: "text.secondary" }}>
          {formatWeekRangeLabel(weekStart)}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => setWeekStart(startOfWeek(new Date()))} aria-label="jump to this week">
            <TodayIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="previous week">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="next week">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(7, 1fr)" }, gap: 1 }}>
        {days.map((day) => {
          const dayTasks = tasks.filter((t) => t.deadline && isSameDay(new Date(t.deadline), day));
          const isToday = isSameDay(day, new Date());
          return (
            <Paper
              key={day.toISOString()}
              variant="outlined"
              onClick={() => openCreate(day)}
              sx={{
                p: 1,
                minHeight: 140,
                cursor: "pointer",
                borderColor: isToday ? "primary.main" : "divider",
                borderWidth: isToday ? 2 : 1,
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: "0.7rem",
                  color: isToday ? "primary.main" : "text.secondary",
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {DAY_LABEL[(day.getDay() + 6) % 7]} {day.getDate()}
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {dayTasks.map((task) => (
                  <Chip
                    key={task.id}
                    label={task.title}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(task);
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      height: "auto",
                      borderLeft: `3px solid ${PRIORITY_ACCENT[task.priority]}`,
                      "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 },
                      ...STATUS_META[task.status],
                    }}
                  />
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>

      {unscheduled.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "0.75rem",
              color: "text.secondary",
              mb: 1,
            }}
          >
            Unscheduled
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {unscheduled.map((task) => (
              <Chip
                key={task.id}
                label={task.title}
                size="small"
                onClick={() => openEdit(task)}
                sx={{
                  borderLeft: `3px solid ${PRIORITY_ACCENT[task.priority]}`,
                  ...STATUS_META[task.status],
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
