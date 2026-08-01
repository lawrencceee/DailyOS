import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container, Box, Stack, Typography, Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import TaskForm from "../components/TaskForm.jsx";
import SettingsDialog from "../components/SettingsDialog.jsx";
import { useTasksContext } from "../context/TasksContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const TODAY = new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

const TABS = [
  { path: "/", label: "List" },
  { path: "/week", label: "Week" },
  { path: "/calendar", label: "Calendar" },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { formOpen, editingTask, initialDeadline, openCreate, closeForm, submitForm } = useTasksContext();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeTab = TABS.some((t) => t.path === location.pathname) ? location.pathname : "/";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="overline"
            sx={{ fontFamily: '"IBM Plex Mono", monospace', color: "text.secondary", letterSpacing: "0.08em" }}
          >
            DailyOS · {TODAY}
          </Typography>
          {user && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.75rem", color: "text.secondary" }}
              >
                {user.email}
              </Typography>
              <IconButton size="small" onClick={logout} aria-label="log out">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Stack>

        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-end" }}
          sx={{ mt: 0.5, mb: 2, gap: 1.5 }}
        >
          <Typography variant="h4">Your tasks</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setSettingsOpen(true)}
              aria-label="reminder settings"
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openCreate()}
              sx={{ flexGrow: { xs: 1, sm: 0 }, py: { xs: 1.25, sm: 1 } }}
            >
              New task
            </Button>
          </Stack>
        </Box>

        {/*
          A rounded segmented control instead of MUI's default
          underline Tabs — the underline style was the one place in the
          app that didn't match the rounded-pill language already used
          by every button and chip elsewhere.
        */}
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", sm: "fit-content" },
            mb: 3,
            p: 0.5,
            gap: 0.5,
            borderRadius: 999,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.path;
            return (
              <Box
                key={tab.path}
                component="button"
                onClick={() => navigate(tab.path)}
                sx={{
                  flex: { xs: 1, sm: "0 0 auto" },
                  border: "none",
                  borderRadius: 999,
                  px: 2.5,
                  py: 0.85,
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  bgcolor: selected ? "primary.main" : "transparent",
                  color: selected ? "primary.contrastText" : "text.secondary",
                  transition: "background-color .15s ease, color .15s ease",
                }}
              >
                {tab.label}
              </Box>
            );
          })}
        </Box>

        <Outlet />

        <TaskForm
          open={formOpen}
          onClose={closeForm}
          onSubmit={submitForm}
          initialTask={editingTask}
          initialDeadline={initialDeadline}
        />

        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </Container>
    </Box>
  );
}
