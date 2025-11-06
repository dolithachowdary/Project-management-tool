import React from "react";
import Card from "./Card";
import Calendar from "./Calendar";


const DashboardContent = () => {
  return (
    <div style={styles.container}>
      {/* === LEFT MAIN SECTION === */}
      <div style={styles.mainContent}>
        {/* Active Projects */}
        <section>
          <h3 style={styles.sectionTitle}>Active Projects</h3>
          <div style={styles.cardGrid}>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div style={styles.cardHeader}>
                  <h4>Project {i}</h4>
                  <span style={styles.activeBadge}>Active</span>
                </div>
                <div style={styles.progressBarOuter}>
                  <div
                    style={{
                      ...styles.progressBarInner,
                      width: `${30 * i}%`,
                    }}
                  ></div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Active Sprints */}
        <section>
          <h3 style={styles.sectionTitle}>Active Sprints</h3>
          <div style={styles.cardGrid}>
            {[1, 2].map((i) => (
              <Card key={i}>
                <h4>Sprint {i}</h4>
                <p>Ends in {i * 5} days</p>
                <small>Project {i}</small>
              </Card>
            ))}
          </div>
        </section>

        {/* Workload Balance */}
        <section>
          <h3 style={styles.sectionTitle}>Workload Balance</h3>
          <Card>
            <p style={{ textAlign: "center", color: "#777" }}>
              [Graph Placeholder]
            </p>
          </Card>
        </section>
      </div>

      {/* === RIGHT SIDEBAR === */}
      <aside style={styles.rightPanel}>
        <Card>
          <h4>Calendar</h4>
          <Calendar /> 
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
      </aside>
    </div>
  );
};

const styles = {
  // GRID layout for main container
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

  // LEFT MAIN CONTENT (projects/sprints)
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    minWidth: 0, // prevents flex overflow
  },

  // RIGHT SIDEBAR
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "340px",
    flexShrink: 0,
  },

  // Title Styling
  sectionTitle: {
    marginBottom: "12px",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#111",
  },

  // Card grid for projects/sprints
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    width: "100%",
    boxSizing: "border-box",
  },

  // Card header (project title + badge)
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  // Active badge
  activeBadge: {
    backgroundColor: "#c62828",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  },

  // Progress bar container
  progressBarOuter: {
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: "5px",
    height: "8px",
  },

  // Progress bar fill
  progressBarInner: {
    backgroundColor: "#c62828",
    height: "8px",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  },
};

export default DashboardContent;
