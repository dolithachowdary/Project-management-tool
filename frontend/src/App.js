import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Sprints from "./pages/Sprints";
import Tasks from "./pages/Tasks";
import Timesheets from "./pages/Timesheets";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Logs from "./pages/Logs";
import Notes from "./pages/Notes";
import SprintDetails from "./pages/SprintDetails";
import ToastManager from "./components/ToastManager";

import OneSignalHandler from "./components/OneSignalHandler";
import OneSignalDebug from "./components/OneSignalDebug";


import ChatBot from "./components/ChatBot";

function AppContent() {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const normalizedRole = (userData.role || "").toLowerCase();

  const isLoginPage = location.pathname === "/login" || location.pathname === "/";

  return (
    <>
      <ToastManager />
      <OneSignalHandler />
      {!isLoginPage && <ChatBot />}
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Main pages */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Projects */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />

        {/* Sprints */}
        <Route path="/sprints" element={<Sprints />} />
        <Route path="/sprints/:id" element={<SprintDetails />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/timesheets" element={<Timesheets />} />
        {/* Protected routes for non-developers */}
        <Route
          path="/analytics"
          element={
            normalizedRole === "admin" || normalizedRole === "project manager" ? (
              <Analytics />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/reports"
          element={
            normalizedRole === "admin" || normalizedRole === "project manager" ? (
              <Reports />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/logs"
          element={
            normalizedRole === "admin" || normalizedRole === "project manager" ? (
              <Logs />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route path="/notes" element={<Notes />} />
        <Route path="/onesignal-debug" element={<OneSignalDebug />} />
      </Routes>
    </>
  );
}


function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
