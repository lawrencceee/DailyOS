import { Box, TextField, Button, Stack, Dialog, AppBar, Toolbar, IconButton, Typography, Paper, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { STATUS_META, PRIORITY_META, PRIORITY_ACCENT, STATUS_ORDER, PRIORITY_ORDER } from "../constants/taskMeta.js";
import OptionChip from "./OptionChip.jsx";
import DeadlineField from "./DeadlineField.jsx";
import useTaskFormState from "../hooks/useTaskFormState.js";

/**
 * Mobile create/edit form: a full-screen sheet, not a floating dialog.
 * A centered modal with margins on every side wastes width that's
 * already scarce on a ~375px screen, and squeezes a title, description,
 * two dropdowns, and a date field into a small box — native task apps
 * solve "add an item" on phone by taking over the whole screen instead,
 * with a top bar (close / title / Save) rather than dialog buttons at
 * the bottom that require scrolling past the content to reach.
 *
 * Status, Priority, and Deadline are grouped into one card (with thin
 * dividers between them) rather than three separate floating boxes —
 * they're all "properties of this task," so one card reads as a single
 * settings section instead of three disconnected ones.
 *
 * OptionChip and DeadlineField are shared with TaskFormDesktop.jsx —
 * chips, colors, and the deadline picker look and behave identically on
 * both; only the surrounding chrome (full-screen sheet here vs. a
 * centered dialog there) differs, because that's a real difference in
 * what fits a phone vs. a desktop window, not a style inconsistency.
 */
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
          <Typography
            sx={{ flexGrow: 1, textAlign: "center", fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 }}
          >
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

      <Box
        sx={{
          bgcolor: "background.default",
          flexGrow: 1,
          overflowY: "auto",
          px: 3,
          pt: 3,
          pb: "max(32px, env(safe-area-inset-bottom))",
        }}
      >
        <Stack spacing={3}>
          {/*
            variant="filled" rather than the default outlined variant:
            outlined's border has a "notch" cut around the label that
            gets measured against the field's layout, and that
            measurement going stale (e.g. during a sheet transition) is
            what caused a visible gap in the border's corner before.
            Filled has no notch to mis-render in the first place.
            (Styling for filled inputs — radius, border, background — is
            centralized in theme.js so both forms match automatically.)
          */}
          <TextField
            variant="filled"
            label="Title"
            value={form.title}
            onChange={handleChange("title")}
            required
            fullWidth
          />

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
              <DeadlineField
                value={form.deadline}
                onChange={handleChange("deadline")}
                onClear={() => setField("deadline", "")}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Dialog>
  );
}
