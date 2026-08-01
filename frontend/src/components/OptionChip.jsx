import { Chip } from "@mui/material";

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
