import { useRef } from "react";
import { Box, Stack, Typography, IconButton, Chip } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import EventIcon from "@mui/icons-material/Event";
import { addDays, atHour, toDatetimeLocalValue, formatDeadlineDisplay } from "../utils/date.js";

// Feature-detected once at module load: true in Chrome/Edge/Safari
// (which support restyling the native calendar icon), false in
// Firefox. This is what lets the WebKit-only path below apply its
// "don't re-trigger showPicker()" guard safely.
const supportsWebkitPickerIndicator =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("selector(::-webkit-calendar-picker-indicator)");

// Firefox doesn't support restyling/enlarging the native calendar icon
// at all, and showPicker() there is unreliable in practice (see the
// Firefox branch below for why it's sidestepped entirely rather than
// patched further).
const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox");

/** A quick-set shortcut chip for common deadlines (today/tomorrow/next week at 9am). */
function QuickDateChip({ label, onClick }) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      variant="outlined"
      size="small"
      sx={{
        borderRadius: 999,
        borderStyle: "dashed",
        color: "text.secondary",
        fontWeight: 500,
        cursor: "pointer",
        "&:active": { transform: "scale(.96)" },
      }}
    />
  );
}

/**
 * A custom-styled deadline control.
 *
 * Chrome/Edge/Safari: a real <input type="datetime-local"> sits
 * invisibly on top of an on-brand pill (icon + formatted date, or "No
 * deadline set"), with its native calendar icon stretched via
 * ::-webkit-calendar-picker-indicator to cover the whole row — so every
 * click is a direct, native click on the browser's own trigger.
 *
 * Firefox: none of that works. Firefox doesn't expose a stylable
 * calendar-icon pseudo-element, and calling showPicker() there is
 * unreliable in practice, particularly inside a MUI Dialog's focus
 * trap. Rather than keep patching around an invisible input Firefox
 * won't cooperate with, Firefox gets two small, genuinely VISIBLE
 * native inputs (date + time). Clicking a real, visible date/time
 * input is just Firefox's own default behavior — nothing to trigger
 * programmatically, nothing to fail silently. The trade-off is losing
 * the fancy icon+formatted-text pill specifically in Firefox; that's
 * an intentional reliability-over-polish call, not an oversight.
 */
export default function DeadlineField({ value, onChange, onClear }) {
  const hasValue = Boolean(value);
  const inputRef = useRef(null);

  const setQuickDeadline = (date) => {
    onChange({ target: { value: toDatetimeLocalValue(date) } });
  };

  // Fallback path for WebKit browsers only (see supportsWebkitPickerIndicator
  // above) — Firefox never calls this, since its branch below uses real
  // visible inputs instead. The activeElement check matters: clicking the
  // row already hit the browser's own (now full-row-sized) icon directly,
  // which opens the picker and focuses the input as part of its default
  // action before this runs — so this exits early rather than calling
  // showPicker() a second time, which can toggle an already-open picker closed.
  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (supportsWebkitPickerIndicator && document.activeElement === el) return;
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
      } catch {
        el.focus();
      }
    } else {
      el.focus();
    }
  };

  // Firefox: split the same "YYYY-MM-DDTHH:mm" value the backend
  // expects into separate date/time pieces for two plain native inputs.
  const firefoxDate = value ? value.slice(0, 10) : "";
  const firefoxTime = value ? value.slice(11, 16) : "";

  const updateFirefoxDateTime = (date, time) => {
    let newValue = "";
    if (date && time) {
      newValue = `${date}T${time}`;
    } else if (date) {
      // Only a date was picked yet — default to 9am rather than
      // midnight, matching the quick-set chips' own 9am convention
      // below, so a task doesn't quietly end up due at 00:00.
      newValue = `${date}T09:00`;
    }
    // date === "" (cleared) intentionally produces newValue = "",
    // clearing the deadline entirely regardless of what time held.
    onChange({ target: { value: newValue } });
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
        Deadline
      </Typography>

      <Box
        onClick={!isFirefox ? openPicker : undefined}
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.5,
          bgcolor: "background.default",
          overflow: "hidden",
          cursor: isFirefox ? "default" : "pointer",
        }}
      >
        {isFirefox ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1.5 }}>
            <Box
              component="input"
              type="date"
              value={firefoxDate}
              onChange={(e) => updateFirefoxDateTime(e.target.value, firefoxTime)}
              aria-label="Deadline date"
              sx={{
                flex: 1,
                minWidth: 0,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 1,
                py: 1,
                fontSize: "0.9rem",
                fontFamily: "inherit",
                background: "transparent",
                color: "text.primary",
              }}
            />
            <Box
              component="input"
              type="time"
              value={firefoxTime}
              onChange={(e) => updateFirefoxDateTime(firefoxDate, e.target.value)}
              aria-label="Deadline time"
              sx={{
                flex: 1,
                minWidth: 0,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 1,
                py: 1,
                fontSize: "0.9rem",
                fontFamily: "inherit",
                background: "transparent",
                color: "text.primary",
              }}
            />
            {hasValue && (
              <IconButton size="small" aria-label="clear deadline" onClick={onClear} sx={{ flexShrink: 0 }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ) : (
          <>
            <Box
              component="input"
              ref={inputRef}
              type="datetime-local"
              value={value}
              onChange={onChange}
              aria-label="Deadline"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                "&::-webkit-calendar-picker-indicator": {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  opacity: 0,
                  cursor: "pointer",
                },
              }}
            />
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1.75,
                py: 1.5,
                pointerEvents: "none", // lets clicks fall through to the invisible input beneath
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <EventIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0 }} />
                <Typography
                  noWrap
                  sx={{
                    fontFamily: hasValue ? '"IBM Plex Mono", monospace' : "inherit",
                    fontSize: hasValue ? "0.9rem" : "1rem",
                    color: hasValue ? "text.primary" : "text.secondary",
                  }}
                >
                  {hasValue ? formatDeadlineDisplay(value) : "No deadline set"}
                </Typography>
              </Stack>
              {hasValue && (
                <IconButton
                  size="small"
                  aria-label="clear deadline"
                  onClick={(e) => {
                    e.stopPropagation(); // otherwise this bubbles to the row's onClick and reopens the picker
                    onClear();
                  }}
                  sx={{ pointerEvents: "auto", flexShrink: 0 }} // overrides the pointer-events:none above
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </>
        )}
      </Box>

      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.25, flexWrap: "wrap" }}>
        <QuickDateChip label="Today, 9am" onClick={() => setQuickDeadline(atHour(new Date(), 9))} />
        <QuickDateChip label="Tomorrow, 9am" onClick={() => setQuickDeadline(atHour(addDays(new Date(), 1), 9))} />
        <QuickDateChip label="Next week" onClick={() => setQuickDeadline(atHour(addDays(new Date(), 7), 9))} />
      </Stack>
    </Box>
  );
}
