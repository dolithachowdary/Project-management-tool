import React from "react";

/**
 * Dev-Dashboard.jsx
 * Developer Overview (NO timeline here)
 */

const DevDashboard = ({ role }) => {
  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Overview — Developer</h2>
        <div style={styles.smallNote}>Role: {role || "Developer"}</div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        {/* LEFT */}
        <div style={styles.left}>

          {/* SUMMARY CARD */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>My Tasks</h3>

            <div style={styles.tasksList}>
              <div style={styles.taskItem}>Implement Weekly Task Graph</div>
              <div style={styles.taskItem}>Fix Dashboard Responsiveness</div>
              <div style={styles.taskItem}>Prepare Sprint Demo</div>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <aside style={styles.right}>
          <div style={styles.card}>
            <h4 style={{ margin: 0 }}>Quick Notes</h4>
            <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
              Use the Timeline tab to track today’s project allocation.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: 20,
    background: "#fafafa",
    minHeight: "calc(100vh - 70px)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 600 },
  smallNote: { fontSize: 13, color: "#666" },

  content: { display: "flex", gap: 20 },
  left: { flex: 1 },
  right: { width: 280 },

  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
  },

  cardTitle: { margin: 0, fontSize: 16, fontWeight: 600 },

  tasksList: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  taskItem: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "#f7f7f7",
    border: "1px solid #eee",
  },
};

export default DevDashboard;
