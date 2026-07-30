import { useRef } from "react";
import { Box, Stack, Typography, IconButton, Chip } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import EventIcon from "@mui/icons-material/Event";
import {
  addDays,
  atHour,
  toDatetimeLocalValue,
  formatDeadlineDisplay,
} from "../utils/date.js";

const supportsWebkitPickerIndicator =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("selector(::-webkit-calendar-picker-indicator)");

const isFirefox =
  typeof navigator !== "undefined" &&
  navigator.userAgent.toLowerCase().includes("firefox");


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
        "&:active": {
          transform: "scale(.96)",
        },
      }}
    />
  );
}


export default function DeadlineField({
  value,
  onChange,
  onClear,
}) {
  const hasValue = Boolean(value);
  const inputRef = useRef(null);


  const setQuickDeadline = (date) => {
    onChange({
      target: {
        value: toDatetimeLocalValue(date),
      },
    });
  };


  const openPicker = () => {
    const el = inputRef.current;

    if (!el) return;

    if (
      supportsWebkitPickerIndicator &&
      document.activeElement === el
    ) {
      return;
    }

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


  /*
    Firefox does not handle datetime-local consistently.
    Split it into date + time inputs but keep the same
    YYYY-MM-DDTHH:mm format used by the backend.
  */
  const firefoxDate = value ? value.substring(0, 10) : "";
  const firefoxTime = value ? value.substring(11, 16) : "";


  const updateFirefoxDateTime = (date, time) => {
    let newValue = "";

    if (date && time) {
      newValue = `${date}T${time}`;
    } else if (date) {
      newValue = `${date}T00:00`;
    }

    onChange({
      target: {
        value: newValue,
      },
    });
  };


  return (
    <Box>

      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          display: "block",
          mb: 1,
        }}
      >
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
          cursor: "pointer",
        }}
      >

        {isFirefox ? (

          <Stack
            direction="row"
            spacing={1}
            sx={{
              p: 1.5,
            }}
          >

            <Box
              component="input"
              type="date"
              value={firefoxDate}
              onChange={(e) =>
                updateFirefoxDateTime(
                  e.target.value,
                  firefoxTime
                )
              }
              onInput={(e) =>
                updateFirefoxDateTime(
                  e.target.value,
                  firefoxTime
                )
              }
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 1,
                py: 1,
                fontSize: "0.9rem",
                background: "transparent",
              }}
            />


            <Box
              component="input"
              type="time"
              value={firefoxTime}
              onChange={(e) =>
                updateFirefoxDateTime(
                  firefoxDate,
                  e.target.value
                )
              }
              onInput={(e) =>
                updateFirefoxDateTime(
                  firefoxDate,
                  e.target.value
                )
              }
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 1,
                py: 1,
                fontSize: "0.9rem",
                background: "transparent",
              }}
            />


            {hasValue && (
              <IconButton
                size="small"
                aria-label="clear deadline"
                onClick={onClear}
              >
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
                pointerEvents: "none",
              }}
            >

              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{
                  minWidth: 0,
                }}
              >

                <EventIcon
                  fontSize="small"
                  sx={{
                    color: "text.secondary",
                    flexShrink: 0,
                  }}
                />


                <Typography
                  noWrap
                  sx={{
                    fontFamily: hasValue
                      ? '"IBM Plex Mono", monospace'
                      : "inherit",
                    fontSize: hasValue
                      ? "0.9rem"
                      : "1rem",
                    color: hasValue
                      ? "text.primary"
                      : "text.secondary",
                  }}
                >
                  {hasValue
                    ? formatDeadlineDisplay(value)
                    : "No deadline set"}
                </Typography>

              </Stack>


              {hasValue && (
                <IconButton
                  size="small"
                  aria-label="clear deadline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  sx={{
                    pointerEvents: "auto",
                    flexShrink: 0,
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}

            </Box>
          </>
        )}

      </Box>


      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          mt: 1.25,
          flexWrap: "wrap",
        }}
      >

        <QuickDateChip
          label="Today, 9am"
          onClick={() =>
            setQuickDeadline(
              atHour(new Date(), 9)
            )
          }
        />


        <QuickDateChip
          label="Tomorrow, 9am"
          onClick={() =>
            setQuickDeadline(
              atHour(addDays(new Date(), 1), 9)
            )
          }
        />


        <QuickDateChip
          label="Next week"
          onClick={() =>
            setQuickDeadline(
              atHour(addDays(new Date(), 7), 9)
            )
          }
        />

      </Stack>

    </Box>
  );
}