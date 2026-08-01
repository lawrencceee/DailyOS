import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TasksProvider } from "./context/TasksContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ListView from "./pages/ListView.jsx";
import WeekView from "./pages/WeekView.jsx";
import CalendarView from "./pages/CalendarView.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

/**
 * TasksProvider deliberately sits INSIDE ProtectedRoute, not wrapping
 * the whole app — it fetches /tasks the moment it mounts, and that
 * fetch would 401 if it ran before the person is actually logged in.
 * Scoping it here means it only ever mounts once auth is confirmed.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <TasksProvider>
                <AppLayout />
              </TasksProvider>
            }
          >
            <Route index element={<ListView />} />
            <Route path="week" element={<WeekView />} />
            <Route path="calendar" element={<CalendarView />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
