import { Box } from "@mui/material";

/**
 * A rounded pill segmented control. Originally hand-rolled just for
 * the List/Week/Calendar tab switcher in AppLayout — factored out here
 * once a second place (ListView's group-by control) needed the exact
 * same visual pattern, so both share one implementation instead of two
 * copies that could drift apart.
 */
export default function SegmentedControl({ options, value, onChange, size = "medium" }) {
  const isSmall = size === "small";

  return (
    <Box
      sx={{
        display: "flex",
        width: { xs: "100%", sm: "fit-content" },
        p: 0.5,
        gap: 0.5,
        borderRadius: 999,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Box
            key={option.value}
            component="button"
            onClick={() => onChange(option.value)}
            sx={{
              flex: { xs: 1, sm: "0 0 auto" },
              border: "none",
              borderRadius: 999,
              px: isSmall ? 1.75 : 2.5,
              py: isSmall ? 0.5 : 0.85,
              fontFamily: "inherit",
              fontSize: isSmall ? "0.8rem" : "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              bgcolor: selected ? "primary.main" : "transparent",
              color: selected ? "primary.contrastText" : "text.secondary",
              transition: "background-color .15s ease, color .15s ease",
            }}
          >
            {option.label}
          </Box>
        );
      })}
    </Box>
  );
}
