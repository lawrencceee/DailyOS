import { createTheme, responsiveFontSizes } from "@mui/material/styles";

/**
 * DailyOS visual identity.
 *
 * Palette: warm limestone background, deep pine as the primary accent,
 * muted brick reserved for high-priority signals only (not decorative).
 * Type: Fraunces for headlines (personality, used sparingly), Inter for
 * body/UI, IBM Plex Mono for anything system-generated — dates, counts,
 * status/priority tags — so those read as logged data, not decoration.
 */
const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#EFEDE7",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#20241F",
      secondary: "#6B6F68",
    },
    primary: {
      main: "#33523F",
      contrastText: "#F6F5F1",
    },
    secondary: {
      main: "#AD5A3E",
      contrastText: "#F6F5F1",
    },
    divider: "#DDD9CF",
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, boxShadow: "none" },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderColor: "#DDD9CF",
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.7rem",
          letterSpacing: "0.02em",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiFilledInput: {
      // Applied globally, but in practice only TaskFormDesktop.jsx and
      // TaskFormMobile.jsx use variant="filled" — centralizing this here
      // means both forms automatically share the same input look instead
      // of each repeating disableUnderline + a borderRadius sx override.
      defaultProps: {
        disableUnderline: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
          border: "1px solid #DDD9CF",
          "&:hover": { backgroundColor: "#FFFFFF" },
          "&.Mui-focused": { backgroundColor: "#FFFFFF", borderColor: "#33523F" },
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
