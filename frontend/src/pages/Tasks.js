import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Tasks = ({ role = "Project Manager" }) => {
  const [columns, setColumns] = useState({
    todo: [
      {
        id: "1",
        name: "Design Wireframes",
        priority: "High",
        dueDate: "2025-11-12",
        progress: 0,
      },
      {
        id: "2",
        name: "Client Requirement Review",
        priority: "Medium",
        dueDate: "2025-11-10",
        progress: 0,
      },
    ],
    inProgress: [
      {
        id: "3",
        name: "API Integration",
        priority: "High",
        dueDate: "2025-11-14",
        progress: 50,
      },
      {
        id: "4",
        name: "Testing Module",
        priority: "Low",
        dueDate: "2025-11-18",
        progress: 30,
      },
    ],
    completed: [
      {
        id: "5",
        name: "Project Setup",
        priority: "Low",
        dueDate: "2025-11-05",
        progress: 100,
      },
    ],
  });

  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    priority: "Medium",
    status: "todo",
    dueDate: "",
    progress: 0,
  });

  const [filters, setFilters] = useState({
    dueDate: "",
    priority: "",
    progress: "",
  });

  // === Drag & Drop Handler ===
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const sourceItems = Array.from(columns[sourceCol]);
    const destItems = Array.from(columns[destCol]);
    const [moved] = sourceItems.splice(source.index, 1);

    if (sourceCol === destCol) {
      sourceItems.splice(destination.index, 0, moved);
      setColumns({ ...columns, [sourceCol]: sourceItems });
    } else {
      destItems.splice(destination.index, 0, moved);
      setColumns({
        ...columns,
        [sourceCol]: sourceItems,
        [destCol]: destItems,
      });
    }
  };

  // === Add New Task ===
  const handleAddTask = (e) => {
    e.preventDefault();
    const newTaskObj = {
      id: Date.now().toString(),
      name: newTask.name,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      progress: parseInt(newTask.progress),
    };
    setColumns({
      ...columns,
      [newTask.status]: [...columns[newTask.status], newTaskObj],
    });
    setNewTask({
      name: "",
      priority: "Medium",
      status: "todo",
      dueDate: "",
      progress: 0,
    });
    setShowModal(false);
  };

  const handleFilterChange = (key, value) =>
    setFilters({ ...filters, [key]: value });

  const getBadgeColor = (priority) => {
    switch (priority) {
      case "High":
        return "#c62828";
      case "Medium":
        return "#fbc02d";
      case "Low":
        return "#2e7d32";
      default:
        return "#555";
    }
  };

  // === Apply Filters ===
  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const dueMatch = filters.dueDate ? task.dueDate === filters.dueDate : true;
      const priorityMatch = filters.priority
        ? task.priority === filters.priority
        : true;
      const progressMatch = filters.progress
        ? filters.progress === "Completed"
          ? task.progress === 100
          : filters.progress === "In Progress"
          ? task.progress > 0 && task.progress < 100
          : task.progress === 0
        : true;
      return dueMatch && priorityMatch && progressMatch;
    });
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />
        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>My Tasks</h2>

          {/* === Filters === */}
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Due Date</label>
              <input
                type="date"
                value={filters.dueDate}
                onChange={(e) => handleFilterChange("dueDate", e.target.value)}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Progress</label>
              <select
                value={filters.progress}
                onChange={(e) => handleFilterChange("progress", e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All</option>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          {/* === Kanban Board === */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={styles.board}>
              {Object.entries(columns).map(([colId, tasks]) => (
                <Droppable key={colId} droppableId={colId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        ...styles.column,
                        backgroundColor: snapshot.isDraggingOver
                          ? "#fbe9e7"
                          : "#fff",
                      }}
                    >
                      <h3 style={styles.columnTitle}>
                        {colId === "todo"
                          ? "To Do"
                          : colId === "inProgress"
                          ? "In Progress"
                          : "Completed"}
                      </h3>

                      {filterTasks(tasks).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
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
                              <div style={styles.taskHeader}>
                                <h4 style={styles.taskName}>{task.name}</h4>
                                <span
                                  style={{
                                    ...styles.badge,
                                    backgroundColor: getBadgeColor(task.priority),
                                    color:
                                      task.priority === "Medium" ? "#222" : "#fff",
                                  }}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              <p style={styles.taskMeta}>
                                Due: {task.dueDate || "N/A"} •{" "}
                                {task.progress === 100
                                  ? "Completed"
                                  : `${task.progress}%`}
                              </p>
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
        </div>

        {/* === Floating "+" Button === */}
        <button style={styles.addButton} onClick={() => setShowModal(true)}>
          +
        </button>

        {/* === Add Task Modal === */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3>Add Task</h3>
                <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <form style={styles.form} onSubmit={handleAddTask}>
                <label>Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  required
                />
                <label>Priority</label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                />
                <label>Progress (%)</label>
                <input
                  type="number"
                  name="progress"
                  min="0"
                  max="100"
                  value={newTask.progress}
                  onChange={(e) =>
                    setNewTask({ ...newTask, progress: e.target.value })
                  }
                />
                <label>Status</label>
                <select
                  name="status"
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button type="submit" style={styles.submitBtn}>
                  Add Task
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// === Styles ===
const styles = {
  pageContainer: { display: "flex", backgroundColor: "#f9f9f9", height: "100vh" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
  pageInner: { padding: "30px" },
  pageTitle: { fontSize: "1.5rem", fontWeight: "600", color: "#222", marginBottom: "25px" },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    backgroundColor: "#fff",
    padding: "15px 20px",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "25px",
  },
  filterGroup: { display: "flex", flexDirection: "column" },
  filterLabel: { fontSize: "0.85rem", color: "#555", marginBottom: "4px" },
  filterInput: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "0.9rem",
  },
  filterSelect: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "0.9rem",
    backgroundColor: "#fff",
  },
  board: { display: "flex", gap: "20px", justifyContent: "space-between" },
  column: {
    flex: 1,
    minWidth: "300px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "15px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  columnTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#c62828",
  },
  taskCard: {
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "10px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  taskName: { fontSize: "0.95rem", fontWeight: "500", color: "#222" },
  taskMeta: { fontSize: "0.85rem", color: "#777", marginTop: "5px" },
  badge: { fontSize: "12px", padding: "4px 10px", borderRadius: "5px" },
  addButton: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    backgroundColor: "#c62828",
    color: "#fff",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: "30px",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "10px",
    padding: "25px",
    width: "400px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  closeBtn: { background: "none", border: "none", fontSize: "22px", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  submitBtn: {
    marginTop: "10px",
    backgroundColor: "#c62828",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default Tasks;
