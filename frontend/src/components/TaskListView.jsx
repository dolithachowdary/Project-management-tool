import React, { useState } from "react";
import { Edit2, UserPlus } from "lucide-react";
import Avatar, { AvatarGroup } from "./Avatar";
import { formatStatus } from "../utils/helpers";

const RED = "#C62828";

export default function TaskListView({
  tasks,
  onStatusChange,
  onEdit,
  canEdit,
  userData,
  formatShortDate,
}) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
      case "to do":
        return { bg: "#f3f4f6", text: "#475569", border: "#e2e8f0" };
      case "in_progress":
      case "in progress":
        return { bg: "#fef9c3", text: "#854d0e", border: "#fde047" };
      case "review":
        return { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" };
      case "done":
        return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
      case "blocked":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" };
      default:
        return { bg: "#f3f4f6", text: "#475569", border: "#e2e8f0" };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" };
      case "medium": return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
      case "low": return { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" };
      default: return { bg: "#f3f4f6", text: "#475569", border: "#e2e8f0" };
    }
  };

  const statusOptions = ["To Do", "In Progress", "Review", "Done", "Blocked"];

  const styles = {
    container: { background: "#fff", borderRadius: 20, overflowX: "auto", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
    th: { textAlign: "left", padding: "16px 14px", fontSize: 13, fontWeight: 800, color: "#475569", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe", whiteSpace: "nowrap" },
    tr: { transition: "all 0.2s" },
    td: { padding: "14px", fontSize: 13, color: "#1e293b", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
    taskSerial: { fontWeight: 700, color: "#64748b", cursor: "help" },
    taskName: { fontWeight: 600, color: "#1e293b", fontSize: 14 },
    moduleText: { color: "#64748b", fontSize: 13, fontWeight: 500 },
    projectText: { color: "#64748b", fontSize: 13, fontWeight: 500 },
    badge: { padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid", textTransform: "capitalize", display: "inline-block" },
    select: { border: "1px solid transparent", borderRadius: 10, padding: "6px 12px", fontWeight: 700, cursor: "pointer", outline: "none", fontSize: 11, width: "100%", minWidth: 110 },
    actionBtn: { background: "#fff", border: "1px solid #e2e8f0", color: "#64748b", cursor: "pointer", padding: 8, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
    indicator: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, transition: "height 0.2s" },
  };

  if (tasks.length === 0) return <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>No tasks available.</div>;

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, paddingLeft: 24 }}>Task ID</th>
            <th style={styles.th}>Task Name</th>
            <th style={styles.th}>Module</th>
            <th style={styles.th}>Project</th>
            <th style={styles.th}>Assigned To</th>
            <th style={styles.th}>Collaborators</th>
            <th style={styles.th}>Created By</th>
            <th style={styles.th}>Priority</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Start Date</th>
            <th style={styles.th}>End Date</th>
            <th style={{ ...styles.th, textAlign: "right", paddingRight: 24 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const isHovered = hoveredRow === t.id;
            const sColors = getStatusColor(t.status);
            const pColors = getPriorityColor(t.priority);

            const startDate = t.start_date || t.start_datetime;
            const endDate = t.end_date || t.end_datetime;

            const displaySerial = t.task_serial
              ? String(t.task_serial).padStart(3, "0")
              : (t.task_code?.split('/').pop() || t.taskCode?.split('-').pop() || "000");

            return (
              <tr
                key={t.id}
                style={{ ...styles.tr, background: isHovered ? "#fcfdfe" : "transparent", position: "relative" }}
                onMouseEnter={() => setHoveredRow(t.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td style={{ ...styles.td, paddingLeft: 24, position: "relative" }}>
                  {/* Project Color Indicator moved INSIDE the first cell */}
                  <div style={{
                    ...styles.indicator,
                    background: t.project_color || "#e0e7ff",
                    opacity: isHovered ? 1 : 0.6
                  }} />
                  <span style={styles.taskSerial} title={t.task_code || t.taskCode}>
                    {displaySerial}
                  </span>
                </td>

                <td style={styles.td}>
                  <div style={styles.taskName}>{t.title || t.taskName}</div>
                </td>

                <td style={styles.td}>
                  <div style={styles.moduleText}>{t.module_name || t.moduleName || t.module?.name || "—"}</div>
                </td>

                <td style={styles.td}>
                  <div style={styles.projectText}>{t.project_name || t.projectName || t.project?.name || "—"}</div>
                </td>

                <td style={styles.td}>
                  <Avatar
                    name={t.assignee_name || "Unassigned"}
                    id={t.assignee_id}
                    size={28}
                  />
                </td>

                <td style={styles.td}>
                  <AvatarGroup
                    members={(t.collaborators || []).map(c => ({
                      id: c.id || c.user_id || c,
                      name: c.name || c.full_name || "Collab"
                    }))}
                    size={24}
                    max={2}
                  />
                </td>

                <td style={styles.td}>
                  <Avatar
                    name={t.created_by_name || "System"}
                    id={t.created_by}
                    size={28}
                  />
                </td>

                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: pColors.bg, color: pColors.text, borderColor: pColors.border }}>
                    {t.priority || "Medium"}
                  </span>
                </td>

                <td style={styles.td}>
                  <select
                    value={formatStatus(t.status)}
                    onChange={(e) => onStatusChange(t.id, e.target.value)}
                    style={{ ...styles.select, background: sColors.bg, color: sColors.text }}
                  >
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>

                <td style={styles.td}>
                  <span style={{ color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>{formatShortDate(startDate) || "—"}</span>
                </td>

                <td style={styles.td}>
                  <span style={{ color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>{formatShortDate(endDate) || "—"}</span>
                </td>

                <td style={{ ...styles.td, paddingRight: 24 }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      style={{ ...styles.actionBtn, borderColor: isHovered ? RED : "#e2e8f0" }}
                      onClick={() => onEdit && onEdit(t)}
                      disabled={!canEdit(t)}
                    >
                      <Edit2 size={14} color={isHovered ? RED : "#64748b"} />
                    </button>
                    <button style={styles.actionBtn}>
                      <UserPlus size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}