// src/components/DashboardContent.jsx
import React, { useEffect, useState } from "react";
import Card from "./Card";
import Calendar from "./Calendar";
import TaskGraph from "./TaskGraph";
import RecentActivity from "./RecentActivity";
import { ProjectsAPI } from "../lib/projects";
import { TasksAPI } from "../lib/tasks";
import { ModulesAPI } from "../lib/modules";

const DashboardContent = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [projRes, taskRes, modRes] = await Promise.all([
          ProjectsAPI.list(),
          TasksAPI.list(),
          ModulesAPI.list(),
        ]);

        setProjects(Array.isArray(projRes) ? projRes : projRes.data || []);
        setTasks(Array.isArray(taskRes) ? taskRes : taskRes.data || []);
        setModules(Array.isArray(modRes) ? modRes : modRes.data || []);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return <div style={{ padding: 30 }}>Loading dashboard...</div>;
  }

  // === DATA PROCESSING ===
  const activeProjects = projects.filter((p) => p.status === "Active");
  const completedProjects = projects.filter((p) => p.status === "Completed");
  const onHoldProjects = projects.filter((p) => p.status === "On Hold");

  // Compute progress based on tasks (e.g., completed / total)
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter((t) => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const done = projectTasks.filter((t) => t.status === "Done").length;
    return Math.round((done / projectTasks.length) * 100);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const activeModules = modules.filter((m) => m.status === "Active");

  return (
    <div style={styles.container}>
      {/* === LEFT MAIN SECTION === */}
      <div style={styles.mainContent}>
        {/* === Active Projects === */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Active Projects</h3>
          <div style={styles.cardGrid}>
            {activeProjects.length > 0 ? (
              activeProjects.slice(0, 3).map((p) => (
                <div key={p.id || p._id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4>{p.name}</h4>
                      <span style={styles.activeBadge}>
                        {p.status || "Active"}
                      </span>
                    </div>
                    <div style={styles.progressBarOuter}>
                      <div
                        style={{
                          ...styles.progressBarInner,
                          width: `${getProjectProgress(p.id || p._id)}%`,
                        }}
                      ></div>
                    </div>
                    <p style={styles.progressText}>
                      {getProjectProgress(p.id || p._id)}% complete
                    </p>
                  </Card>
                </div>
              ))
            ) : (
              <p style={{ color: "#888" }}>No active projects.</p>
            )}
          </div>
        </section>

        {/* === Active Sprints === */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Active Sprints</h3>
          <div style={styles.cardGrid}>
            {activeModules.length > 0 ? (
              activeModules.slice(0, 2).map((m) => (
                <div key={m.id || m._id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4>{m.name}</h4>
                      <span style={styles.activeBadge}>
                        {m.status || "Active"}
                      </span>
                    </div>
                    <p style={styles.subText}>
                      {m.description || "Sprint in progress"}
                    </p>
                    <p style={styles.smallText}>
                      Project:{" "}
                      {projects.find((p) => p.id === m.project_id)?.name ||
                        "Unknown"}
                    </p>
                  </Card>
                </div>
              ))
            ) : (
              <p style={{ color: "#888" }}>No active sprints found.</p>
            )}
          </div>
        </section>

        {/* === Workload Balance === */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Workload Balance</h3>
          <Card>
            <p style={{ textAlign: "center", color: "#555" }}>
              Total Tasks: <b>{totalTasks}</b> | Completed:{" "}
              <b>{completedTasks}</b>
            </p>
            <p style={{ textAlign: "center", color: "#777" }}>
              {Math.round((completedTasks / totalTasks) * 100) || 0}% of all
              tasks done
            </p>
          </Card>
        </section>

        {/* === TASK GRAPH + RECENT ACTIVITY ROW === */}
        <section style={styles.bottomRow}>
          <div style={styles.bottomLeft}>
            <TaskGraph />
          </div>
          <div style={styles.bottomRight}>
            <RecentActivity />
          </div>
        </section>
      </div>

      {/* === RIGHT SIDEBAR === */}
      <aside style={styles.rightPanel}>
        <Card>
          <h4 style={styles.sidebarTitle}>Calendar</h4>
          <Calendar />
        </Card>

        <Card>
          <h4 style={styles.sidebarTitle}>Upcoming Deadlines</h4>
          <ul style={styles.list}>
            {tasks
              .filter((t) => t.status !== "Done")
              .slice(0, 4)
              .map((t) => (
                <li key={t.id || t._id}>
                  {t.task_name} – {t.end_date || "No date"}
                </li>
              ))}
          </ul>
        </Card>

        <Card>
          <h4 style={styles.sidebarTitle}>Recently Completed</h4>
          <ul style={styles.list}>
            {tasks
              .filter((t) => t.status === "Done")
              .slice(-3)
              .map((t) => (
                <li key={t.id || t._id}>{t.task_name}</li>
              ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
};

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "2.5fr 1fr",
    gap: "30px",
    padding: "30px",
    backgroundColor: "#f9f9f9",
    overflowY: "auto",
    boxSizing: "border-box",
    width: "100%",
    minHeight: "100%",
  },
  mainContent: { display: "flex", flexDirection: "column", gap: "30px" },
  section: { marginBottom: "20px" },
  sectionTitle: {
    marginBottom: "12px",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#111",
  },
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "flex-start",
  },
  cardWrapper: {
    flex: "1 1 300px",
    minWidth: "280px",
    maxWidth: "340px",
    display: "flex",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  activeBadge: {
    backgroundColor: "#c62828",
    color: "white",
    padding: "3px 8px",
    borderRadius: "5px",
    fontSize: "12px",
  },
  progressBarOuter: {
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: "5px",
    height: "8px",
  },
  progressBarInner: {
    backgroundColor: "#c62828",
    height: "8px",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  },
  progressText: {
    marginTop: "6px",
    fontSize: "13px",
    color: "#555",
    textAlign: "right",
  },
  subText: { color: "#444", fontWeight: "500", marginBottom: "5px" },
  smallText: { color: "#777", fontSize: "14px", marginBottom: "10px" },
  bottomRow: { display: "flex", gap: "25px", flexWrap: "wrap" },
  bottomLeft: { flex: "1 1 55%", minWidth: "350px" },
  bottomRight: { flex: "1 1 40%", minWidth: "300px" },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "340px",
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#222",
    marginBottom: "10px",
  },
  list: {
    color: "#555",
    fontSize: "14px",
    paddingLeft: "16px",
    lineHeight: "1.6",
  },
};

export default DashboardContent;
