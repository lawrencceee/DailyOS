import { Stack, Typography, TextField, IconButton, Chip } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { addDays, atHour, toDatetimeLocalValue } from "../utils/date.js";

const isFirefox =
  typeof navigator !== "undefined" &&
  navigator.userAgent.toLowerCase().includes("firefox");

function QuickDateChip({ label, onClick }) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      size="small"
      variant="outlined"
      sx={{
        borderRadius: 999,
        borderStyle: "dashed",
        fontWeight: 500,
      }}
    />
  );
}

export default function DeadlineField({ value, onChange, onClear }) {
  const setQuickDeadline = (date) =>
    onChange({ target: { value: toDatetimeLocalValue(date) } });

  const date = value ? value.slice(0, 10) : "";
  const time = value ? value.slice(11, 16) : "";

  const updateDate = (newDate) => {
    const newValue = `${newDate}T${time || "09:00"}`;
    onChange({ target: { value: newValue } });
  };

  const updateTime = (newTime) => {
    const newValue = `${date || new Date().toISOString().slice(0, 10)}T${newTime}`;
    onChange({ target: { value: newValue } });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Deadline
      </Typography>

      {isFirefox ? (
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            value={date}
            onChange={(e) => updateDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type="time"
            value={time}
            onChange={(e) => updateTime(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      ) : (
        <TextField
          type="datetime-local"
          value={value}
          onChange={onChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      )}

      <Stack direction="row" spacing={1}>
        <QuickDateChip
          label="Today 9AM"
          onClick={() => setQuickDeadline(atHour(new Date(), 9))}
        />

        <QuickDateChip
          label="Tomorrow"
          onClick={() => setQuickDeadline(atHour(addDays(new Date(), 1), 9))}
        />

        <QuickDateChip
          label="Next Week"
          onClick={() => setQuickDeadline(atHour(addDays(new Date(), 7), 9))}
        />

        {value && (
          <IconButton onClick={onClear}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
}