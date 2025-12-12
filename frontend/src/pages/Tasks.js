import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaPlus, FaSearch } from "react-icons/fa";
import gridIcon from "../assets/icons/grid.svg";
import dashboardIcon from "../assets/icons/dashboard.svg";
import { TasksAPI } from "../lib/tasks";
import { ProjectsAPI } from "../lib/projects";

const RED = "#C62828";

const Tasks = ({ role = "Project Manager" }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newTask, setNewTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const statuses = ["to do", "in progress", "review", "done", "blocked"]; // lowercase backend-safe
  const pretty = (s) =>
    (s || "")
      .toString()
      .split(" ")
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [taskRes, projRes] = await Promise.all([
        TasksAPI.list(),
        ProjectsAPI.list(),
      ]);
      const taskList = Array.isArray(taskRes) ? taskRes : taskRes.data || [];
      const projList = Array.isArray(projRes) ? projRes : projRes.data || [];
      setTasks(taskList);
      setProjects(projList);
    } catch (err) {
      console.error("Failed to load tasks or projects", err);
      alert("Failed to load data. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await TasksAPI.update(id, { status: newStatus.toLowerCase() });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id || t._id === id ? { ...t, status: newStatus.toLowerCase() } : t
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (t.task_name || "").toLowerCase().includes(q) ||
      (t.module_name || "").toLowerCase().includes(q) ||
      (t.project_name || "").toLowerCase().includes(q);
    const matchesProject =
      selectedProject === "All" ||
      t.project_id === selectedProject ||
      t.project_name === selectedProject;
    return matchesSearch && matchesProject;
  });

  const boardColumns = {
    "To Do": filteredTasks.filter((t) => (t.status || "").toLowerCase() === "to do"),
    "In Progress": filteredTasks.filter((t) => (t.status || "").toLowerCase() === "in progress"),
    Review: filteredTasks.filter((t) => (t.status || "").toLowerCase() === "review"),
    Done: filteredTasks.filter((t) => (t.status || "").toLowerCase() === "done"),
    Blocked: filteredTasks.filter((t) => (t.status || "").toLowerCase() === "blocked"),
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    if (sourceStatus === destStatus) return;

    const movedTask = boardColumns[sourceStatus][source.index];
    if (!movedTask) return;
    handleStatusChange(movedTask.id || movedTask._id, destStatus.toLowerCase());
  };

  const handleAddTaskClick = () => {
    if (!showAddRow) {
      setNewTask({
        task_name: "",
        module_name: "",
        project_id: projects[0]?.id || projects[0]?._id || null,
        status: "to do", // default backend-safe
        start_date: "",
        end_date: "",
      });
      setShowAddRow(true);
    }
  };

  const handleSaveNewTask = async () => {
    if (!newTask.task_name) {
      alert("Please enter a task name");
      return;
    }
    try {
      const payload = {
        task_name: newTask.task_name,
        module_name: newTask.module_name,
        project_id: newTask.project_id,
        status: newTask.status.toLowerCase(),
        start_date: newTask.start_date,
        end_date: newTask.end_date,
      };
      await TasksAPI.create(payload);
      setShowAddRow(false);
      setNewTask(null);
      await loadAll();
    } catch (err) {
      console.error("Failed to create task", err);
      alert("Failed to create task");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Header role={role} />
          <div style={{ padding: 24 }}>Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Tasks</h2>

          <div style={styles.searchFilterContainer}>
            <div style={styles.searchBox}>
              <FaSearch style={{ ...styles.searchIcon, color: RED }} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...styles.searchInput, paddingLeft: 40 }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="All">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button onClick={handleAddTaskClick} style={styles.addTaskBtn}>
                <FaPlus style={{ marginRight: 8 }} /> Add Task
              </button>

              <div style={styles.iconToggle}>
                <div onClick={() => setViewMode("grid")} style={{ cursor: "pointer", padding: 6 }}>
                  <img src={gridIcon} alt="Grid" style={{ width: 18 }} />
                </div>
                <div onClick={() => setViewMode("board")} style={{ cursor: "pointer", padding: 6 }}>
                  <img src={dashboardIcon} alt="Board" style={{ width: 18 }} />
                </div>
              </div>
            </div>
          </div>

          {viewMode === "grid" && (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Module</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>End</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {showAddRow && (
                    <tr>
                      <td>
                        <input
                          value={newTask.task_name}
                          onChange={(e) =>
                            setNewTask((p) => ({ ...p, task_name: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={newTask.module_name}
                          onChange={(e) =>
                            setNewTask((p) => ({ ...p, module_name: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={newTask.project_id}
                          onChange={(e) =>
                            setNewTask((p) => ({ ...p, project_id: e.target.value }))
                          }
                        >
                          {projects.map((p) => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={newTask.status}
                          onChange={(e) =>
                            setNewTask((p) => ({ ...p, status: e.target.value }))
                          }
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {pretty(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="date"
                          value={newTask.start_date}
                          onChange={(e) =>
                            setNewTask((p) => ({ ...p, start_date: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={newTask.end_date}
                          onChange={(e) =>
                            setNewTask((p) => ({ ...p, end_date: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <button onClick={handleSaveNewTask} style={styles.saveBtn}>
                          Save
                        </button>
                      </td>
                    </tr>
                  )}

                  {filteredTasks.map((task) => (
                    <tr key={task.id || task._id}>
                      <td style={{ fontWeight: 600 }}>{task.task_name}</td>
                      <td>{task.module_name}</td>
                      <td>{task.project_name}</td>
                      <td>
                        <select
                          value={(task.status || "").toLowerCase()}
                          onChange={(e) =>
                            handleStatusChange(task.id || task._id, e.target.value)
                          }
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {pretty(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{task.start_date}</td>
                      <td>{task.end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Kanban View */}
          {viewMode === "board" && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={styles.board}>
                {Object.keys(boardColumns).map((colId) => (
                  <Droppable key={colId} droppableId={colId}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} style={styles.column}>
                        <h3 style={styles.columnTitle}>{colId}</h3>
                        {boardColumns[colId].map((task, index) => (
                          <Draggable
                            key={task.id || task._id}
                            draggableId={`${task.id || task._id}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...styles.taskCard,
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <h4 style={styles.taskName}>{task.task_name}</h4>
                                <p style={styles.taskMeta}>{task.module_name}</p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

// Simplified styles
const styles = {
  pageContainer: { display: "flex", backgroundColor: "#FBFAFC", minHeight: "100vh" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
  pageInner: { padding: "24px" },
  pageTitle: { fontSize: "1.8rem", fontWeight: 700, color: "#111827", marginBottom: 14 },
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
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" },
  searchInput: { width: "100%", padding: "10px 12px 10px 38px", borderRadius: 10 },
  addTaskBtn: {
    background: RED,
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  saveBtn: {
    background: RED,
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
    padding: "12px 14px",
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" },
  board: { display: "flex", gap: 12, marginTop: 8, overflowX: "auto" },
  column: { flex: "1 1 18%", minWidth: 160, backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  columnTitle: { fontSize: 15, fontWeight: 700, color: RED, marginBottom: 10 },
  taskCard: { borderRadius: 10, padding: 10, marginBottom: 8, boxShadow: "0 3px 8px rgba(15,23,42,0.03)" },
  taskName: { fontWeight: 700, fontSize: 14, marginBottom: 6 },
  taskMeta: { fontSize: 12, color: "#374151" },
};

export default Tasks;
