import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const RED = "#C62828";

export default function TaskBoardView({
  tasks,
  onStatusChange,
  onEdit, // Add onEdit
  canEdit,
  currentUser,
  userData,
  formatShortDate,
  formatFullDate
}) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredAvatar, setHoveredAvatar] = useState({ id: null, type: null });

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

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (sourceStatus === destStatus) return;

    const movedTaskId = result.draggableId;
    onStatusChange(movedTaskId, destStatus);
  };

  const boardColumns = {
    "To Do": tasks.filter((t) => t.status === "To Do"),
    "In Progress": tasks.filter((t) => t.status === "In Progress"),
    "Review": tasks.filter((t) => t.status === "Review"),
    "Done": tasks.filter((t) => t.status === "Done"),
    "Blocked": tasks.filter((t) => t.status === "Blocked"),
  };

  const styles = {
    board: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "nowrap",
      gap: 12,
      marginTop: 8,
      width: "100%",
      overflowX: "hidden",
      paddingBottom: 6,
      minHeight: "calc(100vh - 300px)",
    },

    column: {
      flex: "1 1 0",               // ❗ critical
      minWidth: 180,               // ↓ was 280
      maxWidth: "none",            // ❗ remove cap
      backgroundColor: "#fff",
      borderRadius: 10,            // ↓ was 12
      padding: 8,                 // ↓ was 16
      boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
      height: "fit-content",
      maxHeight: "calc(100vh - 220px)",
      overflowY: "auto",
    },

    columnTitle: {
      fontSize: 15,         // ↓ was 16
      fontWeight: 700,
      color: RED,
      marginBottom: 12,     // ↓ was 16
      whiteSpace: "nowrap",
      paddingBottom: 8,     // ↓ was 12
      borderBottom: "2px solid #F3F4F6",
    },

    taskCard: {
      borderRadius: 8,       // ↓ was 10
      padding: 10,           // ↓ was 14
      marginBottom: 10,      // ↓ was 12
      boxShadow: "0 3px 8px rgba(15,23,42,0.03)",
      cursor: "grab",
      border: "1px solid",
      position: "relative",
    },

    taskName: {
      fontWeight: 700,
      fontSize: 14,          // ↓ was 15
      marginBottom: 6,
      lineHeight: 1.25,
    },

    taskMeta: {
      fontSize: 12,          // ↓ was 13
      marginBottom: 8,
      opacity: 0.8,
    },

    dateInfo: {
      fontSize: 10,          // ↓ was 11
      marginTop: 4,
    },

    taskFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 12,
      marginTop: 12,
      paddingTop: 12,
      borderTop: "1px solid rgba(0,0,0,0.05)",
    },
    taskCode: {
      color: "#666",
      fontWeight: 500,
      fontSize: 11,
    },
    assignedAvatar: {
      width: 24,             // ↓ was 28
      height: 24,
      fontSize: 10,
      fontWeight: 600,
      border: "2px solid #fff",
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
      cursor: "default",
    },



    emptyColumn: {
      textAlign: "center",
      color: "#999",
      fontSize: 13,
      padding: "40px 20px",
      backgroundColor: "#F9FAFB",
      borderRadius: 8,
      marginTop: 12,
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
      fontSize: 11,
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
  };

  return React.createElement(DragDropContext, { onDragEnd: onDragEnd },
    React.createElement("div", { style: styles.board },
      Object.keys(boardColumns).map((colId) =>
        React.createElement(Droppable, { key: colId, droppableId: colId },
          (provided) => React.createElement("div", {
            ref: provided.innerRef,
            ...provided.droppableProps,
            style: styles.column
          },
            React.createElement("h3", { style: styles.columnTitle },
              colId,
              React.createElement("span", {
                style: {
                  marginLeft: 8,
                  fontSize: 12,
                  color: "#666",
                  fontWeight: "normal",
                  backgroundColor: "#F3F4F6",
                  padding: "2px 8px",
                  borderRadius: 10,
                }
              }, boardColumns[colId].length)
            ),
            React.createElement("div", { style: { minHeight: 20 } },
              boardColumns[colId].map((task, index) => {
                const colors = getStatusColor(task.status);
                const isHovered = hoveredCard === task.id;
                const assignedToUser = userData[task.assignedTo] || { name: task.assignedTo, role: "User", color: "#E6E6E6" };
                const createdByUser = userData[task.createdBy] || { name: task.createdBy, role: "User", color: "#E6E6E6" };

                return React.createElement(Draggable, {
                  key: task.id,
                  draggableId: task.id,
                  index: index
                },
                  (provided, snapshot) => React.createElement("div", {
                    ref: provided.innerRef,
                    ...provided.draggableProps,
                    ...provided.dragHandleProps, // Fixed: Removed the extra curly braces
                    style: {
                      ...styles.taskCard,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                      boxShadow: snapshot.isDragging
                        ? "0 8px 22px rgba(15,23,42,0.12)"
                        : isHovered
                          ? "0 8px 22px rgba(15,23,42,0.10)"
                          : "0 3px 8px rgba(15,23,42,0.03)",
                      transform: snapshot.isDragging
                        ? "scale(1.02)"
                        : isHovered
                          ? "translateY(-6px)"
                          : "translateY(0)",
                      transition: "all 0.18s ease",
                      cursor: canEdit(task) ? "pointer" : "default",
                      ...provided.draggableProps.style,
                    },
                    onDoubleClick: () => canEdit(task) && onEdit && onEdit(task),
                    onMouseEnter: () => setHoveredCard(task.id),
                    onMouseLeave: () => {
                      setHoveredCard(null);
                      setHoveredAvatar({ id: null, type: null });
                    }
                  },
                    React.createElement("h4", { style: styles.taskName }, task.taskName),
                    React.createElement("p", { style: styles.taskMeta },
                      task.moduleName + " • " + task.projectName
                    ),

                    React.createElement("div", { style: styles.dateInfo },
                      "Start: " + formatShortDate(task.startDate),
                      React.createElement("br"),
                      "End: " + formatShortDate(task.endDate)
                    ),

                    React.createElement("div", { style: styles.taskFooter },
                      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                        // Created By Avatar
                        React.createElement("div", { style: { position: "relative" } },
                          React.createElement("div", {
                            style: {
                              ...styles.assignedAvatar,
                              backgroundColor: createdByUser.color || "#E6E6E6",
                            },
                            onMouseEnter: () => setHoveredAvatar({ id: task.id, type: 'creator' }),
                            onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                          }, createdByUser.name.charAt(0)),
                          hoveredAvatar.id === task.id && hoveredAvatar.type === 'creator' &&
                          React.createElement("div", { style: styles.tooltip },
                            `Created by: ${createdByUser.name} (${createdByUser.role})`,
                            React.createElement("div", { style: styles.tooltipArrow })
                          )
                        ),

                        // Assigned To Avatar
                        React.createElement("div", { style: { position: "relative" } },
                          React.createElement("div", {
                            style: {
                              ...styles.assignedAvatar,
                              backgroundColor: assignedToUser.color || "#E6E6E6",
                            },
                            onMouseEnter: () => setHoveredAvatar({ id: task.id, type: 'assigned' }),
                            onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                          }, assignedToUser.name.charAt(0)),
                          hoveredAvatar.id === task.id && hoveredAvatar.type === 'assigned' &&
                          React.createElement("div", { style: styles.tooltip },
                            `Assigned to: ${assignedToUser.name} (${assignedToUser.role})`,
                            React.createElement("div", { style: styles.tooltipArrow })
                          )
                        ),
                      ),
                      React.createElement("span", { style: styles.taskCode }, task.taskCode)
                    )
                  )
                );
              }),
              boardColumns[colId].length === 0 &&
              React.createElement("div", { style: styles.emptyColumn }, "No tasks in this column"),
              provided.placeholder
            )
          )
        )
      )
    )
  );
}