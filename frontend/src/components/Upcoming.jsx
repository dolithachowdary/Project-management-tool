import React from "react";
import { Calendar, Clock } from "lucide-react";

export default function Upcoming({ tasks = [], onTaskClick }) {
  // Sort by date and take top 5
  const upcomingTasksData = tasks
    .filter(t => t.end_date || t.endDate)
    .sort((a, b) => new Date(a.end_date || a.endDate) - new Date(b.end_date || b.endDate))
    .slice(0, 5);

  const upcomingTasks = upcomingTasksData.map(t => ({
    id: t.id || t._id,
    title: t.title || t.taskName,
    date: new Date(t.end_date || t.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: t.end_time || "End of day",
    project: t.project_name || t.projectName || "General",
    color: t.priority === "High" ? "var(--error-color, #ef4444)" : t.priority === "Low" ? "var(--success-color, #10b981)" : "var(--warning-color, #f59e0b)",
    raw: t
  }));

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <span style={styles.title}>Upcoming Deadlines</span>
      </div>

      <div style={styles.list} className="hide-scrollbar">
        {upcomingTasks.length === 0 ? (
          <div style={styles.empty}>No upcoming deadlines</div>
        ) : (
          upcomingTasks.map((item, idx) => (
            <div
              key={item.id}
              style={{ ...styles.rowWrap, cursor: onTaskClick ? 'pointer' : 'default' }}
              onClick={() => onTaskClick && onTaskClick(item.raw)}
            >
              <div style={styles.leftCol}>
                <div style={{ ...styles.dotWrap, borderColor: item.color }}>
                  <div style={{ ...styles.dot, background: item.color }}></div>
                </div>
                {idx !== upcomingTasks.length - 1 && <div style={styles.line}></div>}
              </div>

              <div style={styles.rightCol}>
                <div style={styles.itemTitle}>{item.title}</div>
                <div style={styles.meta}>
                  <div style={styles.timeRow}>
                    <Calendar size={12} /> {item.date}
                  </div>
                  <div style={styles.timeRow}>
                    <Clock size={12} /> {item.time}
                  </div>
                </div>
                <div style={styles.projectBadge}>{item.project}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid var(--border-color)",
    borderRadius: 16,
    padding: 16, // Reduced from 20
    background: "var(--card-bg)",
    boxShadow: "var(--shadow-sm)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12, // Reduced from 20
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: 8, // Reduced from 12
  },
  title: { fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }, // Smaller title
  list: {
    maxHeight: 330,
    overflowY: "auto",
    paddingRight: 4,
  },
  rowWrap: { display: "flex", position: "relative", marginBottom: 12 }, // Reduced from 20
  leftCol: { width: 24, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" },
  dotWrap: {
    width: 16, // Smaller dot
    height: 16,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--card-bg)",
    zIndex: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%"
  },
  line: {
    width: 2,
    flex: 1,
    background: "var(--border-color)",
    marginTop: 4,
    marginBottom: -24,
  },
  rightCol: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 },
  meta: { display: "flex", gap: 12, marginBottom: 8 },
  timeRow: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-secondary)" },
  projectBadge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 600,
    color: "var(--accent-color)",
    background: "var(--bg-secondary)",
    padding: "2px 8px",
    borderRadius: 4,
  },
  empty: {
    padding: "40px 0",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: 14,
  }
};
