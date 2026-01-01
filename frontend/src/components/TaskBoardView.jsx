import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AvatarGroup } from "./Avatar";
import { formatStatus, toApiStatus } from "../utils/helpers";

export default function TaskBoardView({
  tasks,
  onStatusChange,
  onEdit,
  canEdit,
  formatShortDate,
}) {

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "to do":
      case "todo":
        return {
          accent: "#3b82f6",
          bg: "#eff6ff",
          title: "#2563eb",
          meta: "#60a5fa",
          border: "#dbeafe"
        };
      case "in progress":
      case "in_progress":
        return {
          accent: "#ca8a04",
          bg: "#fefce8",
          title: "#a16207",
          meta: "#eab308",
          border: "#fef9c3"
        };
      case "review":
        return {
          accent: "#7c3aed",
          bg: "#f5f3ff",
          title: "#6d28d9",
          meta: "#a78bfa",
          border: "#ede9fe"
        };
      case "done":
        return {
          accent: "#16a34a",
          bg: "#f0fdf4",
          title: "#15803d",
          meta: "#4ade80",
          border: "#dcfce7"
        };
      case "blocked":
        return {
          accent: "#dc2626",
          bg: "#fef2f2",
          title: "#b91c1c",
          meta: "#f87171",
          border: "#fee2e2"
        };
      default:
        return {
          accent: "#64748b",
          bg: "#f8fafc",
          title: "#475569",
          meta: "#94a3b8",
          border: "#f1f5f9"
        };
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    onStatusChange(result.draggableId, destination.droppableId);
  };

  const columns = [
    { label: "To Do", value: "todo" },
    { label: "In Progress", value: "in_progress" },
    { label: "Review", value: "review" },
    { label: "Done", value: "done" }
  ];

  const styles = {
    board: {
      display: "flex",
      gap: 24,
      overflowX: "auto",
      paddingBottom: 24,
      alignItems: "flex-start",
      minHeight: "calc(100vh - 250px)"
    },
    column: {
      minWidth: 320,
      width: 320,
      background: "#fff",
      borderRadius: 24,
      padding: 20,
      border: "1px solid #f1f5f9",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
    },
    colHeader: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
      padding: "0 4px"
    },
    colTitle: {
      fontSize: 18,
      fontWeight: 800,
      color: "#B91C1C",
      margin: 0
    },
    colCount: {
      background: "#f1f5f9",
      color: "#64748b",
      padding: "2px 10px",
      borderRadius: "10px",
      fontSize: 13,
      fontWeight: 800
    },
    card: {
      borderRadius: 20,
      padding: "24px",
      marginBottom: 20,
      border: "1px solid",
      cursor: "grab",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
    },
    taskName: {
      fontSize: 15,
      fontWeight: 800,
      marginBottom: 8,
      lineHeight: 1.4
    },
    taskMeta: {
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 16,
      opacity: 0.8
    },
    dateRow: {
      fontSize: 11,
      fontWeight: 600,
      color: "#64748b",
      marginBottom: 16,
      display: "flex",
      flexDirection: "column",
      gap: 4
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: 4
    },
    taskSerial: {
      fontSize: 10,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    empty: {
      padding: "40px 20px",
      textAlign: "center",
      color: "#cbd5e1",
      fontSize: 13,
      fontWeight: 500,
      border: "2px dashed #f1f5f9",
      borderRadius: 16
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={styles.board}>
        {columns.map((col) => {
          const colTasks = tasks.filter(t => toApiStatus(formatStatus(t.status)) === col.value);

          return (
            <div key={col.value} style={styles.column}>
              <div style={styles.colHeader}>
                <h3 style={styles.colTitle}>{col.label}</h3>
                <span style={styles.colCount}>{colTasks.length}</span>
              </div>

              <Droppable droppableId={col.value}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: 100 }}
                  >
                    {colTasks.length === 0 ? (
                      <div style={styles.empty}>No tasks in this column</div>
                    ) : (
                      colTasks.map((t, idx) => {
                        const sStyle = getStatusStyles(t.status);

                        // Extract serial for bottom right
                        const displaySerial = t.task_serial
                          ? `TASK ${String(t.task_serial).padStart(3, "0")}`
                          : (t.task_code?.split('/').pop() || t.taskCode?.split('-').pop() || "TASK 000");

                        return (
                          <Draggable key={t.id} draggableId={String(t.id)} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...styles.card,
                                  ...provided.draggableProps.style,
                                  background: sStyle.bg,
                                  borderColor: sStyle.border,
                                  boxShadow: snapshot.isDragging
                                    ? "0 20px 25px -5px rgba(0,0,0,0.1)"
                                    : "none",
                                  transform: snapshot.isDragging
                                    ? provided.draggableProps.style?.transform + " rotate(2deg)"
                                    : provided.draggableProps.style?.transform
                                }}
                                onClick={() => canEdit(t) && onEdit && onEdit(t)}
                              >
                                <div style={{ ...styles.taskName, color: sStyle.title }}>
                                  {t.title || t.taskName}
                                </div>
                                <div style={{ ...styles.taskMeta, color: sStyle.title }}>
                                  {t.module_name || "General"} • {t.project_name || "Project"}
                                </div>

                                <div style={styles.dateRow}>
                                  <div>Start: {formatShortDate(t.start_date || t.start_datetime)}</div>
                                  <div>End: {formatShortDate(t.end_date || t.end_datetime)}</div>
                                </div>

                                <div style={styles.footer}>
                                  <AvatarGroup
                                    members={[
                                      { id: t.assignee_id, name: t.assignee_name },
                                      ...(t.collaborators || []).map(c => ({
                                        id: c.id || c.user_id || c,
                                        name: c.name || c.full_name
                                      }))
                                    ].slice(0, 3)}
                                    size={24}
                                  />
                                  <div style={styles.taskSerial}>{displaySerial}</div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}