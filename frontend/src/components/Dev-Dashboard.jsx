import React from "react";

/**
 * Dev-Dashboard.jsx
 * Simple "in progress" placeholder for Developer view.
 * Replace placeholders with real components (My Tasks, Progress, etc.)
 */

const DevDashboard = ({ role }) => {
  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Overview — Developer</h2>
        <div style={styles.smallNote}>Role: {role || "Developer"}</div>
      </div>

      <div style={styles.content}>
        <div style={styles.left}>
          <div style={styles.card}>
            <div style={styles.cardBody}>
              <h3 style={{ margin: 0 }}>Work in progress</h3>
              <p style={{ color: "#666", marginTop: 8 }}>
                Developer Dashboard is being prepared — your assigned tasks and sprint details will show here.
              </p>

              <div style={styles.loaderRow}>
                <div style={styles.loader} />
                <div style={{ marginLeft: 12 }}>Preparing your workspace…</div>
              </div>
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div style={styles.tasksList}>
            <div style={styles.taskPlaceholder}>• Task placeholder 1</div>
            <div style={styles.taskPlaceholder}>• Task placeholder 2</div>
            <div style={styles.taskPlaceholder}>• Task placeholder 3</div>
          </div>
        </div>

        <aside style={styles.right}>
          <div style={styles.card}>
            <div style={styles.cardBody}>
              <h4 style={{ margin: 0 }}>Mini Calendar</h4>
              <div style={{ marginTop: 12, color: "#aaa" }}>[Calendar placeholder]</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: 20,
    boxSizing: "border-box",
    minHeight: "calc(100vh - 70px)",
    background: "#fafafa",
  },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { margin: 0, fontSize: 20 },
  smallNote: { color: "#666", fontSize: 13 },

  content: { display: "flex", gap: 20 },
  left: { flex: 1 },
  right: { width: 260, flexShrink: 0 },

  card: {
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #eee",
    padding: 14,
    boxShadow: "0 1px 2px rgba(20,20,20,0.03)",
  },
  cardBody: {},

  loaderRow: { display: "flex", alignItems: "center", marginTop: 12 },
  loader: {
    width: 18,
    height: 18,
    borderRadius: 9,
    border: "3px solid #eee",
    borderTopColor: "#0e7bd0",
    animation: "spin 1s linear infinite",
  },

  tasksList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  taskPlaceholder: {
    background: "#fff",
    border: "1px dashed #e6e6e6",
    borderRadius: 8,
    padding: 12,
    color: "#666",
  },
};

/* inject spinner keyframes once */
const styleTagId2 = "dev-dashboard-spin-style";
if (typeof document !== "undefined" && !document.getElementById(styleTagId2)) {
  const s = document.createElement("style");
  s.id = styleTagId2;
  s.innerHTML = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

export default DevDashboard;
