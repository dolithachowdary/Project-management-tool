import React from "react";

export default function QAPending() {
  const tasks = [
    {
      id: 1,
      title: "Test User Registration",
      time: "3:00 PM",
      project: "Project 1 (Red)",
      color: "#d32f2f"
    },
    {
      id: 2,
      title: "Verify Payment Gateway",
      time: "4:45 PM",
      project: "Project 2 (Blue)",
      color: "#1976d2"
    },
    {
      id: 3,
      title: "Review Dashboard UI",
      time: "5:15 PM",
      project: "Project 3 (Yellow)",
      color: "#f9a825"
    }
  ];

  return (
    <div style={styles.card}>
      <div style={styles.header}>QA Pending Tasks</div>
      <div style={styles.sub}>Today</div>

      {tasks.map((t, idx) => (
        <div key={t.id} style={styles.row}>
          {/* LEFT ICON */}
          <div style={styles.iconWrap}>
            <div style={{ ...styles.iconCircle, background: t.color }}></div>
          </div>

          {/* RIGHT SIDE */}
          <div style={styles.textBlock}>
            <div style={styles.title}>{t.title}</div>
            <div style={styles.time}>{t.time}</div>
            <div style={styles.project}>{t.project}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----- Internal Styles ------ */

const styles = {
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "16px",
    background: "#fff",
    marginTop: 20
  },
  header: { fontSize: 15, fontWeight: 600 },
  sub: { marginTop: 4, fontSize: 13, color: "#777" },

  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid #f0f0f0"
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: "50%"
  },

  textBlock: { display: "flex", flexDirection: "column" },
  title: { fontSize: 14, fontWeight: 600 },
  time: { fontSize: 12, marginTop: 2, color: "#505050" },
  project: { fontSize: 12, marginTop: 3, color: "#777" }
};
