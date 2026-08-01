import { Box, Container, Paper, Typography } from "@mui/material";

/**
 * Shared chrome for Login/Register — the branded wordmark, tagline,
 * and card live here once so both pages look identical apart from
 * their actual form fields, instead of each duplicating the same
 * wrapper markup.
 */
export default function AuthLayout({ title, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4">DailyOS</Typography>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "0.75rem",
              color: "text.secondary",
              letterSpacing: "0.04em",
              mt: 0.5,
            }}
          >
            Your day, organized
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600 }}>
            {title}
          </Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
