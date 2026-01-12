import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Avatar from "./Avatar";
import { formatStatus, toApiStatus } from "../utils/helpers";
import { getStatusStyles } from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { Calendar } from "lucide-react";

export default function TaskBoardView({
  tasks,
  onStatusChange,
  onEdit,
  canEdit,
  formatShortDate,
}) {


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
    { label: "Completed", value: "done" },
    { label: "Blocked", value: "blocked" }
  ];

  const styles = {
    board: {
      display: "flex",
      gap: 12,
      paddingBottom: 24,
      alignItems: "flex-start",
      minHeight: "calc(100vh - 250px)",
      width: "100%"
    },
    column: {
      flex: 1,
      minWidth: 0,
      background: "transparent",
      borderRadius: 24,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: 16
    },
    colHeader: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 4px",
      marginBottom: 4
    },
    colTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--text-secondary)",
      margin: 0,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    colCount: {
      background: "var(--bg-secondary)",
      color: "var(--text-secondary)",
      padding: "1px 6px",
      borderRadius: "999px",
      fontSize: 10,
      fontWeight: 700,
      border: "1px solid var(--border-color)"
    },
    card: {
      background: "var(--card-bg)",
      borderRadius: 14,
      padding: "10px",
      marginBottom: 12,
      border: "1px solid var(--border-color)",
      cursor: "grab",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      boxShadow: "var(--shadow-sm)"
    },
    taskName: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--text-primary)",
      marginBottom: 6,
      lineHeight: 1.4
    },
    taskMeta: {
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 12,
      color: "var(--text-secondary)"
    },
    projectPill: {
      display: "inline-block",
      fontSize: 10,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: "999px",
      marginBottom: 12,
      color: "#fff",
      textTransform: "uppercase"
    },
    dateRow: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 6
    },
    moduleBadge: {
      fontSize: "10px",
      padding: "3px 8px",
      borderRadius: "6px",
      backgroundColor: "var(--bg-secondary)",
      color: "var(--text-secondary)",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
      display: "inline-block",
      marginBottom: "8px",
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
      color: "var(--text-secondary)",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    empty: {
      padding: "40px 20px",
      textAlign: "center",
      color: "var(--text-secondary)",
      fontSize: 13,
      fontWeight: 500,
      border: "2px dashed var(--border-color)",
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
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: getStatusStyles(col.value).color }} />
                <h3 style={styles.colTitle}>{col.label}</h3>
                <span style={styles.colCount}>{colTasks.length}</span>
              </div>

              <Droppable droppableId={col.value}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="hide-scrollbar"
                    style={{
                      maxHeight: "680px",
                      overflowY: "auto",
                      paddingRight: "4px",
                      backgroundColor: snapshot.isDraggingOver ? "rgba(var(--bg-secondary-rgb), 0.5)" : "transparent",
                      borderRadius: 12,
                      transition: "background-color 0.2s",
                      msOverflowStyle: "none",
                      scrollbarWidth: "none",
                    }}
                  >
                    <style>{`
                      .hide-scrollbar::-webkit-scrollbar { display: none; }
                    `}</style>
                    {colTasks.length === 0 ? (
                      <div style={styles.empty}>No tasks in this column</div>
                    ) : (
                      colTasks.map((t, idx) => {

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
                                  opacity: snapshot.isDragging ? 0.9 : 1,
                                  boxShadow: snapshot.isDragging
                                    ? "var(--shadow-md)"
                                    : styles.card.boxShadow
                                }}
                                onClick={() => canEdit(t) && onEdit && onEdit(t)}
                              >
                                <div style={styles.moduleBadge}>
                                  {t.module_name || "General"}
                                </div>
                                <div style={styles.taskName}>
                                  {t.title || t.taskName}
                                </div>

                                {t.project_name && (
                                  <div style={{ ...styles.projectPill, background: t.project_color || "#3b82f6" }}>
                                    {t.project_name}
                                  </div>
                                )}

                                <div style={styles.dateRow}>
                                  <Calendar size={12} />
                                  <span>{formatShortDate(t.end_date || t.end_datetime || t.start_date || t.start_datetime)}</span>
                                </div>

                                <div style={styles.footer}>
                                  <PriorityBadge priority={t.priority} style={{ fontSize: '10px' }} />
                                  <Avatar
                                    name={t.assignee_name || t.assignedTo?.full_name || "Unassigned"}
                                    id={t.assignee_id}
                                    size={24}
                                  />
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
