import React from "react";

/* SAME COLORS AS Tasks.js */
const STATUS_COLORS = {
  "To Do": { bg: "#E3F2FD", text: "#1565C0" },
  "In Progress": { bg: "#FFF8E1", text: "#856404" },
  Review: { bg: "#E8EAF6", text: "#2E3A59" },
  Done: { bg: "#E8F5E9", text: "#2E7D32" },
  Blocked: { bg: "#FCE4EC", text: "#8B1E3F" },
};

const DEV_ORDER = {
  "In Progress": 1,
  "To Do": 2,
  Review: 3,
  Blocked: 4,
  Done: 5,
};

export default function TaskOverviewList({
  tasks,
  role,
  currentUser = "A",
}) {
  const filtered =
    role === "Developer"
      ? tasks.filter((t) => t.assignedTo.includes(currentUser))
      : tasks;

  const sorted =
    role === "Developer"
      ? [...filtered].sort(
          (a, b) => DEV_ORDER[a.status] - DEV_ORDER[b.status]
        )
      : filtered;

  const groupedByProject =
    role === "Project Manager"
      ? sorted.reduce((acc, t) => {
          acc[t.projectName] = acc[t.projectName] || [];
          acc[t.projectName].push(t);
          return acc;
        }, {})
      : null;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>
        {role === "Developer" ? "Today’s Tasks" : "Team Tasks"}
      </h3>

      {/* DEV VIEW */}
      {role === "Developer" &&
        sorted.map((task) => {
          const color = STATUS_COLORS[task.status];
          const done = task.status === "Done";

          return (
            <div key={task.id} style={styles.row}>
              <span
                style={{
                  ...styles.dot,
                  background: done ? "#22c55e" : color.text,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={styles.task}>{task.taskName}</div>
                <div style={styles.meta}>
                  {task.projectName} • {task.status}
                </div>
              </div>
              <span
                style={{
                  ...styles.pill,
                  background: color.bg,
                  color: color.text,
                }}
              >
                {task.status}
              </span>
            </div>
          );
        })}

      {/* PM VIEW */}
      {role === "Project Manager" &&
        Object.keys(groupedByProject).map((project) => (
          <div key={project} style={{ marginBottom: 14 }}>
            <div style={styles.project}>{project}</div>
            {groupedByProject[project].map((task) => {
              const color = STATUS_COLORS[task.status];
              return (
                <div key={task.id} style={styles.row}>
                  <span
                    style={{ ...styles.dot, background: color.text }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={styles.task}>{task.taskName}</div>
                    <div style={styles.meta}>{task.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
  },
  title: { marginBottom: 12, fontWeight: 600 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px",
    borderRadius: 8,
    background: "#f9fafb",
    marginBottom: 8,
  },
  dot: { width: 10, height: 10, borderRadius: "50%" },
  task: { fontWeight: 600 },
  meta: { fontSize: 12, color: "#6b7280" },
  pill: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 600,
  },
  project: {
    fontWeight: 700,
    color: "#C62828",
    marginBottom: 6,
  },
};
