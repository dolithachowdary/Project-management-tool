import React, { useState } from "react";
import { Edit2, UserPlus } from "lucide-react";
import Avatar from "./Avatar";
import { formatStatus } from "../utils/helpers";

const RED = "#C62828";

export default function TaskListView({
  tasks,
  onStatusChange,
  onEdit,
  canEdit,
  currentUser,
  userData,
  formatShortDate,
  formatFullDate
}) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredAvatar, setHoveredAvatar] = useState({ id: null, type: null });
  const [hoveredDate, setHoveredDate] = useState({ id: null, field: null });

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
      case "todo":
        return { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" };
      case "In Progress":
      case "in_progress":
        return { bg: "#FFF8E1", text: "#856404", border: "#FFECB3" };
      case "Review":
      case "review":
        return { bg: "#E8EAF6", text: "#2E3A59", border: "#C5CAE9" };
      case "Done":
      case "done":
        return { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" };
      case "Blocked":
      case "blocked":
        return { bg: "#FCE4EC", text: "#8B1E3F", border: "#F8BBD0" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return { bg: "#FFE5E5", text: RED, border: "#FECACA" };
      case "Medium":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
      case "Low":
        return { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
    }
  };

  const statusesForSelect = [
    { label: "To Do", value: "To Do" },
    { label: "In Progress", value: "In Progress" },
    { label: "Review", value: "Review" },
    { label: "Done", value: "Done" },
    { label: "Blocked", value: "Blocked" }
  ];

  const styles = {
    tableContainer: {
      backgroundColor: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
      padding: "12px 14px",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 10px"
    },
    th: {
      textAlign: "left",
      padding: "10px 12px",
      color: "#111827",
      fontWeight: 700,
      fontSize: 13,
      borderBottom: "1px solid #EEF2F7",
      background: "transparent",
      whiteSpace: "nowrap",
    },
    tableRow: {
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 4px 8px rgba(15,23,42,0.03)",
      transition: "all 180ms ease",
    },
    td: {
      padding: "10px 12px",
      color: "#374151",
      fontSize: 14,
      verticalAlign: "middle",
    },
    userAvatars: {
      display: "flex",
      alignItems: "center",
      position: "relative",
    },
    avatarContainer: {
      position: "relative",
      display: "inline-block",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      color: "#374151",
      border: "3px solid #fff",
      cursor: "pointer",
      transition: "transform 0.2s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginLeft: -8,
    },
    plusAvatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      backgroundColor: "#fff",
      color: "#374151",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      border: "2px solid #E2E8F0",
      marginLeft: -8,
    },
    statusDropdown: {
      border: "none",
      borderRadius: 8,
      padding: "8px 12px",
      fontWeight: 600,
      cursor: "pointer",
      minWidth: 130,
      outline: "none",
      transition: "all 0.2s",
    },
    priorityBadge: {
      padding: "6px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      display: "inline-block",
      border: "1px solid",
    },
    editBtn: {
      padding: "8px 16px",
      borderRadius: 8,
      border: "1px solid #E6E9EE",
      background: "#fff",
      color: "#374151",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      transition: "all 0.2s",
    },
    emptyState: {
      padding: "60px 20px",
      textAlign: "center",
      color: "#666",
      fontSize: 14,
      backgroundColor: "#F9FAFB",
      borderRadius: 8,
    },
    tooltip: {
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#1F2937",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: "nowrap",
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      marginBottom: "8px",
      pointerEvents: "none",
    },
    tooltipArrow: {
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      borderTop: "6px solid #1F2937",
    },
    dateCell: {
      position: "relative",
      cursor: "pointer",
    },
    dateTooltip: {
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#1F2937",
      color: "#fff",
      padding: "6px 10px",
      borderRadius: 4,
      fontSize: 11,
      whiteSpace: "nowrap",
      zIndex: 1000,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      marginBottom: "6px",
    },
  };

  if (tasks.length === 0) {
    return React.createElement("div", { style: styles.tableContainer },
      React.createElement("div", { style: styles.emptyState },
        "No tasks found matching your filters."
      )
    );
  }

  return React.createElement("div", { style: styles.tableContainer },
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Task ID"),
            React.createElement("th", { style: styles.th }, "Task Name"),
            React.createElement("th", { style: styles.th }, "Module"),
            React.createElement("th", { style: styles.th }, "Project"),
            React.createElement("th", { style: styles.th }, "Assigned To"),
            React.createElement("th", { style: styles.th }, "Collaborators"),
            React.createElement("th", { style: styles.th }, "Created By"),
            React.createElement("th", { style: styles.th }, "Priority"),
            React.createElement("th", { style: styles.th }, "Status"),
            React.createElement("th", { style: styles.th }, "Start Date"),
            React.createElement("th", { style: styles.th }, "End Date"),
            React.createElement("th", { style: styles.th }, "Actions")
          )
        ),
        React.createElement("tbody", null,
          tasks.map((task) => {
            const statusColors = getStatusColor(task.status);
            const priorityColors = getPriorityColor(task.priority);

            // Fixed user lookup with fallback to names in task object
            const createdById = task.created_by?.id || task.created_by?._id || task.created_by || task.createdBy;
            const createdByUser = userData[createdById] || {
              name: task.created_by_name || task.created_by?.full_name || task.created_by?.name || (typeof createdById === 'string' ? createdById : "Unknown"),
              role: task.created_by?.role || "User",
              color: task.created_by?.color || "#E6E6E6",
              avatar_url: task.created_by?.avatar_url
            };

            const assignedToId = task.assignee_id?.id || task.assignee_id?._id || task.assignee_id || task.assignedTo;
            const assignedToUser = userData[assignedToId] || {
              name: task.assignee_name || task.assignee_id?.full_name || task.assignee_id?.name || task.assignedTo?.full_name || task.assignedTo?.name || (typeof assignedToId === 'string' ? assignedToId : "Unassigned"),
              role: task.assignee_id?.role || task.assignedTo?.role || "User",
              color: task.assignee_id?.color || task.assignedTo?.color || "#E6E6E6",
              avatar_url: task.assignee_id?.avatar_url || task.assignedTo?.avatar_url
            };
            const isHovered = hoveredRow === task.id;

            return React.createElement("tr", {
              key: task.id,
              style: {
                ...styles.tableRow,
                boxShadow: isHovered ? "0 6px 18px rgba(15,23,42,0.08)" : "0 4px 8px rgba(15,23,42,0.03)",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
              },
              onMouseEnter: () => setHoveredRow(task.id),
              onMouseLeave: () => {
                setHoveredRow(null);
                setHoveredAvatar({ id: null, type: null });
                setHoveredDate({ id: null, field: null });
              }
            },
              React.createElement("td", { style: styles.td }, task.task_code || task.taskCode),
              React.createElement("td", { style: { ...styles.td, fontWeight: 600 } }, task.title || task.taskName),
              React.createElement("td", { style: styles.td }, task.module_name || task.moduleName),
              React.createElement("td", { style: styles.td }, task.project_name || task.projectName),

              // Assigned To
              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: styles.avatarContainer },
                  React.createElement(Avatar, {
                    name: assignedToUser.name || "Unassigned",
                    size: 36,
                    style: { marginLeft: -8, backgroundImage: assignedToUser.avatar_url ? `url(${assignedToUser.avatar_url})` : "none" },
                    onMouseEnter: () => setHoveredAvatar({ id: task.id, type: 'assigned' }),
                    onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                  }),
                  hoveredAvatar.id === task.id && hoveredAvatar.type === 'assigned' &&
                  React.createElement("div", { style: styles.tooltip },
                    `${assignedToUser.name || "Unassigned"} (${assignedToUser.role})`,
                    React.createElement("div", { style: styles.tooltipArrow })
                  )
                )
              ),

              // Collaborators
              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: styles.userAvatars },
                  (task.collaborators || []).slice(0, 3).map((collab, i) => {
                    const collabId = collab?.id || collab?._id || (typeof collab === 'string' ? collab : null);
                    const collabUser = userData[collabId] || {
                      name: collab?.full_name || collab?.name || (typeof collab === 'string' ? collab : "Collaborator"),
                      role: collab?.role || "User",
                      color: collab?.color || "#E6E6E6",
                      avatar_url: collab?.avatar_url
                    };
                    return React.createElement("div", { key: i, style: { ...styles.avatarContainer, zIndex: 10 - i } },
                      React.createElement(Avatar, {
                        name: collabUser.name,
                        size: 36,
                        style: { marginLeft: i === 0 ? 0 : -8, backgroundImage: collabUser.avatar_url ? `url(${collabUser.avatar_url})` : "none" },
                        onMouseEnter: () => setHoveredAvatar({ id: task.id, type: `collab-${i}` }),
                        onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                      }),
                      hoveredAvatar.id === task.id && hoveredAvatar.type === `collab-${i}` &&
                      React.createElement("div", { style: styles.tooltip },
                        `${collabUser.name} (${collabUser.role})`,
                        React.createElement("div", { style: styles.tooltipArrow })
                      )
                    );
                  }),
                  (task.collaborators || []).length > 3 &&
                  React.createElement("div", { style: styles.plusAvatar }, "+" + (task.collaborators.length - 3))
                )
              ),

              // Created By
              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: styles.avatarContainer },
                  React.createElement(Avatar, {
                    name: createdByUser.name || "Unknown",
                    size: 36,
                    style: { marginLeft: 0, backgroundImage: createdByUser.avatar_url ? `url(${createdByUser.avatar_url})` : "none" },
                    onMouseEnter: () => setHoveredAvatar({ id: task.id, type: 'creator' }),
                    onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                  }),
                  hoveredAvatar.id === task.id && hoveredAvatar.type === 'creator' &&
                  React.createElement("div", { style: styles.tooltip },
                    `${createdByUser.name || "Unknown"} (${createdByUser.role})`,
                    React.createElement("div", { style: styles.tooltipArrow })
                  )
                )
              ),

              React.createElement("td", { style: styles.td },
                React.createElement("span", {
                  style: {
                    ...styles.priorityBadge,
                    backgroundColor: priorityColors.bg,
                    color: priorityColors.text,
                    borderColor: priorityColors.border
                  }
                }, task.priority || task.Priority || "Medium")
              ),

              React.createElement("td", { style: styles.td },
                React.createElement("select", {
                  value: formatStatus(task.status),
                  onChange: (e) => onStatusChange(task.id, e.target.value),
                  style: {
                    ...styles.statusDropdown,
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    border: `1px solid ${statusColors.border}`
                  }
                },
                  statusesForSelect.map((s) =>
                    React.createElement("option", { key: s.value, value: s.value }, s.label)
                  )
                )
              ),

              React.createElement("td", { style: styles.td },
                React.createElement("div", {
                  style: styles.dateCell,
                  onMouseEnter: () => setHoveredDate({ id: task.id, field: 'start' }),
                  onMouseLeave: () => setHoveredDate({ id: null, field: null })
                },
                  formatShortDate(task.start_date || task.startDate),
                  hoveredDate.id === task.id && hoveredDate.field === 'start' &&
                  React.createElement("div", { style: styles.dateTooltip },
                    formatFullDate(task.start_date || task.startDate)
                  )
                )
              ),

              React.createElement("td", { style: styles.td },
                React.createElement("div", {
                  style: styles.dateCell,
                  onMouseEnter: () => setHoveredDate({ id: task.id, field: 'end' }),
                  onMouseLeave: () => setHoveredDate({ id: null, field: null })
                },
                  formatShortDate(task.end_date || task.endDate),
                  hoveredDate.id === task.id && hoveredDate.field === 'end' &&
                  React.createElement("div", { style: styles.dateTooltip },
                    formatFullDate(task.end_date || task.endDate)
                  )
                )
              ),

              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: { display: "flex", gap: 8 } },
                  React.createElement("button", {
                    style: { ...styles.editBtn, padding: "6px 10px", opacity: canEdit(task) ? 1 : 0.4 },
                    disabled: !canEdit(task),
                    onClick: () => onEdit && onEdit(task),
                    title: "Edit Task"
                  }, React.createElement(Edit2, { size: 16 })),
                  React.createElement("button", {
                    style: { ...styles.editBtn, padding: "6px 10px" },
                    onClick: () => onEdit && onEdit({ ...task, _addCollaborators: true }),
                    title: "Add Collaborators"
                  }, React.createElement(UserPlus, { size: 16 }))
                )
              )
            );
          })
        )
      )
    )
  );
}