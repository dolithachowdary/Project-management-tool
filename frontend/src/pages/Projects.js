import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";

const Projects = ({ role = "Project Manager" }) => {
  const projects = [
    { id: 1, name: "Website Revamp", status: "Active", progress: 70 },
    { id: 2, name: "Mobile App UI", status: "Active", progress: 45 },
    { id: 3, name: "Client Onboarding", status: "On Hold", progress: 20 },
    { id: 4, name: "Automation System", status: "Completed", progress: 100 },
    { id: 5, name: "Security Upgrade", status: "Active", progress: 55 },
    { id: 6, name: "Legacy Migration", status: "On Hold", progress: 30 },
    { id: 7, name: "Marketing Dashboard", status: "Completed", progress: 100 },
  ];

  const filterByStatus = (status) =>
    projects.filter((project) => project.status === status);

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Projects</h2>

          {/* Active */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Active Projects</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("Active").map((p) => (
                <div key={p.id} style={styles.cardWrapper}>
                  <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span
                        style={{ ...styles.badge, ...styles.activeBadge }}
                      >
                        Active
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>{p.progress}% complete</p>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* On Hold */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>On Hold</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("On Hold").map((p) => (
                <div key={p.id} style={styles.cardWrapper}>
                  <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span style={{ ...styles.badge, ...styles.holdBadge }}>
                        On Hold
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          backgroundColor: "#fbc02d",
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>{p.progress}% complete</p>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* Completed */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Completed</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("Completed").map((p) => (
                <div key={p.id} style={styles.cardWrapper}>
                  <Card style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span
                        style={{ ...styles.badge, ...styles.completedBadge }}
                      >
                        Completed
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          backgroundColor: "#2e7d32",
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>100% complete</p>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// === Styles ===
const styles = {
  pageContainer: {
    display: "flex",
    backgroundColor: "#f9f9f9",
    height: "100vh",
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  pageInner: {
    padding: "30px",
    backgroundColor: "#f9f9f9",
    boxSizing: "border-box",
  },
  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#222",
    marginBottom: "25px",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#222",
    marginBottom: "15px",
  },

  // === FIXED GRID ===
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

  // === CARD CONTENT ===
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  projectTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#222",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "500",
  },
  activeBadge: {
    backgroundColor: "#c62828",
  },
  holdBadge: {
    backgroundColor: "#fbc02d",
    color: "#222",
  },
  completedBadge: {
    backgroundColor: "#2e7d32",
  },
  progressOuter: {
    backgroundColor: "#eee",
    borderRadius: "5px",
    height: "8px",
    overflow: "hidden",
  },
  progressInner: {
    height: "8px",
    backgroundColor: "#c62828",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  },
  progressText: {
    marginTop: "8px",
    fontSize: "0.85rem",
    color: "#555",
  },
};

export default Projects;
