import { useMediaQuery, useTheme } from "@mui/material";
import TaskFormDesktop from "./TaskFormDesktop.jsx";
import TaskFormMobile from "./TaskFormMobile.jsx";

export default function TaskForm(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return isMobile ? <TaskFormMobile {...props} /> : <TaskFormDesktop {...props} />;
}
