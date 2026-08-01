import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#EFEDE7", paper: "#FFFFFF" },
    text: { primary: "#20241F", secondary: "#6B6F68" },
    primary: { main: "#33523F", contrastText: "#F6F5F1" },
    secondary: { main: "#AD5A3E", contrastText: "#F6F5F1" },
    divider: "#DDD9CF",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: "-0.01em" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, boxShadow: "none" },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderColor: "#DDD9CF", boxShadow: "none" } },
    },
    MuiChip: {
      styleOverrides: {
        label: { fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.7rem", letterSpacing: "0.02em" },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiFilledInput: {
      defaultProps: { disableUnderline: true },
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

export default theme;
