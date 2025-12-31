import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PMTimeline from "../components/Pm-Timeline";
import { getProjects } from "../api/projects";
import Loader from "../components/Loader";

export default function Timesheets() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const role = localStorage.getItem("role") || "Project Manager";

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      const data = res.data?.data || res.data || [];
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div style={styles.page}>
      <Sidebar />

      <div style={styles.main}>
        <Header role={role} />

        <div style={styles.splitLayout}>
          {/* LEFT PANEL: PROJECT LIST */}
          <div style={styles.leftPane}>
            <div style={styles.headerRow}>
              <h2 style={styles.pageTitle}>Timesheets</h2>
            </div>

            {loading ? <Loader /> : (
              <div style={styles.projectList}>
                {projects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setActiveProjectId(p.id)}
                    style={{
                      ...styles.projectCard,
                      borderLeft: `4px solid ${p.color || "#4F7DFF"}`,
                      background: activeProjectId === p.id ? "#fff" : "transparent",
                      boxShadow: activeProjectId === p.id ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    <h3 style={styles.projName}>{p.name}</h3>
                    <p style={styles.projCode}>{p.project_code || "PRJ-001"}</p>
                    <div style={styles.projMeta}>
                      <span>{p.total_tasks || 0} Tasks</span>
                      <span style={{ color: p.color || "#4F7DFF", fontWeight: 700 }}>
                        {p.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: TIMELINE */}
          <div style={styles.rightPane}>
            {activeProject ? (
              <div style={styles.timelineWrapper}>
                <div style={styles.timelineHeader}>
                  <div style={styles.titleInfo}>
                    <h2 style={styles.timelineTitle}>{activeProject.name} Timeline</h2>
                    <p style={styles.timelineSub}>10:00 AM — 06:00 PM Work Schedule</p>
                  </div>
                  <div style={{ ...styles.statusDot, background: activeProject.color }} />
                </div>
                <PMTimeline projectId={activeProjectId} />
              </div>
            ) : (
              <div style={styles.empty}>Select a project to view its timeline</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f8fafc",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  splitLayout: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: 0,
    flex: 1,
    overflow: "hidden",
  },
  leftPane: {
    background: "#f1f5f9",
    borderRight: "1px solid #e2e8f0",
    padding: "24px",
    overflowY: "auto",
  },
  rightPane: {
    padding: "32px",
    overflowY: "auto",
    background: "#fff",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
    marginBottom: 24,
  },
  projectList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  projectCard: {
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      background: "#fff",
    }
  },
  projName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
    marginBottom: 4,
  },
  projCode: {
    fontSize: 12,
    color: "#64748b",
    margin: 0,
    marginBottom: 8,
  },
  projMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
  },
  timelineWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottom: "1px solid #f1f5f9",
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
  },
  timelineSub: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
    marginTop: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    boxShadow: "0 0 0 4px rgba(0,0,0,0.03)",
  },
  empty: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: 16,
  }
};
