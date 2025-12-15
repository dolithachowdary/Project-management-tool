import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/* ================= INITIAL DATA ================= */
const initialProjects = {
  active: [
    { id: "1", title: "TourO Web Development" },
    { id: "2", title: "Dashboard Portal" },
    { id: "3", title: "Designing" },
  ],
  onHold: [
    { id: "4", title: "Marketing Website" },
  ],
  completed: [
    { id: "5", title: "Design System" },
  ],
};

/* ================= COMPONENT ================= */
const Projects = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  /* ================= DRAG HANDLER ================= */
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;

    const sourceItems = Array.from(projects[sourceKey]);
    const destItems = Array.from(projects[destKey]);

    const [movedItem] = sourceItems.splice(source.index, 1);

    if (sourceKey === destKey) {
      sourceItems.splice(destination.index, 0, movedItem);
      setProjects({ ...projects, [sourceKey]: sourceItems });
    } else {
      destItems.splice(destination.index, 0, movedItem);
      setProjects({
        ...projects,
        [sourceKey]: sourceItems,
        [destKey]: destItems,
      });
    }
  };

  /* ================= ADD PROJECT ================= */
  const handleAddProject = (e) => {
    e.preventDefault();

    const project = {
      id: Date.now().toString(),
      title: newProject.title,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
    };

    setProjects((prev) => ({
      ...prev,
      [newProject.status]: [...prev[newProject.status], project],
    }));

    setNewProject({
      title: "",
      startDate: "",
      endDate: "",
      status: "active",
    });

    setShowModal(false);
  };

  return (
    <div style={styles.page}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.board}>
          {Object.entries(projects).map(([key, items]) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={styles.column}
                >
                  <h3 style={styles.heading}>
                    {key === "active"
                      ? "Active Projects"
                      : key === "onHold"
                      ? "On Hold Projects"
                      : "Completed Projects"}
                  </h3>

                  {items.map((item, index) => (
                    <Draggable
                      draggableId={item.id}
                      index={index}
                      key={item.id}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...styles.card,
                            ...provided.draggableProps.style,
                          }}
                        >
                          {item.title}
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

      {/* ===== Floating + Button ===== */}
      <button style={styles.addBtn} onClick={() => setShowModal(true)}>
        +
      </button>

      {/* ===== Add Project Modal ===== */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Add Project</h3>
            <form style={styles.form} onSubmit={handleAddProject}>
              <input
                type="text"
                placeholder="Project Name"
                required
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />

              <input
                type="date"
                required
                value={newProject.startDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, startDate: e.target.value })
                }
              />

              <input
                type="date"
                value={newProject.endDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, endDate: e.target.value })
                }
              />

              <select
                value={newProject.status}
                onChange={(e) =>
                  setNewProject({ ...newProject, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="onHold">On Hold</option>
                <option value="completed">Completed</option>
              </select>

              <button type="submit" style={styles.submitBtn}>
                Add Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  page: {
    padding: 24,
    position: "relative",
    background: "#f9f9f9",
    minHeight: "100vh",
  },
  board: {
    display: "flex",
    gap: 20,
  },
  column: {
    flex: 1,
    background: "#f3f3f3",
    padding: 16,
    borderRadius: 12,
    minHeight: 400,
  },
  heading: {
    marginBottom: 12,
    fontWeight: 600,
    fontSize: 16,
  },
  card: {
    background: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  addBtn: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: "50%",
    border: "none",
    background: "#ff4d4f",
    color: "#fff",
    fontSize: 28,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: 24,
    borderRadius: 10,
    width: 320,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  submitBtn: {
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default Projects;
