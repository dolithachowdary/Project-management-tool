import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";

const Sprints = () => {
  const sprintData = [
    {
      name: "Sprint 1",
      project: "Website Revamp",
      status: "Active",
      progress: 70,
      due: "Ends in 5 days",
    },
    {
      name: "Sprint 2",
      project: "Mobile App UI",
      status: "Active",
      progress: 45,
      due: "Ends in 10 days",
    },
    {
      name: "Sprint 3",
      project: "Security Upgrade",
      status: "Active",
      progress: 60,
      due: "Ends in 12 days",
    },
    {
      name: "Sprint 4",
      project: "Client Portal",
      status: "Active",
      progress: 20,
      due: "Ends in 15 days",
    },
  ];

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Header role="Project Manager" />

        {/* === Page Content === */}
        <div style={styles.content}>
          <h2 style={styles.title}>Sprints</h2>

          <section>
            <h3 style={styles.sectionTitle}>Active Sprints</h3>
            <div style={styles.cardGrid}>
              {sprintData.map((sprint, i) => (
                <Card key={i}>
                  <div style={styles.cardHeader}>
                    <h4>{sprint.name}</h4>
                    <span style={styles.activeBadge}>{sprint.status}</span>
                  </div>

                  <p style={styles.subText}>{sprint.project}</p>
                  <p style={styles.smallText}>{sprint.due}</p>

                  <div style={styles.progressBarOuter}>
                    <div
                      style={{
                        ...styles.progressBarInner,
                        width: `${sprint.progress}%`,
                      }}
                    ></div>
                  </div>

                  <p style={styles.progressText}>{sprint.progress}% complete</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#fff",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    padding: "30px",
    backgroundColor: "#f9f9f9",
    flex: 1,
    overflowY: "auto",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#111",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#333",
    margin: "20px 0 15px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  activeBadge: {
    backgroundColor: "#c62828",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  subText: {
    color: "#444",
    fontWeight: "500",
    marginBottom: "5px",
  },
  smallText: {
    color: "#777",
    fontSize: "14px",
    marginBottom: "10px",
  },
  progressBarOuter: {
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: "5px",
    height: "8px",
    marginBottom: "6px",
  },
  progressBarInner: {
    height: "8px",
    borderRadius: "5px",
    backgroundColor: "#c62828",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "13px",
    color: "#555",
    textAlign: "right",
  },
};

export default Sprints;
