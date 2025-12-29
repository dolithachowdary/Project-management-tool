import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import AddProject from "../components/AddProject";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../api/projects";

const Projects = ({ role = "Project Manager" }) => {
  const navigate = useNavigate();
  const [showAddProject, setShowAddProject] = useState(false);
  const [projects, setProjects] = useState([]);

  /* ---------------- LOAD PROJECTS ---------------- */

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  /* ---------------- GROUP BY STATUS ---------------- */

  const projectsByStatus = {
    "Active Projects": projects.filter(p => p.status === "active"),
    "On Hold Projects": projects.filter(p => p.status === "on_hold"),
    "Completed Projects": projects.filter(p => p.status === "completed"),
  };

  /* ---------------- UTIL ---------------- */

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) : "—";

  const getBadgeColor = (status) => {
    if (status === "completed") return "#2e7d32";
    if (status === "on_hold") return "#fbc02d";
    return "#1e88e5";
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          {/* PROJECT SECTIONS */}
          {Object.entries(projectsByStatus).map(([section, list]) => (
            list.length > 0 && (
              <section key={section} style={styles.section}>
                <h3 style={styles.sectionTitle}>{section}</h3>

                <div style={styles.cardGrid}>
                  {list.map((project) => (
                    <div
                      key={project.id}
                      style={styles.cardWrapper}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Card
                        title={project.name}
                        progress={
                          project.status === "completed" ? 100 : 50
                        }
                        startDate={formatDate(project.start_date)}
                        endDate={formatDate(project.end_date)}
                        members={[]}             // will plug later
                        timeLeft={
                          project.status === "completed"
                            ? "Completed"
                            : project.status === "on_hold"
                            ? "On Hold"
                            : "In Progress"
                        }
                        color={getBadgeColor(project.status)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      </div>

      {/* ADD PROJECT MODAL */}
      {["admin", "pm"].includes(role) && (
        <AddProject
          isOpen={showAddProject}
          onClose={() => {
          setShowAddProject(false);
            loadProjects();
          }}
        />
      )}  

      {/* FLOATING ADD PROJECT BUTTON */}
      {/* <button
        style={styles.fab}
        onClick={() => setShowAddProject(true)}
      >
        + Add Project
      </button> */}
      {["admin", "Project Manager"].includes(role) && (
      <button
        style={styles.fab}
        onClick={() => setShowAddProject(true)}
      >
        + Add Project
      </button>
    )}
    </div>
  );
};

export default Projects;

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = {
  pageContainer: {
    display: "flex",
    height: "100vh",
    background: "#f9f9f9",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
  },
  pageInner: {
    padding: 20,
  },
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 600,
    fontSize: 18,
  },
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
  },
  cardWrapper: {
    flex: "1 1 300px",
    maxWidth: 340,
    minWidth: 280,
    cursor: "pointer",
  },
};
