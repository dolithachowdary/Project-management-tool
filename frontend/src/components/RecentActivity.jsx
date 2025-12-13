import React from "react";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      icon: "upload",
      time: "9:00 AM",
      title: "Uploaded design files",
      desc: "I've uploaded the assets for the ‘VanHome Realty High-Fidelity Wireframes’."
    },
    {
      id: 2,
      icon: "clock",
      time: "10:45 AM",
      title: "Updated task status",
      desc: "Brian Adams marked the task as In Progress."
    },
    {
      id: 3,
      icon: "plus",
      time: "11:15 AM",
      title: "Added a new task",
      desc: "David Smith created a new task ‘HealthPlus App Custom Icon Set’."
    }
  ];

  return (
    <div style={styles.card}>
      <div style={styles.header}>Recent Activity</div>
      <div style={styles.sub}>Today</div>

      {activities.map((a) => (
        <div key={a.id} style={styles.item}>
          <div style={styles.iconWrap}>{renderIcon(a.icon)}</div>
          <div>
            <div style={styles.title}>{a.title}</div>
            <div style={styles.time}>{a.time}</div>
            <div style={styles.desc}>{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderIcon(type) {
  const common = { stroke: "#000", strokeWidth: 2, fill: "none" };

  if (type === "upload")
    return (
      <svg width="36" height="36" viewBox="0 0 24 24">
        <path d="M12 16V4" {...common} />
        <polyline points="6 10 12 4 18 10" {...common} />
        <rect x="4" y="16" width="16" height="4" {...common} />
      </svg>
    );

  if (type === "clock")
    return (
      <svg width="36" height="36" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="M12 7v5l3 2" {...common} />
      </svg>
    );

  return (
    <svg width="36" height="36" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" {...common} />
      <line x1="5" y1="12" x2="19" y2="12" {...common} />
    </svg>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
    background: "#fff"
  },
  header: { fontSize: 15, fontWeight: 600 },
  sub: { marginTop: 4, fontSize: 13, color: "#777" },
  item: {
    display: "flex",
    gap: 12,
    marginTop: 20
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: { fontSize: 14, fontWeight: 600 },
  time: { fontSize: 12, color: "#777" },
  desc: { marginTop: 4, fontSize: 13 }
};
