import React from "react";

import TaskOverviewList from "./TaskOverviewList";
import DevTaskPie from "./DevTaskPie";
import WeeklyTaskGraph from "./WeeklyTaskGraph";
import RecentActivity from "./RecentActivity";

/**
 * Dev-Dashboard.jsx
 * Developer Overview Dashboard
 * - Task list (role-aware)
 * - Pie chart (tasks by project)
 * - Weekly task graph (dev only)
 * - Recent activity
 */

// 🔹 TEMP: reuse same task structure from Tasks.js
// Later replace with props / API / context
const tasks = [
  {
    id: "1",
    taskName: "Implement Weekly Task Graph",
    projectName: "Analytics Dashboard",
    moduleName: "UI",
    assignedTo: ["A"],
    status: "In Progress",
  },
  {
    id: "2",
    taskName: "Fix Dashboard Responsiveness",
    projectName: "Analytics Dashboard",
    moduleName: "UI",
    assignedTo: ["A"],
    status: "To Do",
  },
  {
    id: "3",
    taskName: "Prepare Sprint Demo",
    projectName: "Automation Suite",
    moduleName: "Docs",
    assignedTo: ["A"],
    status: "Done",
  },
];

// 🔹 Pie chart data (derived later from tasks API)
const pieData = [
  {
    project: "Analytics Dashboard",
    total: 3,
    completed: 1,
    color: "#D5E4FF",
  },
  {
    project: "Automation Suite",
    total: 2,
    completed: 1,
    color: "#FFD2D2",
  },
];

const DevDashboard = ({ role }) => {
  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Overview — Developer</h2>
        <div style={styles.smallNote}>Role: {role || "Developer"}</div>
      </div>

      {/* ================= TOP ROW ================= */}
      <div style={styles.topRow}>
        {/* TASK LIST */}
        <TaskOverviewList
          role="Developer"
          tasks={tasks}
          currentUser="A"
        />

        {/* PIE CHART */}
        <DevTaskPie data={pieData} />
      </div>

      {/* ================= BOTTOM ROW ================= */}
      <div style={styles.bottomRow}>
        <WeeklyTaskGraph />
        <RecentActivity />
      </div>

    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 20,
    background: "#fafafa",
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
  },

  smallNote: {
    fontSize: 13,
    color: "#666",
  },

  topRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
  },

  bottomRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
  },
};

export default DevDashboard;
