import React from "react";
import { CircleCheckBig, Circle, CircleMinus, Info } from "lucide-react";

/* SAME COLORS AS Tasks.js */
const STATUS_COLORS = {
  "To Do": { bg: "#E3F2FD", text: "#1565C0" },
  "In Progress": { bg: "#FFF8E1", text: "#856404" },
  Review: { bg: "#E8EAF6", text: "#2E3A59" },
  Done: { bg: "#E8F5E9", text: "#2E7D32" },
  Blocked: { bg: "#FCE4EC", text: "#8B1E3F" },
  "todo": { bg: "#E3F2FD", text: "#1565C0" },
  "in_progress": { bg: "#FFF8E1", text: "#856404" },
  "review": { bg: "#E8EAF6", text: "#2E3A59" },
  "done": { bg: "#E8F5E9", text: "#2E7D32" },
  "blocked": { bg: "#FCE4EC", text: "#8B1E3F" },
};

const STATUS_LABELS = {
  "todo": "To Do",
  "in_progress": "In Progress",
  "review": "Review",
  "done": "Done",
  "blocked": "Blocked"
};

const getStatusLabel = (s) => STATUS_LABELS[s] || s;

const getStatusIcon = (status) => {
  const s = status?.toLowerCase();
  if (s === "done" || s === "completed") return <CircleCheckBig size={16} color="#10b981" />;
  if (s === "in_progress" || s === "review") return <CircleMinus size={16} color="#f59e0b" />;
  return <Circle size={16} color="#94a3b8" />;
};

const DEV_ORDER = {
  "In Progress": 1,
  "in_progress": 1,
  "To Do": 2,
  "todo": 2,
  Review: 3,
  review: 3,
  Blocked: 4,
  blocked: 4,
  Done: 5,
  done: 5,
};

export default function TaskOverviewList({
  tasks = [],
  role,
  currentUserId,
  currentUser = "A",
}) {
  const filtered =
    role === "Developer"
      ? tasks.filter((t) => {
        const assignedId = t.assignee_id || t.assigned_to_id || t.assignedTo;
        if (Array.isArray(assignedId)) return assignedId.includes(currentUserId) || assignedId.includes(currentUser);
        if (typeof assignedId === 'object' && assignedId !== null) return assignedId.id === currentUserId || assignedId.name === currentUser;
        return assignedId === currentUserId || assignedId === currentUser;
      })
      : tasks.filter(t => (t.status || "").toLowerCase() !== "done"); // Remove completed team tasks

  const sorted = [...filtered].sort(
    (a, b) => (DEV_ORDER[a.status] || 99) - (DEV_ORDER[b.status] || 99)
  );

  const groupedByProject =
    role === "Project Manager" || role === "admin"
      ? sorted.reduce((acc, t) => {
        const pName = t.project_name || t.projectName || "General";
        acc[pName] = acc[pName] || [];
        acc[pName].push(t);
        return acc;
      }, {})
      : null;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>
        {role === "Developer" ? "Today’s Tasks" : "Team Tasks"}
      </h3>

      <div style={styles.scrollArea}>
        {sorted.length === 0 && <div style={styles.empty}>No active tasks found.</div>}

        {/* DEV VIEW */}
        {role === "Developer" &&
          sorted.map((task) => {
            const color = STATUS_COLORS[task.status] || STATUS_COLORS["To Do"];
            return (
              <div key={task.id} style={styles.row}>
                {getStatusIcon(task.status)}
                <div style={{ flex: 1 }}>
                  <div style={styles.task}>{task.title || task.taskName}</div>
                  <div style={styles.meta}>
                    {task.project_name || task.projectName} • {getStatusLabel(task.status)}
                  </div>
                </div>
                <span
                  style={{
                    ...styles.pill,
                    background: color.bg,
                    color: color.text,
                  }}
                >
                  {getStatusLabel(task.status)}
                </span>
              </div>
            );
          })}

        {/* PM VIEW */}
        {(role === "Project Manager" || role === "admin") && groupedByProject &&
          Object.keys(groupedByProject).map((project) => (
            <div key={project} style={{ marginBottom: 14 }}>
              <div style={styles.project}>{project}</div>
              {groupedByProject[project].map((task) => {
                return (
                  <div key={task.id} style={styles.row}>
                    {getStatusIcon(task.status)}
                    <div style={{ flex: 1 }}>
                      <div style={styles.task}>{task.title || task.taskName}</div>
                      <div style={styles.meta}>{getStatusLabel(task.status)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: 500,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  title: { marginBottom: 16, fontWeight: 700, fontSize: 16, color: "#1e293b" },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 4,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px",
    borderRadius: 12,
    background: "#f8fafc",
    marginBottom: 8,
    transition: "background 0.2s",
  },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  task: { fontWeight: 600, fontSize: 13, color: "#334155" },
  meta: { fontSize: 11, color: "#64748b", marginTop: 2 },
  pill: {
    fontSize: 10,
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  project: {
    fontWeight: 700,
    color: "#6366f1",
    fontSize: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  empty: {
    padding: 20,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
  }
};
