import { Chip } from "@mui/material";

/**
 * A tappable pill used for Status/Priority instead of a dropdown, on
 * both desktop and mobile. Shared here (rather than defined separately
 * in each form) so "what a selected chip looks like" is one piece of
 * code, not two that can quietly drift apart as one gets tweaked and
 * the other doesn't.
 */
export default function OptionChip({ label, selected, color, onClick }) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      sx={{
        fontWeight: selected ? 700 : 500,
        bgcolor: selected ? color : "background.paper",
        color: selected ? "#fff" : "text.primary",
        border: `1.5px solid ${selected ? color : "#DDD9CF"}`,
        px: 0.75,
        height: 38,
        borderRadius: 999,
        cursor: "pointer",
        transition: "all .15s ease",
        transform: selected ? "scale(1.03)" : "scale(1)",
        "&:active": { transform: "scale(.96)" },
      }}
    />
  );
}
