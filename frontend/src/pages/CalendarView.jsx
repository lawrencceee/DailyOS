import { useState, useMemo } from "react";
import { Box, Typography, IconButton, Stack, Paper, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { useTasksContext } from "../context/TasksContext.jsx";
import { STATUS_META, PRIORITY_ACCENT } from "../constants/taskMeta.js";
import { getMonthGrid, isSameDay, formatMonthLabel, startOfMonth } from "../utils/date.js";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const MAX_VISIBLE_PER_DAY = 2;

export default function CalendarView() {
  const { tasks, openEdit, openCreate } = useTasksContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);

  const weeks = useMemo(() => getMonthGrid(anchor), [anchor]);
  const tasksForDay = (day) => tasks.filter((t) => t.deadline && isSameDay(new Date(t.deadline), day));
  const selectedTasks = selectedDay ? tasksForDay(selectedDay) : [];

  const goToMonth = (offset) => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + offset, 1));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.85rem", color: "text.secondary" }}>
          {formatMonthLabel(anchor)}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => { setAnchor(startOfMonth(new Date())); setSelectedDay(null); }} aria-label="jump to this month">
            <TodayIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => goToMonth(-1)} aria-label="previous month">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => goToMonth(1)} aria-label="next month">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 0.5 }}>
        {(isMobile ? DAY_LABELS_SHORT : DAY_LABELS).map((label, i) => (
          <Typography key={`${label}-${i}`} align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.7rem", color: "text.secondary" }}>
            {label}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: { xs: 0.35, sm: 0.5 } }}>
        {weeks.flat().map((day) => {
          const inMonth = day.getMonth() === anchor.getMonth();
          const dayTasks = tasksForDay(day);
          const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_PER_DAY);
          const hiddenCount = dayTasks.length - visibleTasks.length;
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          return (
            <Paper
              key={day.toISOString()}
              variant="outlined"
              onClick={() => setSelectedDay(day)}
              sx={{
                p: { xs: 0.4, sm: 0.5 },
                minHeight: { xs: 52, sm: 88 },
                cursor: "pointer",
                opacity: inMonth ? 1 : 0.4,
                borderColor: isSelected ? "primary.main" : "divider",
                borderWidth: isSelected ? 2 : 1,
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: "0.7rem",
                  color: isToday ? "primary.main" : "text.primary",
                  fontWeight: isToday ? 700 : 400,
                  px: 0.25,
                }}
              >
                {day.getDate()}
              </Typography>

              {isMobile ? (
                dayTasks.length > 0 && (
                  <Stack direction="row" spacing={0.4} sx={{ mt: 0.4, flexWrap: "wrap" }}>
                    {dayTasks.slice(0, 4).map((task) => (
                      <Box key={task.id} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: PRIORITY_ACCENT[task.priority] }} />
                    ))}
                  </Stack>
                )
              ) : (
                <Stack spacing={0.4} sx={{ mt: 0.4 }}>
                  {visibleTasks.map((task) => (
                    <Box
                      key={task.id}
                      onClick={(e) => { e.stopPropagation(); openEdit(task); }}
                      title={task.title}
                      sx={{
                        fontSize: "0.62rem",
                        lineHeight: 1.4,
                        px: 0.5,
                        py: 0.2,
                        borderRadius: "3px",
                        borderLeft: `3px solid ${PRIORITY_ACCENT[task.priority]}`,
                        bgcolor: STATUS_META[task.status].bgcolor,
                        color: STATUS_META[task.status].color,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                      }}
                    >
                      {task.title}
                    </Box>
                  ))}
                  {hiddenCount > 0 && (
                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.6rem", color: "text.secondary", px: 0.5 }}>
                      +{hiddenCount} more
                    </Typography>
                  )}
                </Stack>
              )}
            </Paper>
          );
        })}
      </Box>

      {selectedDay && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.8rem", color: "text.secondary" }}>
              {selectedDay.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
            </Typography>
            <Typography onClick={() => openCreate(selectedDay)} sx={{ fontSize: "0.8rem", color: "primary.main", cursor: "pointer", fontWeight: 600 }}>
              + Add task
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {selectedTasks.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                Nothing scheduled.
              </Typography>
            ) : (
              selectedTasks.map((task) => (
                <Paper key={task.id} variant="outlined" onClick={() => openEdit(task)} sx={{ p: 1, cursor: "pointer", borderLeft: `4px solid ${PRIORITY_ACCENT[task.priority]}` }}>
                  <Typography sx={{ fontWeight: 600 }}>{task.title}</Typography>
                </Paper>
              ))
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
