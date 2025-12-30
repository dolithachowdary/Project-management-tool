import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const RED = "#C62828";

export default function TaskBoardView({
  tasks,
  onStatusChange,
  onEdit,
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
    "To Do": tasks.filter((t) => t.status === "To Do" || t.status === "todo"),
    "In Progress": tasks.filter((t) => t.status === "In Progress" || t.status === "in_progress"),
    "Review": tasks.filter((t) => t.status === "Review" || t.status === "review"),
    "Done": tasks.filter((t) => t.status === "Done" || t.status === "done"),
    "Blocked": tasks.filter((t) => t.status === "Blocked" || t.status === "blocked"),
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
      overflowX: "auto",
      paddingBottom: 6,
      minHeight: "calc(100vh - 300px)",
    },
    column: {
      flex: "1 0 280px",
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 12,
      boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
      height: "fit-content",
      maxHeight: "calc(100vh - 220px)",
      overflowY: "auto",
    },
    columnTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: RED,
      marginBottom: 12,
      whiteSpace: "nowrap",
      paddingBottom: 8,
      borderBottom: "2px solid #F3F4F6",
    },
    taskCard: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      boxShadow: "0 3px 8px rgba(15,23,42,0.03)",
      cursor: "grab",
      border: "1px solid",
      position: "relative",
      backgroundColor: "#fff",
    },
    taskName: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 6,
      lineHeight: 1.25,
    },
    taskMeta: {
      fontSize: 12,
      marginBottom: 8,
      opacity: 0.8,
    },
    dateInfo: {
      fontSize: 11,
      marginTop: 4,
      color: "#666",
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
    avatar: {
      width: 26,
      height: 26,
      fontSize: 10,
      fontWeight: 600,
      border: "2px solid #fff",
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
      cursor: "pointer",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
                  fontSize: 11,
                  color: "#666",
                  fontWeight: "normal",
                  backgroundColor: "#F3F4F6",
                  padding: "2px 6px",
                  borderRadius: 10,
                }
              }, boardColumns[colId].length)
            ),
            React.createElement("div", { style: { minHeight: 40 } },
              boardColumns[colId].map((task, index) => {
                const colors = getStatusColor(task.status);
                const isHovered = hoveredCard === (task.id || task._id);

                // Fixed user lookup with fallbacks
                const assignedToUser = userData[task.assignee_id || task.assignedTo] || {
                  name: task.assignee_name || task.assignedTo || task.assignee_id || "Unassigned",
                  role: "User",
                  color: "#E6E6E6"
                };
                const createdByUser = userData[task.created_by || task.createdBy] || {
                  name: task.created_by_name || task.createdBy || task.created_by || "Unknown",
                  role: "User",
                  color: "#E6E6E6"
                };

                return React.createElement(Draggable, {
                  key: task.id || task._id,
                  draggableId: String(task.id || task._id),
                  index: index
                },
                  (provided, snapshot) => React.createElement("div", {
                    ref: provided.innerRef,
                    ...provided.draggableProps,
                    ...provided.dragHandleProps,
                    style: {
                      ...styles.taskCard,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                      boxShadow: snapshot.isDragging
                        ? "0 10px 25px rgba(15,23,42,0.15)"
                        : isHovered
                          ? "0 8px 20px rgba(15,23,42,0.08)"
                          : "0 3px 8px rgba(15,23,42,0.03)",
                      transform: snapshot.isDragging
                        ? "scale(1.03)"
                        : isHovered
                          ? "translateY(-4px)"
                          : "translateY(0)",
                      transition: "all 0.2s ease",
                      cursor: canEdit(task) ? "pointer" : "default",
                      ...provided.draggableProps.style,
                    },
                    onClick: () => canEdit(task) && onEdit && onEdit(task),
                    onMouseEnter: () => setHoveredCard(task.id || task._id),
                    onMouseLeave: () => {
                      setHoveredCard(null);
                      setHoveredAvatar({ id: null, type: null });
                    }
                  },
                    React.createElement("h4", { style: styles.taskName }, task.title || task.taskName),
                    React.createElement("p", { style: styles.taskMeta },
                      (task.module_name || task.moduleName || "No Module") + " • " + (task.project_name || task.projectName || "No Project")
                    ),

                    React.createElement("div", { style: styles.dateInfo },
                      "S: " + formatShortDate(task.start_date || task.startDate) + " | E: " + formatShortDate(task.end_date || task.endDate)
                    ),

                    React.createElement("div", { style: styles.taskFooter },
                      React.createElement("div", { style: { display: "flex", gap: 6 } },
                        // Creator
                        React.createElement("div", { style: { position: "relative" } },
                          React.createElement("div", {
                            style: {
                              ...styles.avatar,
                              backgroundColor: createdByUser.color || "#888",
                              backgroundImage: createdByUser.avatar_url ? `url(${createdByUser.avatar_url})` : "none",
                              backgroundSize: "cover"
                            },
                            onMouseEnter: () => setHoveredAvatar({ id: task.id || task._id, type: "creator" }),
                            onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                          }, !createdByUser.avatar_url && (createdByUser.name || "?").charAt(0)),
                          hoveredAvatar.id === (task.id || task._id) && hoveredAvatar.type === "creator" &&
                          React.createElement("div", { style: styles.tooltip },
                            `By: ${createdByUser.name}`,
                            React.createElement("div", { style: styles.tooltipArrow })
                          )
                        ),
                        // Assignee
                        React.createElement("div", { style: { position: "relative" } },
                          React.createElement("div", {
                            style: {
                              ...styles.avatar,
                              backgroundColor: assignedToUser.color || "#777",
                              backgroundImage: assignedToUser.avatar_url ? `url(${assignedToUser.avatar_url})` : "none",
                              backgroundSize: "cover"
                            },
                            onMouseEnter: () => setHoveredAvatar({ id: task.id || task._id, type: "assigned" }),
                            onMouseLeave: () => setHoveredAvatar({ id: null, type: null })
                          }, !assignedToUser.avatar_url && (assignedToUser.name || "?").charAt(0)),
                          hoveredAvatar.id === (task.id || task._id) && hoveredAvatar.type === "assigned" &&
                          React.createElement("div", { style: styles.tooltip },
                            `To: ${assignedToUser.name}`,
                            React.createElement("div", { style: styles.tooltipArrow })
                          )
                        )
                      ),
                      React.createElement("span", { style: styles.taskCode }, task.task_code || task.taskCode)
                    )
                  )
                );
              }),
              boardColumns[colId].length === 0 &&
              React.createElement("div", { style: styles.emptyColumn }, "No tasks"),
              provided.placeholder
            )
          )
        )
      )
    )
  );
}