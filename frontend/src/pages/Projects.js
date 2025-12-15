import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Projects = ({ role = "Project Manager" }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const [projects, setProjects] = useState({
    Active: [
      { id: "1", name: "TourO Web Development", progress: 70 },
      { id: "2", name: "Dashboard Portal", progress: 45 },
      { id: "5", name: "Designing", progress: 55 },
    ],
    "On Hold": [
      { id: "3", name: "Client Onboarding", progress: 20 },
      { id: "6", name: "Legacy Migration", progress: 30 },
    ],
    Completed: [
      { id: "4", name: "Automation System", progress: 100 },
      { id: "7", name: "Marketing Dashboard", progress: 100 },
    ],
  });

  const [newProject, setNewProject] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "Active",
  });

  const findSection = (id) =>
    Object.keys(projects).find((key) =>
      projects[key].some((p) => p.id === id)
    );

  const onDragEnd = ({ active, over }) => {
    if (!over) return;

    const from = findSection(active.id);
    const to = findSection(over.id);
    if (!from || !to || from === to) return;

    const moved = projects[from].find((p) => p.id === active.id);

    setProjects((prev) => ({
      ...prev,
      [from]: prev[from].filter((p) => p.id !== active.id),
      [to]: [...prev[to], moved],
    }));
  };

  const handleAddProject = (e) => {
    e.preventDefault();

    const id = Date.now().toString();

    const project = {
      id,
      name: newProject.name,
      progress: newProject.status === "Completed" ? 100 : 0,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
    };

    setProjects((prev) => ({
      ...prev,
      [newProject.status]: [...prev[newProject.status], project],
    }));

    setNewProject({
      name: "",
      startDate: "",
      endDate: "",
      status: "Active",
    });

    setShowAddModal(false);
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Projects</h2>

          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            {Object.keys(projects).map((status) => (
              <section key={status} style={styles.section}>
                <h3 style={styles.sectionTitle}>{status} Projects</h3>

                <SortableContext
                  items={projects[status].map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={styles.cardGrid}>
                    {projects[status].map((p) => (
                      <SortableProjectCard
                        key={p.id}
                        project={p}
                        status={status}
                      />
                    ))}
                  </div>
                </SortableContext>
              </section>
            ))}
          </DndContext>
        </div>

        {/* Floating + Button */}
        <button style={styles.fab} onClick={() => setShowAddModal(true)}>
          +
        </button>

        {/* Add Project Modal */}
        {showAddModal && (
          <Modal title="Add Project" onClose={() => setShowAddModal(false)}>
            <form style={styles.form} onSubmit={handleAddProject}>
              <label>Project Name</label>
              <input
                type="text"
                required
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
              />

              <label>Start Date</label>
              <input
                type="date"
                required
                value={newProject.startDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, startDate: e.target.value })
                }
              />

              <label>End Date</label>
              <input
                type="date"
                value={newProject.endDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, endDate: e.target.value })
                }
              />

              <label>Status</label>
              <select
                value={newProject.status}
                onChange={(e) =>
                  setNewProject({ ...newProject, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>

              <button type="submit" style={styles.submitBtn}>
                Add Project
              </button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

/* === Sortable Card === */
const SortableProjectCard = ({ project, status }) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: project.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        flex: "1 1 300px",
        minWidth: "280px",
      }}
    >
      <Card>
        <div style={styles.cardHeader}>
          <h4 style={styles.projectTitle}>{project.name}</h4>
          <span
            style={{
              ...styles.badge,
              ...(status === "Active"
                ? styles.activeBadge
                : status === "On Hold"
                ? styles.holdBadge
                : styles.completedBadge),
            }}
          >
            {status}
          </span>
        </div>

        <div style={styles.progressOuter}>
          <div
            style={{
              ...styles.progressInner,
              width: `${project.progress}%`,
              backgroundColor:
                status === "Completed"
                  ? "#2e7d32"
                  : status === "On Hold"
                  ? "#fbc02d"
                  : "#c62828",
            }}
          />
        </div>

        <p style={styles.progressText}>{project.progress}% complete</p>
      </Card>
    </div>
  );
};

/* === Modal === */
const Modal = ({ title, children, onClose }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <div style={styles.modalHeader}>
        <h3>{title}</h3>
        <button onClick={onClose} style={styles.closeBtn}>
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

/* === Styles === */
const styles = {
  pageContainer: { display: "flex", height: "100vh", background: "#f9f9f9" },
  mainContent: { flex: 1, position: "relative", overflowY: "auto" },
  pageInner: { padding: "30px" },
  pageTitle: { fontSize: "1.5rem", marginBottom: "25px" },
  section: { marginBottom: "40px" },
  sectionTitle: { marginBottom: "15px", fontWeight: 600 },
  cardGrid: { display: "flex", gap: "20px", flexWrap: "wrap" },

  cardHeader: { display: "flex", justifyContent: "space-between" },
  projectTitle: { fontSize: "1rem", fontWeight: 600 },

  badge: {
    padding: "4px 10px",
    borderRadius: "5px",
    fontSize: "12px",
    color: "#fff",
  },
  activeBadge: { background: "#c62828" },
  holdBadge: { background: "#fbc02d", color: "#222" },
  completedBadge: { background: "#2e7d32" },

  progressOuter: {
    background: "#eee",
    borderRadius: "5px",
    height: "8px",
    marginTop: "10px",
  },
  progressInner: { height: "8px", borderRadius: "5px" },
  progressText: { fontSize: "0.85rem", marginTop: "6px" },

  fab: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    fontSize: "32px",
    background: "#c62828",
    color: "#fff",
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
  modal: { background: "#fff", padding: "25px", borderRadius: "10px" },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  closeBtn: { border: "none", background: "none", fontSize: "22px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  submitBtn: {
    background: "#c62828",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
  },
};

export default Projects;
