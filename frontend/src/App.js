import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Sprints from './pages/Sprints';
import Tasks from './pages/Tasks'; 
import Timesheets from './pages/Timesheets';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/sprints" element={<Sprints />} />
        <Route path="/tasks" element={<Tasks />} /> 
        <Route path="/timesheets" element={<Timesheets />} />
      </Routes>
    </Router>
  );
}

export default App;
