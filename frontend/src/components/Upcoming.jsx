import React from "react";

export default function Upcoming() {
  const items = [
    {
      id: 1,
      color: "#d32f2f",
      time: "2:00 PM",
      title: "Submit Initial Wireframes",
      desc: "Deadline for VanHome Realty High-Fidelity Wireframes.",
      project: "Project 1 (Red)"
    },
    {
      id: 2,
      color: "#1976d2",
      time: "4:30 PM",
      title: "Finalize Icon Set",
      desc: "Complete all custom icons for HealthPlus UI Redesign.",
      project: "Project 2 (Blue)"
    },
    {
      id: 3,
      color: "#f9a825",
      time: "5:30 PM",
      title: "Design System Review",
      desc: "Review and approve new components for Elegant Framework.",
      project: "Project 3 (Yellow)"
    }
  ];

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <span style={styles.title}>Upcoming Deadlines</span>
        <button style={styles.seeAll}>See all</button>
      </div>

      {items.map((item, idx) => (
        <div key={item.id} style={styles.rowWrap}>
          <div style={styles.leftCol}>
            <div style={{ ...styles.dotWrap, borderColor: item.color }}>
              <div style={{ ...styles.dot, background: item.color }}></div>
            </div>
            {idx !== items.length - 1 && <div style={styles.line}></div>}
          </div>

          <div style={styles.rightCol}>
            <div style={styles.itemTitle}>{item.title}</div>
            <div style={styles.time}>{item.time}</div>
            <div style={styles.desc}>{item.desc}</div>
            <div style={styles.project}>{item.project}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
    background: "#fff"
  },
  headerRow: { display: "flex", justifyContent: "space-between" },
  title: { fontWeight: 600, fontSize: 15 },
  seeAll: {
    fontSize: 13,
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: "2px 8px",
    background: "#fafafa",
    cursor: "pointer"
  },
  rowWrap: { display: "flex", marginTop: 16, position: "relative" },

  /* Left timeline column */
  leftCol: { width: 30, position: "relative" },
  dotWrap: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%"
  },
  line: {
    position: "absolute",
    top: 28,
    left: 13,
    width: 2,
    height: "50px",
    background: "#ddd"
  },

  /* Right content */
  rightCol: { flex: 1, marginLeft: 8 },
  itemTitle: { fontSize: 14, fontWeight: 600 },
  time: { marginTop: 2, fontSize: 13, color: "#444" },
  desc: { marginTop: 4, fontSize: 13, color: "#666" },
  project: { marginTop: 4, fontSize: 12, fontWeight: 500 }
};
