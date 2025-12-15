import React from "react";
import MiniCalendar from "./Mini-Calendar";
import Upcoming from "./Upcoming";
import RecentActivity from "./RecentActivity";
import QAPending from "./QAPending";
import WeeklyTaskGraph from "./WeeklyTaskGraph";
import ActiveProjects from "./ActiveProject";
import ActiveSprints from "./ActiveSprints";

export default function PMDashboard() {
  return (
    <div style={styles.page}>

      <div style={styles.mainGrid}>

        {/* ---------------- LEFT CONTENT ---------------- */}
        <div style={styles.left}>

          {/* STAT CARDS */}
          <div style={styles.statsRow}>
            {renderStat("Completed Tasks", 127, "67.18%", "#2e7d32")}
            {renderStat("Incompleted Tasks", 62, "54.29%", "#c62828")}
            {renderStat("Overdue Tasks", 20, "14.11%", "#777")}
          </div>

          {/* GRAPH + RECENT ACTIVITY */}
            <div style={styles.graphRow}>

          {/* WEEKLY TASK GRAPH */}
            <div style={styles.graphWrapper}>
            <h3 style={styles.sectionTitle}>Weekly Tasks Graph</h3>
          <WeeklyTaskGraph />
        </div>

        {/* RECENT ACTIVITY */}
          <div style={styles.recentWrapper}>
            <RecentActivity />
          </div>

        </div>

          {/* ACTIVE PROJECTS */}
          <ActiveProjects />

          {/* ACTIVE SPRINTS */}
          <ActiveSprints />

        </div>

        {/* ---------------- RIGHT SIDEBAR ---------------- */}
        <aside style={styles.right}>
          <div style={styles.card}><MiniCalendar /></div>
          <div style={styles.card}><Upcoming /></div>
          <div style={styles.card}><QAPending /></div>
        </aside>

      </div>
    </div>
  );
}

/* ---------- Helper ---------- */
function renderStat(title, number, percent, color) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statNumber}>{number}</div>
      <div style={{ ...styles.statPercent, color }}>{percent}</div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    background: "#fafafa",
    boxSizing: "border-box"
  },

  /* Layout */
  mainGrid: {
    display: "flex",
    gap: 20
  },

  left: { flex: 1 },

  right: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 20
  },

  /* STAT CARDS */
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20
  },

  statCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 14
  },

  statTitle: { fontSize: 13, color: "#444" },
  statNumber: { fontSize: 26, fontWeight: 600, marginTop: 4 },
  statPercent: { fontSize: 12, marginTop: 2 },

  /* GRAPH + RECENT ACTIVITY */
  graphRow: {
  display: "grid",
  gridTemplateColumns: "2.5fr 1.5fr", // graph + activity
  gap: 20,
  marginBottom: 25,
  alignItems: "stretch"
  },

  graphWrapper: {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e5e5e5",
  padding: 20
},

  recentWrapper: {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e5e5e5",
  padding: 16,
  display: "flex",
  flexDirection: "column"
},

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12
  },

  /* RIGHT COLUMN CARDS */
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16
  }
};
