import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import Avatar, { AvatarGroup } from "./Avatar";
import { formatStatus } from "../utils/helpers";
import PriorityBadge from "./PriorityBadge";
import { getStatusStyles } from "./StatusBadge";

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



  const statusOptions = ["To Do", "In Progress", "Review", "Done", "Blocked"];

  const styles = {
    container: { background: "#fff", borderRadius: 20, overflowX: "auto", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
    th: { textAlign: "left", padding: "16px 14px", fontSize: 13, fontWeight: 800, color: "#475569", borderBottom: "1px solid #f1f5f9", background: "#fcfdfe", whiteSpace: "nowrap" },
    tr: { transition: "all 0.2s" },
    td: { padding: "14px", fontSize: 13, color: "#1e293b", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", whiteSpace: "nowrap" },
    taskSerial: { fontWeight: 700, color: "#64748b", cursor: "help" },
    taskName: { fontWeight: 600, color: "#1e293b", fontSize: 14 },
    moduleText: { color: "#64748b", fontSize: 13, fontWeight: 500 },
    projectText: { color: "#64748b", fontSize: 13, fontWeight: 500 },
    badge: { padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid", textTransform: "capitalize", display: "inline-block" },
    select: { border: "1px solid transparent", borderRadius: 10, padding: "6px 12px", fontWeight: 700, cursor: "pointer", outline: "none", fontSize: 11, width: "100%", minWidth: 110 },
    actionBtn: { background: "none", border: "1px solid transparent", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
    indicator: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, transition: "height 0.2s" },
  };

  if (tasks.length === 0) return <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>No tasks available.</div>;

  return (
    <div style={styles.container} className="hide-scrollbar">
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, paddingLeft: 24 }}>Task ID</th>
            <th style={styles.th}>Task Name</th>
            <th style={styles.th}>Module</th>
            <th style={styles.th}>Project</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Assigned To</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Collaborators</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Created By</th>
            <th style={styles.th}>Priority</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Start Date</th>
            <th style={styles.th}>End Date</th>
            <th style={{ ...styles.th, textAlign: "right", paddingRight: 24 }}></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const isHovered = hoveredRow === t.id;
            const sColors = getStatusStyles(t.status);

            const startDate = t.start_date || t.start_datetime;
            const endDate = t.end_date || t.end_datetime;

            // Show full ID e.g. "PRJ-123"
            const displaySerial = t.task_code || t.taskCode || t.id;

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
                  <span style={styles.taskSerial} title={displaySerial}>
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

                <td style={{ ...styles.td, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Avatar
                      name={t.assignee_name || "Unassigned"}
                      id={t.assignee_id}
                      size={28}
                    />
                  </div>
                </td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <AvatarGroup
                      members={(t.collaborators || []).map(c => ({
                        id: c.id || c.user_id || c,
                        name: c.name || c.full_name || "Collab"
                      }))}
                      size={24}
                      max={2}
                    />
                  </div>
                </td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Avatar
                      name={t.created_by_name || "System"}
                      id={t.created_by}
                      size={28}
                    />
                  </div>
                </td>

                <td style={styles.td}>
                  <PriorityBadge priority={t.priority} />
                </td>

                <td style={styles.td}>
                  <select
                    value={formatStatus(t.status)}
                    onChange={(e) => onStatusChange(t.id, e.target.value)}
                    style={{
                      ...styles.select,
                      backgroundColor: sColors.backgroundColor,
                      color: sColors.color,
                      borderColor: sColors.borderColor
                    }}
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
                      style={{ ...styles.actionBtn, borderColor: isHovered ? RED : "transparent" }}
                      onClick={() => onEdit && onEdit(t)}
                      disabled={!canEdit(t)}
                      title="Edit Task"
                    >
                      <Edit2 size={12} color={isHovered ? RED : "#64748b"} />
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