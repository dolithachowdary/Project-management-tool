import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import AddProject from "../components/AddProject";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../api/projects";
import Loader from "../components/Loader";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role") || "Project Manager";

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      // Ensure we extract the array correctly
      const data = res.data?.data || res.data || [];
      console.log("Projects Loaded:", data); // Debug log
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const projectsByStatus = {
    "Active Projects": projects.filter((p) => p.status === "active"),
    "On Hold Projects": projects.filter((p) => p.status === "on_hold"),
    "Completed Projects": projects.filter((p) => p.status === "completed"),
  };

  // Helper to safely format dates
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : "TBD";

  const handleProjectClick = (id) => {
    console.log("Navigating to project ID:", id); // ✅ Debug log
    if (id) {
      navigate(`/projects/${id}`);
    } else {
      console.error("Error: Project ID is missing");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          {loading ? (
            <Loader />
          ) : (
            Object.entries(projectsByStatus).map(([title, list]) =>
              list.length > 0 && (
                <section key={title} style={styles.section}>
                  <h3 style={styles.sectionTitle}>{title}</h3>

                  <div style={styles.cardGrid}>
                    {list.map((p) => (
                      <div
                        key={p.id}
                        style={styles.cardWrapper}
                        // ✅ Updated Click Handler
                        onClick={() => handleProjectClick(p.id)}
                      >
                        <Card
                          title={p.name}
                          progress={(() => {
                            const total = p.totalTasks || p.total_tasks || p.tasks_count || p.summary?.total_tasks || p.summary?.tasks?.total || 0;
                            const completed = p.completedTasks || p.completed_tasks || p.summary?.completed_tasks || p.summary?.tasks?.completed || 0;
                            return total > 0 ? Math.round((completed / total) * 100) : 0;
                          })()}
                          startDate={formatDate(p.start_date || p.startDate)}
                          endDate={formatDate(p.end_date)}
                          members={p.members || []}
                          timeLeft={p.status === "active" ? "Active" : p.status === "completed" ? "Completed" : "On Hold"}
                          color={p.color || "#4F7DFF"}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )
            )
          )}
        </div>
      </div>

      {["admin", "Project Manager"].includes(role) && (
        <>
          <AddProject
            isOpen={showAddProject}
            onClose={() => {
              setShowAddProject(false);
              loadProjects();
            }}
          />
          <button style={styles.fab} onClick={() => setShowAddProject(true)}>
            + Add Project
          </button>
        </>
      )}
    </div>
  );
};

export default Projects;

/* ---------------- STYLES (Unchanged) ---------------- */
const styles = {
  pageContainer: { display: "flex", height: "100vh", background: "#f9f9f9" },
  mainContent: { flex: 1, overflowY: "auto" },
  pageInner: { padding: 20 },
  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "14px 18px",
    background: "#4F7DFF",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
    zIndex: 1001,
  },
  section: { marginBottom: 25 },
  sectionTitle: { marginBottom: 8, fontWeight: 600, fontSize: 18 },
  cardGrid: { display: "flex", flexWrap: "wrap", gap: 20 },
  cardWrapper: {
    flex: "1 1 300px",
    maxWidth: 340,
    minWidth: 280,
    cursor: "pointer", // Essential for UX
  },
};