import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container, Box, Stack, Typography, Button, Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TaskForm from "../components/TaskForm.jsx";
import { useTasksContext } from "../context/TasksContext.jsx";

const TODAY = new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

const TABS = [
  { path: "/", label: "List" },
  { path: "/week", label: "Week" },
  { path: "/calendar", label: "Calendar" },
];

/**
 * Shared chrome for every view: the DailyOS eyebrow, the "New task"
 * button, the List/Week/Calendar tab switcher, and the create/edit
 * modal itself. Living here (once) rather than in each page means
 * "New task" and the modal behave identically everywhere, and adding
 * a fourth view later is one line in TABS plus one <Route>.
 *
 * Mobile: title and button stack instead of squeezing onto one row,
 * the button becomes full-width (a bigger, easier thumb target than a
 * small trailing button), and tabs fill the width equally rather than
 * left-aligning with empty space to the right.
 */
export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { formOpen, editingTask, initialDeadline, openCreate, closeForm, submitForm } = useTasksContext();

  const activeTab = TABS.some((t) => t.path === location.pathname) ? location.pathname : "/";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 }, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="overline"
          sx={{ fontFamily: '"IBM Plex Mono", monospace', color: "text.secondary", letterSpacing: "0.08em" }}
        >
          DailyOS · {TODAY}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-end" }}
          sx={{ mt: 0.5, mb: 2 }}
        >
          <Typography variant="h4">Your tasks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openCreate()}
            sx={{ width: { xs: "100%", sm: "auto" }, py: { xs: 1.25, sm: 1 } }}
          >
            New task
          </Button>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_, value) => navigate(value)}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            mb: 3,
            minHeight: 40,
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 600 },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.path} value={tab.path} label={tab.label} />
          ))}
        </Tabs>

        <Outlet />

        <TaskForm
          open={formOpen}
          onClose={closeForm}
          onSubmit={submitForm}
          initialTask={editingTask}
          initialDeadline={initialDeadline}
        />
      </Container>
    </Box>
  );
}
