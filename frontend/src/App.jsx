import { Routes, Route } from "react-router-dom";
import { TasksProvider } from "./context/TasksContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ListView from "./pages/ListView.jsx";
import WeekView from "./pages/WeekView.jsx";
import CalendarView from "./pages/CalendarView.jsx";

// TasksProvider wraps all routes so task data and the create/edit modal
// are shared across List/Week/Calendar rather than each view re-fetching
// independently. AppLayout is the shared chrome (header, tabs, modal);
// each view is just its content via <Outlet />.
export default function App() {
  return (
    <TasksProvider>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<ListView />} />
          <Route path="week" element={<WeekView />} />
          <Route path="calendar" element={<CalendarView />} />
        </Route>
      </Routes>
    </TasksProvider>
  );
}
