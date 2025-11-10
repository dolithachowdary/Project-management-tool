import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaThLarge, FaListUl, FaPlus, FaSearch, FaFilter, FaSort } from "react-icons/fa";
import gridIcon from "../assets/icons/grid.svg";
import dashboardIcon from "../assets/icons/dashboard.svg";


const RED = "#C62828";

const Tasks = ({ role = "Project Manager" }) => {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "board"
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // yyyy-mm-dd
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState("All");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newTask, setNewTask] = useState(null);
  const [toast, setToast] = useState({ show: false, text: "" });

  // dummy data for dropdowns (replace with API values later)
  const projectList = ["All", "Analytics Dashboard", "Automation Suite", "Enterprise Portal"];
  const peopleList = ["All", "A", "B", "C", "D"];

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

  // Combined filters: search, status, date, project, person
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.taskName.toLowerCase().includes(q) ||
      t.moduleName.toLowerCase().includes(q) ||
      t.projectName.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "All" || t.status === selectedStatus;
    const matchesDate = !selectedDate || t.startDate === selectedDate || t.endDate === selectedDate;
    const matchesProject = selectedProject === "All" || t.projectName === selectedProject;
    const matchesPerson =
      selectedPerson === "All" || t.assignedTo.some((p) => p === selectedPerson);
    return matchesSearch && matchesStatus && matchesDate && matchesProject && matchesPerson;
  });

  // board columns derived from filteredTasks (board respects filters)
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
    setTasks((prev) =>
      prev.map((t) => (t.id === movedTask.id ? { ...t, status: destStatus } : t))
    );
  };

  const getCount = (status) => {
    if (status === "All") return tasks.length;
    return tasks.filter((t) => t.status === status).length;
  };

  // show toast
  useEffect(() => {
    if (!toast.show) return;
    const id = setTimeout(() => setToast({ show: false, text: "" }), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  // Add Task logic (inline row)
  const handleAddTaskClick = () => {
    // only insert inline row in grid view
    if (viewMode !== "grid") setViewMode("grid");
    if (!showAddRow) {
      setNewTask({
        id: `temp-${Date.now()}`,
        taskName: "",
        moduleName: "",
        projectName: projectList[1] || "Analytics Dashboard",
        assignedTo: [],
        status: "To Do",
        startDate: "",
        endDate: "",
      });
      setShowAddRow(true);
    }
  };

  const handleSaveNewTask = () => {
    if (!newTask) return;
    // basic validation: require taskName
    if (!newTask.taskName.trim()) {
      setToast({ show: true, text: "Please enter task name" });
      return;
    }
    const saved = {
      ...newTask,
      id: `${Date.now()}`, // simple id
      assignedTo: newTask.assignedTo.length ? newTask.assignedTo : ["A"],
    };
    // add to top of master tasks
    setTasks((prev) => [saved, ...prev]);
    // reset add row
    setNewTask(null);
    setShowAddRow(false);
    setToast({ show: true, text: "Task added successfully!" });
  };

  const handleCancelNewTask = () => {
    setNewTask(null);
    setShowAddRow(false);
  };

  // helper to toggle view via pill toggle
  const toggleView = () => setViewMode((v) => (v === "grid" ? "board" : "grid"));

  // helper for assignedTo multi-select simple implementation (comma separated text)
  const handleNewTaskAssignChange = (value) => {
    // accept comma separated names or single name
    const arr = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setNewTask((prev) => ({ ...prev, assignedTo: arr }));
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Tasks</h2>

          {/* === Top toolbar: single rounded container with search + date + project + person + toggle + add task === */}
          <div style={styles.searchFilterContainer}>
            {/* search */}
            <div style={styles.searchBox}>
              <FaSearch style={{ ...styles.searchIcon, color: "#B91C1C" }} />
              <input
                type="text"
                placeholder="Search tasks, module or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...styles.searchInput, paddingLeft: 40 }}
              />
            </div>

            {/* date picker */}
            <div style={styles.toolbarControl}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            {/* project select */}
            <div style={styles.toolbarControl}>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={styles.selectInput}
              >
                {projectList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* person select */}
            <div style={styles.toolbarControl}>
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                style={styles.selectInput}
              >
                {peopleList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            {/* icon toggle pill */}                
            <div style={styles.toggleWrapper}>
            <div style={styles.iconToggle}>
              {/* sliding background indicator */}
              <div
                style={{
                  ...styles.toggleHighlight,
                  transform: viewMode === "grid" ? "translateX(0%)" : "translateX(100%)",
                }}
              ></div>

              {/* Grid icon */}
              <div
                onClick={() => setViewMode("grid")}
                style={{
                  ...styles.iconButton,
                  color: viewMode === "grid" ? "#C62828" : "#6B7280",
                }}
              >
                <img
                  src={gridIcon}
                  alt="Grid"
                  style={{
                    width: 18,
                    height: 18,
                    zIndex: 2,
                    filter:
                      viewMode === "grid"
                        ? "invert(20%) sepia(90%) saturate(5000%) hue-rotate(350deg)"
                        : "invert(40%) brightness(0.5)",
                    transition: "filter 0.3s ease",
                  }}
                />
              </div>

              {/* Board icon */}
              <div
                onClick={() => setViewMode("board")}
                style={{
                  ...styles.iconButton,
                  color: viewMode === "board" ? "#C62828" : "#6B7280",
                }}
              >
                <img
                  src={dashboardIcon}
                  alt="Board"
                  style={{
                    width: 18,
                    height: 18,
                    zIndex: 2,
                    filter:
                      viewMode === "board"
                        ? "invert(20%) sepia(90%) saturate(5000%) hue-rotate(350deg)"
                        : "invert(40%) brightness(0.5)",
                    transition: "filter 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>

            {/* add task */}
            <div style={styles.toolbarControl}>
              <button onClick={handleAddTaskClick} style={styles.addTaskBtn}>
                <FaPlus style={{ marginRight: 8 }} />
                Add Task
              </button>
            </div>
          </div>

          {/* === Status chips row (only for Grid view) === */}
          {viewMode === "grid" && (
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
              <button onClick={() => setSelectedDate("")} style={styles.clearDateBtn} title="Clear date">
                Clear date
              </button>
            </div>
          )}

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
                      <th style={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* inline add row at top */}
                    {showAddRow && newTask && (
                      <tr style={{ ...styles.tableRow, background: "#FFF9F9" }}>
                        <td style={styles.td}>
                          <input
                            value={newTask.taskName}
                            onChange={(e) => setNewTask((p) => ({ ...p, taskName: e.target.value }))}
                            placeholder="Task name"
                            style={styles.inlineInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            value={newTask.moduleName}
                            onChange={(e) => setNewTask((p) => ({ ...p, moduleName: e.target.value }))}
                            placeholder="Module name"
                            style={styles.inlineInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <select
                            value={newTask.projectName}
                            onChange={(e) => setNewTask((p) => ({ ...p, projectName: e.target.value }))}
                            style={styles.inlineSelect}
                          >
                            {projectList
                              .filter((p) => p !== "All")
                              .map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td style={styles.td}>
                          <input
                            value={newTask.assignedTo.join(", ")}
                            onChange={(e) => handleNewTaskAssignChange(e.target.value)}
                            placeholder="A, B, C"
                            style={styles.inlineInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <select
                            value={newTask.status}
                            onChange={(e) => setNewTask((p) => ({ ...p, status: e.target.value }))}
                            style={styles.inlineSelect}
                          >
                            {statusesForSelect.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.td}>
                          <input
                            type="date"
                            value={newTask.startDate}
                            onChange={(e) => setNewTask((p) => ({ ...p, startDate: e.target.value }))}
                            style={styles.inlineDate}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            type="date"
                            value={newTask.endDate}
                            onChange={(e) => setNewTask((p) => ({ ...p, endDate: e.target.value }))}
                            style={styles.inlineDate}
                          />
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={handleSaveNewTask} style={styles.saveBtn}>
                              Save
                            </button>
                            <button onClick={handleCancelNewTask} style={styles.cancelBtn}>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

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
                              {task.assignedTo.length > 3 && <div style={styles.plusAvatar}>+{task.assignedTo.length - 3}</div>}
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
                          <td style={styles.td}></td>
                        </tr>
                      );
                    })}
                    {filteredTasks.length === 0 && !showAddRow && (
                      <tr>
                        <td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#666" }}>
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
                      <div ref={provided.innerRef} {...provided.droppableProps} style={styles.column}>
                        <h3 style={styles.columnTitle}>{colId}</h3>

                        <div style={{ minHeight: 20 }}>
                          {boardColumns[colId].map((task, index) => {
                            const colors = getStatusColor(task.status);
                            const isHovered = hoveredCard === task.id;
                            return (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
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
                                      boxShadow: snapshot.isDragging
                                        ? "0 8px 22px rgba(15,23,42,0.12)"
                                        : isHovered
                                        ? "0 8px 22px rgba(15,23,42,0.10)"
                                        : styles.taskCard.boxShadow,
                                      transform: snapshot.isDragging ? "scale(1.02)" : isHovered ? "translateY(-6px)" : "translateY(0)",
                                      transition: "all 0.18s ease",
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

        {/* toast */}
        {toast.show && (
          <div style={styles.toast}>
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
};

// === inline styles ===
const styles = {
  pageContainer: { display: "flex", backgroundColor: "#FBFAFC", minHeight: "100vh" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
  pageInner: { padding: "24px" },
  pageTitle: { fontSize: "1.8rem", fontWeight: 700, color: "#111827", marginBottom: 14 },

  /* top toolbar */
  searchFilterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
    padding: "10px 14px",
    marginBottom: 14,
    gap: 12,
  },
  searchBox: { position: "relative", flex: 1, minWidth: 180 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    borderRadius: 10,
    border: "1px solid #E6E9EE",
    fontSize: 14,
    outline: "none",
  },

  toolbarControl: {
    minWidth: 120,
    marginLeft: 8,
  },
  dateInput: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #E6E9EE",
    fontSize: 14,
    outline: "none",
    width: 160,
  },
  selectInput: {
    width: 160,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #E6E9EE",
    fontSize: 14,
    outline: "none",
    background: "#fff",
  },

  toggleWrapper: { marginLeft: 8 },

iconButton: {
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.25s ease",
},

iconButtonActive: {
  backgroundColor: "#FEE8E8", // light red tint
  transform: "scale(1.05)",
  boxShadow: "0 4px 10px rgba(198,40,40,0.12)",
},
iconToggle: {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 999,
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  padding: "4px 6px",
  width: 80,
  height: 42,
  overflow: "hidden",
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
},

toggleHighlight: {
  position: "absolute",
  top: 3,
  left: 3,
  width: "calc(50% - 6px)",
  height: "calc(100% - 6px)",
  borderRadius: "50%",
  background: "#FEE8E8",
  boxShadow: "0 4px 10px rgba(198,40,40,0.12)",
  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  zIndex: 1,
},
  addTaskBtn: {
    background: RED,
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 6px 16px rgba(198,40,40,0.18)",
  },

  /* ===== Status Filter Chips ===== */
statusFilterContainer: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
  padding: "12px 14px",
  marginBottom: 18,
},

statusChip: {
  display: "flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  background: "#F9FAFB", // neutral background
  color: "#374151", // neutral text
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 16px",
  transition: "all 0.25s ease",
  boxShadow: "none",
},

activeChip: {
  background: "#FFE5E5", // light red tint
  color: "#C62828",
  transform: "translateY(-2px)",
  boxShadow: "0 4px 10px rgba(198,40,40,0.10)",
},

chipCount: {
  background: "#fff",
  color: "#C62828",
  borderRadius: 999,
  minWidth: 20,
  height: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  padding: "2px 6px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
},

clearDateBtn: {
  background: "#fff",
  border: "1px solid #E5E7EB",
  color: "#374151",
  fontSize: 13,
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
  transition: "all 0.25s ease",
},

  /* table */
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
    padding: "12px 14px",
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
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
    padding: "10px 12px",
    color: "#374151",
    fontSize: 14,
    verticalAlign: "middle",
  },

  inlineInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #E6E9EE",
    fontSize: 13,
    outline: "none",
  },
  inlineSelect: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #E6E9EE",
    fontSize: 13,
    outline: "none",
    background: "#fff",
  },
  inlineDate: {
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #E6E9EE",
    fontSize: 13,
    outline: "none",
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
    flexWrap: "nowrap", // attempt 5 columns in one row; will scroll if extremely narrow
    gap: 12,
    marginTop: 8,
    width: "100%",
    overflowX: "hidden",
    paddingBottom: 6,
  },
  column: {
    flex: "1 1 18%", // attempt to make ~5 equal columns
    minWidth: 160,
    maxWidth: 260,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
    transition: "all 0.18s ease",
  },
  columnTitle: { fontSize: 15, fontWeight: 700, color: RED, marginBottom: 10, whiteSpace: "nowrap" },
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
  saveBtn: {
    background: RED,
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  cancelBtn: {
    background: "#fff",
    color: "#374151",
    border: "1px solid #E6E9EE",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },

  /* toast */
  toast: {
    position: "fixed",
    bottom: 100,
    right: 32,
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
};

export default Tasks;
