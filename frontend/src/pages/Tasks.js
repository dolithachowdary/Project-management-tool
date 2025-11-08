import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaThLarge, FaListUl, FaPlus, FaSearch, FaFilter, FaSort } from "react-icons/fa";

const Tasks = ({ role = "Project Manager" }) => {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "board"
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // yyyy-mm-dd
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const [tasks, setTasks] = useState([
    {
      id: "1",
      taskName: "Design Dashboard Layout",
      moduleName: "UI Module",
      projectName: "Analytics Dashboard",
      assignedTo: ["A", "B", "C", "D"],
      status: "Done",
      startDate: "2025-11-10",
      endDate: "2025-11-14",
    },
    {
      id: "2",
      taskName: "API Integration",
      moduleName: "Backend Module",
      projectName: "Automation Suite",
      assignedTo: ["B", "C"],
      status: "Blocked",
      startDate: "2025-11-08",
      endDate: "2025-11-12",
    },
    {
      id: "3",
      taskName: "User Authentication Setup",
      moduleName: "Security Module",
      projectName: "Enterprise Portal",
      assignedTo: ["A", "D"],
      status: "In Progress",
      startDate: "2025-11-05",
      endDate: "2025-11-10",
    },
    {
      id: "4",
      taskName: "Database Optimization",
      moduleName: "Backend Module",
      projectName: "Analytics Dashboard",
      assignedTo: ["C"],
      status: "To Do",
      startDate: "2025-11-12",
      endDate: "2025-11-20",
    },
  ]);

  const statuses = ["All", "To Do", "In Progress", "Review", "Done", "Blocked"];
  const statusesForSelect = statuses.filter((s) => s !== "All");

  // pastel colors for statuses
  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return { bg: "#E3F2FD", text: "#1565C0" }; // light blue
      case "In Progress":
        return { bg: "#FFF8E1", text: "#856404" }; // pale yellow
      case "Review":
        return { bg: "#E8EAF6", text: "#2E3A59" }; // lavender-blue
      case "Done":
        return { bg: "#E8F5E9", text: "#2E7D32" }; // mint
      case "Blocked":
        return { bg: "#FCE4EC", text: "#8B1E3F" }; // blush
      default:
        return { bg: "#F3F4F6", text: "#374151" };
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  // filter by search, selectedStatus, selectedDate
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.taskName.toLowerCase().includes(q) ||
      t.moduleName.toLowerCase().includes(q) ||
      t.projectName.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "All" || t.status === selectedStatus;
    const matchesDate =
      !selectedDate ||
      t.startDate === selectedDate ||
      t.endDate === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // board columns are derived from filteredTasks (so board respects filters)
  const boardColumns = {
    "To Do": filteredTasks.filter((t) => t.status === "To Do"),
    "In Progress": filteredTasks.filter((t) => t.status === "In Progress"),
    Review: filteredTasks.filter((t) => t.status === "Review"),
    Done: filteredTasks.filter((t) => t.status === "Done"),
    Blocked: filteredTasks.filter((t) => t.status === "Blocked"),
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (sourceStatus === destStatus) return;

    // movedTask is from boardColumns (which references objects from tasks)
    const movedTask = boardColumns[sourceStatus][source.index];
    if (!movedTask) return;

    // update the status on the master tasks array
    setTasks((prev) => prev.map((t) => (t.id === movedTask.id ? { ...t, status: destStatus } : t)));
  };

  const getCount = (status) => {
    if (status === "All") return tasks.length;
    return tasks.filter((t) => t.status === status).length;
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Tasks</h2>

          {/* === Top toolbar: single rounded container with search + date + actions === */}
          <div style={styles.searchFilterContainer}>
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search tasks, module or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.centerControls}>
              <label style={styles.dateLabel}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={styles.dateInput}
                />
              </label>
            </div>

            <div style={styles.toolbarBtns}>
              <button style={styles.toolbarBtn}>
                <FaSort /> Sort by
              </button>
              <button style={styles.toolbarBtn}>
                <FaFilter /> Filter
              </button>

              <button
                onClick={() => setViewMode("grid")}
                style={{
                  ...styles.toolbarBtn,
                  ...(viewMode === "grid" ? styles.activeBtn : {}),
                }}
              >
                <FaListUl /> Grid
              </button>

              <button
                onClick={() => setViewMode("board")}
                style={{
                  ...styles.toolbarBtn,
                  ...(viewMode === "board" ? styles.activeBtn : {}),
                }}
              >
                <FaThLarge /> Board
              </button>
            </div>
          </div>

          {/* === Status chips row (pastel pills) === */}
          <div style={styles.statusFilterContainer}>
            {statuses.map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  style={{
                    ...styles.statusChip,
                    ...(isActive ? styles.activeChip : {}),
                  }}
                >
                  <span>{status}</span>
                  <span style={styles.chipCount}>{getCount(status)}</span>
                </button>
              );
            })}
            {/* clear date quick button */}
            <button
              onClick={() => setSelectedDate("")}
              style={styles.clearDateBtn}
              title="Clear date"
            >
              Clear date
            </button>
          </div>

          {/* === GRID VIEW (table) === */}
          {viewMode === "grid" && (
            <div style={styles.tableContainer}>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Task Name</th>
                      <th style={styles.th}>Module Name</th>
                      <th style={styles.th}>Project Name</th>
                      <th style={styles.th}>Assigned To</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Start Date</th>
                      <th style={styles.th}>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => {
                      const colors = getStatusColor(task.status);
                      const isHovered = hoveredRow === task.id;
                      return (
                        <tr
                          key={task.id}
                          onMouseEnter={() => setHoveredRow(task.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{
                            ...styles.tableRow,
                            boxShadow: isHovered ? "0 6px 18px rgba(15,23,42,0.08)" : styles.tableRow.boxShadow,
                            transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                          }}
                        >
                          <td style={{ ...styles.td, fontWeight: 600 }}>{task.taskName}</td>
                          <td style={styles.td}>{task.moduleName}</td>
                          <td style={styles.td}>{task.projectName}</td>
                          <td style={styles.td}>
                            <div style={styles.userAvatars}>
                              {task.assignedTo.slice(0, 3).map((u, i) => (
                                <div key={i} style={styles.avatar}>
                                  {u}
                                </div>
                              ))}
                              {task.assignedTo.length > 3 && (
                                <div style={styles.plusAvatar}>+{task.assignedTo.length - 3}</div>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              style={{
                                ...styles.statusDropdown,
                                backgroundColor: colors.bg,
                                color: colors.text,
                              }}
                            >
                              {statusesForSelect.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={styles.td}>{task.startDate}</td>
                          <td style={styles.td}>{task.endDate}</td>
                        </tr>
                      );
                    })}
                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#666" }}>
                          No tasks found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === BOARD VIEW (kanban) === */}
          {viewMode === "board" && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={styles.board}>
                {Object.keys(boardColumns).map((colId) => (
                  <Droppable key={colId} droppableId={colId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={styles.column}
                      >
                        <h3 style={styles.columnTitle}>{colId}</h3>

                        <div style={{ minHeight: 20 }}>
                          {boardColumns[colId].map((task, index) => {
                            const colors = getStatusColor(task.status);
                            const isHovered = hoveredCard === task.id;
                            return (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onMouseEnter={() => setHoveredCard(task.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                      ...styles.taskCard,
                                      backgroundColor: colors.bg,
                                      color: colors.text,
                                      boxShadow: isHovered
                                        ? "0 8px 22px rgba(15,23,42,0.10)"
                                        : styles.taskCard.boxShadow,
                                      transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <h4 style={styles.taskName}>{task.taskName}</h4>
                                    <p style={styles.taskMeta}>
                                      {task.moduleName} • {task.projectName}
                                    </p>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>

        <button style={styles.addButton}>
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

// === inline styles ===
const styles = {
  pageContainer: { display: "flex", backgroundColor: "#FBFAFC", height: "100vh" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
  pageInner: { padding: "28px" },
  pageTitle: { fontSize: "1.8rem", fontWeight: 700, color: "#111827", marginBottom: 18 },

  /* top toolbar */
  searchFilterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
    padding: "10px 18px",
    marginBottom: 16,
  },
  searchBox: { position: "relative", flex: 1, marginRight: 12 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    borderRadius: 10,
    border: "1px solid #E6E9EE",
    fontSize: 14,
    outline: "none",
  },
  centerControls: { display: "flex", alignItems: "center", marginRight: 12 },
  dateLabel: { display: "inline-block" },
  dateInput: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #E6E9EE",
    fontSize: 14,
    outline: "none",
  },

  toolbarBtns: { display: "flex", gap: 10, alignItems: "center" },
  toolbarBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #E6E9EE",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    color: "#374151",
    fontSize: 13,
  },
  activeBtn: { backgroundColor: "#FFF1E6", color: "#c2410c", borderColor: "#FFDAB6" },

  /* status chips */
  statusFilterContainer: {
    background: "#fff",
    borderRadius: 12,
    padding: "12px 14px",
    display: "flex",
    gap: 10,
    boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
    marginBottom: 18,
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusChip: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "#F7F7F8",
    color: "#374151",
    border: "2px solid transparent",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.18s ease",
  },
  activeChip: {
    background: "#FFF7ED",
    borderColor: "#FFE7BF",
    color: "#7C2D12",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
  },
  chipCount: {
    background: "#FFF4D9",
    color: "#3C2F11",
    borderRadius: "50%",
    width: 20,
    height: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    paddingTop: 1,
  },

  clearDateBtn: {
    marginLeft: 10,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #E6E9EE",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    color: "#374151",
  },

  /* table */
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
    padding: "12px 18px",
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" },
  th: {
    textAlign: "left",
    padding: "12px 12px",
    color: "#111827",
    fontWeight: 700,
    fontSize: 13,
    borderBottom: "1px solid #EEF2F7",
    background: "transparent",
  },
  tableRow: {
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 8px rgba(15,23,42,0.03)",
    transition: "all 180ms ease",
  },
  td: {
    padding: "14px 12px",
    color: "#374151",
    fontSize: 14,
    verticalAlign: "middle",
  },

  userAvatars: { display: "flex", alignItems: "center" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#E6E6E6",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    marginLeft: -8,
    border: "2px solid #fff",
  },
  plusAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#fff",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    marginLeft: -8,
    border: "2px solid #E2E8F0",
  },

  statusDropdown: {
    border: "none",
    borderRadius: 8,
    padding: "6px 10px",
    fontWeight: 600,
    cursor: "pointer",
  },

  /* board */

board: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "nowrap", // keep all 5 columns in one row
  gap: 12,            // tighter gap between columns
  marginTop: 8,
  width: "100%",
  overflowX: "auto",  // enables subtle horizontal scroll only if absolutely needed
  paddingBottom: 10,
},
column: {
  flex: "1 1 18%",     // ✅ ensures roughly 5 equal columns on standard screens
  minWidth: 200,       // prevent too narrow on small windows
  maxWidth: 240,       // keeps proportions tight and uniform
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 12,
  boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
  transition: "all 0.2s ease",
},
columnTitle: {
  fontSize: 15,
  fontWeight: 700,
  color: "#c2410c",
  marginBottom: 10,
  whiteSpace: "nowrap",
},
taskCard: {
  borderRadius: 10,
  padding: 10,
  marginBottom: 8,
  boxShadow: "0 3px 8px rgba(15,23,42,0.03)",
  transition: "all 160ms ease",
  cursor: "grab",
},

  taskName: { fontWeight: 700, fontSize: 14, marginBottom: 6 },
  taskMeta: { fontSize: 12, color: "#374151" },

  addButton: {
    position: "fixed",
    bottom: 28,
    right: 28,
    backgroundColor: "#F97316",
    color: "#fff",
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 26px rgba(249,115,22,0.18)",
  },
};

export default Tasks;
