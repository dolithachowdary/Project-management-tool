import React from "react";
import Card from "./Card";
import Calendar from "./Calendar";
import TaskGraph from "./TaskGraph";
import RecentActivity from "./RecentActivity";

const DashboardContent = () => {
  return (
    <div style={styles.container}>
      {/* === LEFT MAIN SECTION === */}
      <div style={styles.mainContent}>
        {/* Active Projects */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Active Projects</h3>
          <div style={styles.cardGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={styles.cardWrapper}>
                <Card>
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
                  <p style={styles.progressText}>{30 * i}% complete</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Active Sprints */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Active Sprints</h3>
          <div style={styles.cardGrid}>
            {[1, 2].map((i) => (
              <div key={i} style={styles.cardWrapper}>
                <Card>
                  <div style={styles.cardHeader}>
                    <h4>Sprint {i}</h4>
                    <span style={styles.activeBadge}>Active</span>
                  </div>
                  <p style={styles.subText}>Ends in {i * 5} days</p>
                  <p style={styles.smallText}>Project {i}</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Workload Balance */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Workload Balance</h3>
          <Card>
            <p style={{ textAlign: "center", color: "#777" }}>
              [Graph Placeholder]
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
            <li>Task 1 - 2 days left</li>
            <li>Task 2 - 5 days left</li>
          </ul>
        </Card>
        <Card>
          <h4 style={styles.sidebarTitle}>QA Pending</h4>
          <ul style={styles.list}>
            <li>Feature A</li>
            <li>Bug Fix B</li>
          </ul>
        </Card>
      </aside>
    </div>
  );
};

const styles = {
  // === GRID CONTAINER ===
  container: {
    display: "grid",
    gridTemplateColumns: "2.5fr 1fr", // Left main | Right sidebar
    gap: "30px",
    padding: "30px",
    backgroundColor: "#f9f9f9",
    overflowY: "auto",
    boxSizing: "border-box",
    width: "100%",
    minHeight: "100%",
  },

  // === LEFT MAIN SECTION ===
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    marginBottom: "12px",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#111",
  },

  // === FLEX GRID FOR CARDS ===
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

  // === CARD ELEMENTS ===
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

  // === TASK GRAPH + RECENT ACTIVITY ROW ===
  bottomRow: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
  },
  bottomLeft: {
    flex: "1 1 55%",
    minWidth: "350px",
  },
  bottomRight: {
    flex: "1 1 40%",
    minWidth: "300px",
  },

  // === RIGHT SIDEBAR ===
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
