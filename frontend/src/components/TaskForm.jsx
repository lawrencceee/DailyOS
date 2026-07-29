import { useMediaQuery, useTheme } from "@mui/material";
import TaskFormDesktop from "./TaskFormDesktop.jsx";
import TaskFormMobile from "./TaskFormMobile.jsx";

/**
 * Thin switcher between the desktop and mobile presentations — this is
 * the only file that knows both exist. AppLayout.jsx still just imports
 * "TaskForm" and never needs to know which one actually rendered.
 *
 * Splitting into two files (rather than one file with isMobile branches
 * threaded through the JSX) is worth it here specifically because the
 * two layouts diverge in more than styling: modal dialog vs. full-screen
 * sheet, dropdowns vs. tap-chips, bottom actions vs. a top bar. State
 * and submit logic are still shared via useTaskFormState so neither file
 * duplicates that.
 */
export default function TaskForm(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return isMobile ? <TaskFormMobile {...props} /> : <TaskFormDesktop {...props} />;
}
