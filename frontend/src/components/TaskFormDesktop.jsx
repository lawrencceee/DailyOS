import { TextField, MenuItem, Button, Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Divider, Typography } from "@mui/material";
import { STATUS_META, PRIORITY_META, PRIORITY_ACCENT, STATUS_ORDER, PRIORITY_ORDER } from "../constants/taskMeta.js";
import OptionChip from "./OptionChip.jsx";
import DeadlineField from "./DeadlineField.jsx";
import useTaskFormState from "../hooks/useTaskFormState.js";

export default function TaskFormDesktop({ open, onClose, onSubmit, initialTask, initialDeadline }) {
  const { form, handleChange, setField, buildPayload, canSave } = useTaskFormState({ open, initialTask, initialDeadline });

  const handleSubmit = () => onSubmit(buildPayload());

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEnforceFocus>
      <DialogTitle sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 }}>
        {initialTask ? "Edit task" : "New task"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField variant="filled" label="Title" value={form.title} onChange={handleChange("title")} required fullWidth autoFocus />
          <TextField
            variant="filled"
            label="Description"
            value={form.description}
            onChange={handleChange("description")}
            multiline
            minRows={3}
            fullWidth
          />

          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
              <Box sx={{ p: 2, flex: 1 }}>
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
              <Box sx={{ p: 2, flex: 1 }}>
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
            </Stack>
            <Divider />
            <Box sx={{ p: 2 }}>
              <DeadlineField value={form.deadline} onChange={handleChange("deadline")} onClear={() => setField("deadline", "")} />
            </Box>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSubmit}
          disabled={!canSave}
          sx={{ borderRadius: 999, px: 3, fontWeight: 700 }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
