import React, { useState } from "react";

const RED = "#C62828";

export default function TaskListView({ 
  tasks, 
  onStatusChange, 
  canEdit, 
  currentUser, 
  userData, 
  formatShortDate, 
  formatFullDate 
}) {
  // Remove hoveredRow since it's not used
  const [hoveredAvatar, setHoveredAvatar] = useState({ id: null, type: null });
  const [hoveredDate, setHoveredDate] = useState({ id: null, field: null });

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" };
      case "In Progress":
        return { bg: "#FFF8E1", text: "#856404", border: "#FFECB3" };
      case "Review":
        return { bg: "#E8EAF6", text: "#2E3A59", border: "#C5CAE9" };
      case "Done":
        return { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" };
      case "Blocked":
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

  const statusesForSelect = ["To Do", "In Progress", "Review", "Done", "Blocked"];

  const styles = {
    tableContainer: {
      backgroundColor: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
      padding: "20px",
    },
    table: { 
      width: "100%", 
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      padding: "16px 12px",
      color: "#111827",
      fontWeight: 600,
      fontSize: 13,
      borderBottom: "2px solid #EEF2F7",
      background: "transparent",
      whiteSpace: "nowrap",
    },
    tableRow: {
      background: "#fff",
      transition: "all 180ms ease",
      borderBottom: "1px solid #F3F4F6",
      ":hover": {
        backgroundColor: "#F9FAFB",
      }
    },
    td: {
      padding: "16px 12px",
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
      ":hover": {
        transform: "scale(1.1)",
        zIndex: 10,
      }
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
      ":focus": {
        boxShadow: "0 0 0 2px rgba(198, 40, 40, 0.1)",
      }
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
      ":hover:not(:disabled)": {
        backgroundColor: "#F9FAFB",
        borderColor: "#D1D5DB",
      },
      ":disabled": {
        opacity: 0.4,
        cursor: "not-allowed",
      }
    },
    emptyState: {
      padding: "60px 20px",
      textAlign: "center",
      color: "#666",
      fontSize: 14,
      backgroundColor: "#F9FAFB",
      borderRadius: 8,
    },
    
    // Tooltip styles
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
    
    // Date cell with tooltip
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
            const createdByUser = userData[task.createdBy] || { name: task.createdBy, role: "User", color: "#E6E6E6" };
            const assignedToUser = userData[task.assignedTo] || { name: task.assignedTo, role: "User", color: "#E6E6E6" };
            
            return React.createElement("tr", {
              key: task.id,
              style: styles.tableRow,
              onMouseLeave: () => {
                setHoveredAvatar({ id: null, type: null });
                setHoveredDate({ id: null, field: null });
              }
            },
              React.createElement("td", { style: styles.td }, task.taskCode),
              React.createElement("td", { style: { ...styles.td, fontWeight: 600 } }, task.taskName),
              React.createElement("td", { style: styles.td }, task.moduleName),
              React.createElement("td", { style: styles.td }, task.projectName),
              
              // Assigned To with tooltip
              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: styles.avatarContainer },
                  React.createElement("div", {
                    style: {
                      ...styles.avatar,
                      backgroundColor: assignedToUser.color || "#E6E6E6",
                    },
                    onMouseEnter: () => setHoveredAvatar({ id: task.id, type: 'assigned' }),
                    onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                  }, assignedToUser.name.charAt(0)),
                  hoveredAvatar.id === task.id && hoveredAvatar.type === 'assigned' &&
                    React.createElement("div", { style: styles.tooltip },
                      `${assignedToUser.name} (${assignedToUser.role})`,
                      React.createElement("div", { style: styles.tooltipArrow })
                    )
                )
              ),
              
              // Collaborators
              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: styles.userAvatars },
                  task.collaborators.slice(0, 3).map((collab, i) => {
                    const collabUser = userData[collab] || { name: collab, role: "User", color: "#E6E6E6" };
                    return React.createElement("div", { 
                      key: i, 
                      style: { 
                        ...styles.avatarContainer,
                        zIndex: 10 - i
                      }
                    },
                      React.createElement("div", {
                        style: {
                          ...styles.avatar,
                          backgroundColor: collabUser.color || "#E6E6E6",
                          marginLeft: i === 0 ? 0 : -8,
                        },
                        onMouseEnter: () => setHoveredAvatar({ id: task.id, type: `collab-${i}` }),
                        onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                      }, collabUser.name.charAt(0)),
                      hoveredAvatar.id === task.id && hoveredAvatar.type === `collab-${i}` &&
                        React.createElement("div", { style: styles.tooltip },
                          `${collabUser.name} (${collabUser.role})`,
                          React.createElement("div", { style: styles.tooltipArrow })
                        )
                    );
                  }),
                  task.collaborators.length > 3 && 
                    React.createElement("div", { style: styles.plusAvatar }, "+" + (task.collaborators.length - 3))
                )
              ),
              
              // Created By with tooltip
              React.createElement("td", { style: styles.td },
                React.createElement("div", { style: styles.avatarContainer },
                  React.createElement("div", {
                    style: {
                      ...styles.avatar,
                      backgroundColor: createdByUser.color || "#E6E6E6",
                      marginLeft: 0,
                    },
                    onMouseEnter: () => setHoveredAvatar({ id: task.id, type: 'creator' }),
                    onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                  }, createdByUser.name.charAt(0)),
                  hoveredAvatar.id === task.id && hoveredAvatar.type === 'creator' &&
                    React.createElement("div", { style: styles.tooltip },
                      `${createdByUser.name} (${createdByUser.role})`,
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
                }, task.priority)
              ),
              
              React.createElement("td", { style: styles.td },
                React.createElement("select", {
                  value: task.status,
                  onChange: (e) => onStatusChange(task.id, e.target.value),
                  style: {
                    ...styles.statusDropdown,
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    border: `1px solid ${statusColors.border}`
                  }
                },
                  statusesForSelect.map((s) =>
                    React.createElement("option", { key: s, value: s }, s)
                  )
                )
              ),
              
              // Start Date with tooltip
              React.createElement("td", { 
                style: styles.td 
              },
                React.createElement("div", { 
                  style: styles.dateCell,
                  onMouseEnter: () => setHoveredDate({ id: task.id, field: 'start' }),
                  onMouseLeave: () => setHoveredDate({ id: null, field: null })
                },
                  formatShortDate(task.startDate),
                  hoveredDate.id === task.id && hoveredDate.field === 'start' &&
                    React.createElement("div", { style: styles.dateTooltip },
                      formatFullDate(task.startDate)
                    )
                )
              ),
              
              // End Date with tooltip
              React.createElement("td", { 
                style: styles.td 
              },
                React.createElement("div", { 
                  style: styles.dateCell,
                  onMouseEnter: () => setHoveredDate({ id: task.id, field: 'end' }),
                  onMouseLeave: () => setHoveredDate({ id: null, field: null })
                },
                  formatShortDate(task.endDate),
                  hoveredDate.id === task.id && hoveredDate.field === 'end' &&
                    React.createElement("div", { style: styles.dateTooltip },
                      formatFullDate(task.endDate)
                    )
                )
              ),
              
              React.createElement("td", { style: styles.td },
                React.createElement("button", {
                  style: {
                    ...styles.editBtn,
                    opacity: canEdit(task) ? 1 : 0.4
                  },
                  disabled: !canEdit(task)
                }, "Edit")
              )
            );
          })
        )
      )
    )
  );
}