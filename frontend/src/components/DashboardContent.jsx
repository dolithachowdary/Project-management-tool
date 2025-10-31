import React, { useEffect, useState } from "react";
import Card from "./Card";
import { apiRequest } from "../utils/api";

const DashboardContent = () => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const data = await apiRequest("/projects", { method: "GET" });
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err.message);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h3>Active Projects</h3>
        <div style={styles.cardGrid}>
          {projects.length > 0 ? (
            projects.map((p) => (
              <Card key={p._id}>
                <div style={styles.cardHeader}>
                  <h4>{p.name}</h4>
                  <span style={styles.activeBadge}>
                    {p.status || "Active"}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  {p.description}
                </p>
                <div style={styles.progressBarOuter}>
                  <div
                    style={{
                      ...styles.progressBarInner,
                      width: `${p.progress || 50}%`,
                    }}
                  ></div>
                </div>
              </Card>
            ))
          ) : (
            <p>No active projects</p>
          )}
        </div>

        <h3>Active Sprints</h3>
        <div style={styles.cardGrid}>
          {[1, 2].map((i) => (
            <Card key={i}>
              <h4>Sprint {i}</h4>
              <p>Ends in {i * 5} days</p>
              <small>Project {i}</small>
            </Card>
          ))}
        </div>

        <h3>Workload Balance</h3>
        <Card>
          <p style={{ textAlign: "center", color: "#777" }}>
            [Graph Placeholder]
          </p>
        </Card>
      </div>

      <div style={styles.rightPanel}>
        <Card>
          <h4>Calendar</h4>
          <p style={{ color: "#777", textAlign: "center" }}>
            [Calendar Placeholder]
          </p>
        </Card>
        <Card>
          <h4>Upcoming Deadlines</h4>
          <ul>
            <li>Task 1 - 2 days left</li>
            <li>Task 2 - 5 days left</li>
          </ul>
        </Card>
        <Card>
          <h4>QA Pending</h4>
          <ul>
            <li>Feature A</li>
            <li>Bug Fix B</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: "20px",
    overflowY: "auto",
  },
  mainContent: {
    flex: 3,
    marginRight: "20px",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
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
    padding: "2px 8px",
    borderRadius: "4px",
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
  },
};

export default DashboardContent;
