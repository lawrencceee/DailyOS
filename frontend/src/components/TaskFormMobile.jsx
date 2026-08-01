import { Box, TextField, Button, Stack, Dialog, AppBar, Toolbar, IconButton, Typography, Paper, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { STATUS_META, PRIORITY_META, PRIORITY_ACCENT, STATUS_ORDER, PRIORITY_ORDER } from "../constants/taskMeta.js";
import OptionChip from "./OptionChip.jsx";
import DeadlineField from "./DeadlineField.jsx";
import useTaskFormState from "../hooks/useTaskFormState.js";

export default function TaskFormMobile({ open, onClose, onSubmit, initialTask, initialDeadline }) {
  const { form, handleChange, setField, buildPayload, canSave } = useTaskFormState({
    open,
    initialTask,
    initialDeadline,
  });

  const handleSubmit = () => onSubmit(buildPayload());

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      keepMounted
      disableEnforceFocus
      PaperProps={{ sx: { display: "flex", flexDirection: "column" } }}
    >
      <AppBar
        position="relative"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}
      >
        <Toolbar sx={{ bgcolor: "background.paper" }}>
          <IconButton edge="start" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ flexGrow: 1, textAlign: "center", fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 }}>
            {initialTask ? "Edit task" : "New task"}
          </Typography>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={!canSave}
            sx={{ borderRadius: 999, px: 3, fontWeight: 700 }}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: "background.default", flexGrow: 1, overflowY: "auto", px: 3, pt: 3, pb: "max(32px, env(safe-area-inset-bottom))" }}>
        <Stack spacing={3}>
          <TextField variant="filled" label="Title" value={form.title} onChange={handleChange("title")} required fullWidth />
          <TextField
            variant="filled"
            label="Description"
            value={form.description}
            onChange={handleChange("description")}
            multiline
            minRows={4}
            fullWidth
          />

          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                Status
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {STATUS_ORDER.map((key) => (
                  <OptionChip
                    key={key}
                    label={STATUS_META[key].label}
                    selected={form.status === key}
                    color={STATUS_META[key].dot}
                    onClick={() => setField("status", key)}
                  />
                ))}
              </Stack>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                Priority
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {PRIORITY_ORDER.map((key) => (
                  <OptionChip
                    key={key}
                    label={PRIORITY_META[key].label}
                    selected={form.priority === key}
                    color={PRIORITY_ACCENT[key]}
                    onClick={() => setField("priority", key)}
                  />
                ))}
              </Stack>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <DeadlineField value={form.deadline} onChange={handleChange("deadline")} onClear={() => setField("deadline", "")} />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Dialog>
  );
}
