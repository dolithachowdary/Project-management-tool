import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Sprints from "./pages/Sprints";
import Tasks from "./pages/Tasks";
import Timesheets from "./pages/Timesheets";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Notes from "./pages/Notes";
import SprintDetails from "./pages/SprintDetails";
import ToastManager from "./components/ToastManager";

import ChatBot from "./components/ChatBot";

function App() {
  return (
    <>
      <ToastManager />

      <Router>
        <ChatBot />
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
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
