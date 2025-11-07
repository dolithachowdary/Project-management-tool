import React from "react";

const activities = [
  {
    time: "9:00 AM",
    title: "Uploaded design files",
    desc: "Assets for ‘VanHome Realty Homepage’ uploaded.",
    icon: "📁",
    color: "#FFE0B2",
  },
  {
    time: "10:45 AM",
    title: "Updated task status",
    desc: "Task ‘VanHome UI Redesign’ marked complete.",
    icon: "✅",
    color: "#BBDEFB",
  },
  {
    time: "11:15 AM",
    title: "Added a new task",
    desc: "Created ‘HealthPlus App UI’ under the Design project.",
    icon: "📝",
    color: "#FFF9C4",
  },
];

const RecentActivity = () => {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Recent Activity</h3>
      {activities.map((a, i) => (
        <div key={i} style={styles.item}>
          <div style={{ ...styles.icon, backgroundColor: a.color }}>{a.icon}</div>
          <div>
            <p style={styles.time}>{a.time}</p>
            <p style={styles.text}>
              <b>{a.title}</b> — {a.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  title: {
    marginBottom: "15px",
    color: "#222",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  item: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
    marginBottom: "15px",
  },
  icon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  time: {
    fontSize: "0.8rem",
    color: "#999",
    marginBottom: "3px",
  },
  text: {
    fontSize: "0.9rem",
    color: "#333",
  },
};

export default RecentActivity;
